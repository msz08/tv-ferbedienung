/**
 * Health & status routes.
 *
 * `GET /api/health` is a simple liveness probe used by the launcher and the
 * frontend to confirm the server is up before opening the UI.
 */
import { Router } from "express";
import { config } from "../config.js";

const router = Router();

router.get("/health", (req, res) => {
  const tv = config.get("tv");
  res.json({
    status: "ok",
    uptime: process.uptime(),
    // Surface whether a TV has already been paired, without leaking secrets.
    pairedTv: tv ? { host: tv.host, name: tv.name ?? null } : null,
  });
});

export default router;
