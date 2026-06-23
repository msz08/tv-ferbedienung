/**
 * TV discovery & pairing routes.
 *
 *   GET  /api/tv/discover      -> list Android TVs found on the network
 *   POST /api/tv/pair/start    -> { host, name } : make the TV show a code
 *   POST /api/tv/pair/finish   -> { code }       : submit the on-screen code
 *   POST /api/tv/unpair        -> disconnect and forget the saved TV
 *   GET  /api/tv/status        -> current connection state
 *
 * Remote-control command routes are added in the next phase.
 */
import { Router } from "express";
import { discoverTvs } from "../tv/discovery.js";
import { tvManager } from "../tv/manager.js";

const router = Router();

router.get("/tv/status", (req, res) => {
  res.json(tvManager.getStatus());
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

export default router;
