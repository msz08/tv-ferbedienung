/**
 * TV discovery & pairing routes.
 *
 *   GET  /api/tv/discover      -> list Android TVs found on the network
 *   POST /api/tv/pair/start    -> { host, name } : make the TV show a code
 *   POST /api/tv/pair/finish   -> { code }       : submit the on-screen code
 *   POST /api/tv/unpair        -> disconnect and forget the saved TV
 *   GET  /api/tv/status        -> current connection state
 *   GET  /api/tv/keys          -> list of supported remote buttons
 *   POST /api/tv/key           -> { key }  : press a remote button
 *   POST /api/tv/power         -> toggle power
 *   POST /api/tv/app           -> { link } : open an app / deep link
 *   GET  /api/tv/events        -> Server-Sent Events stream of live status
 */
import { Router } from "express";
import { discoverTvs } from "../tv/discovery.js";
import { tvManager, SUPPORTED_KEYS } from "../tv/manager.js";

const router = Router();

router.get("/tv/status", (req, res) => {
  res.json(tvManager.getStatus());
});

router.get("/tv/keys", (req, res) => {
  res.json({ keys: SUPPORTED_KEYS });
});

router.get("/tv/discover", async (req, res) => {
  try {
    const devices = await discoverTvs({ timeout: 4000 });
    res.json({ devices });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/tv/pair/start", async (req, res) => {
  const { host, name } = req.body ?? {};
  if (!host) {
    return res.status(400).json({ error: "A TV host/IP is required." });
  }
  try {
    const result = await tvManager.startPairing(host, name);
    res.json(result);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

router.post("/tv/pair/finish", async (req, res) => {
  const { code } = req.body ?? {};
  if (!code) {
    return res.status(400).json({ error: "The pairing code is required." });
  }
  try {
    const result = await tvManager.submitCode(String(code).trim());
    res.json({ status: "paired", ...result });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

router.post("/tv/unpair", (req, res) => {
  tvManager.unpair();
  res.json({ status: "unpaired" });
});

// --- Remote control commands ------------------------------------------------

router.post("/tv/key", (req, res) => {
  const { key } = req.body ?? {};
  if (!key) {
    return res.status(400).json({ error: "A key name is required." });
  }
  try {
    res.json(tvManager.sendKey(key));
  } catch (err) {
    res.status(409).json({ error: err.message });
  }
});

router.post("/tv/power", (req, res) => {
  try {
    res.json(tvManager.power());
  } catch (err) {
    res.status(409).json({ error: err.message });
  }
});

router.post("/tv/app", (req, res) => {
  const { link } = req.body ?? {};
  try {
    res.json(tvManager.launchApp(link));
  } catch (err) {
    res.status(409).json({ error: err.message });
  }
});

// --- Live status stream (Server-Sent Events) --------------------------------

router.get("/tv/events", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.flushHeaders?.();

  const send = (status) => res.write(`data: ${JSON.stringify(status)}\n\n`);

  // Push the current state immediately, then on every change.
  send(tvManager.getStatus());
  const onState = (status) => send(status);
  tvManager.on("state", onState);

  // Keep the connection alive through proxies/idle timeouts.
  const heartbeat = setInterval(() => res.write(": ping\n\n"), 25_000);

  req.on("close", () => {
    clearInterval(heartbeat);
    tvManager.off("state", onState);
  });
});

export default router;
