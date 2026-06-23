/**
 * App shortcut routes.
 *
 *   GET  /api/apps        -> the user's app list (or the defaults if unset)
 *   PUT  /api/apps        -> { apps } : replace the list (validated/normalized)
 *   POST /api/apps/reset  -> restore the default catalog
 */
import { Router } from "express";
import { config } from "../config.js";
import { DEFAULT_APPS, normalizeApps } from "../tv/apps.js";

const router = Router();

router.get("/apps", (req, res) => {
  res.json({ apps: config.get("apps") ?? DEFAULT_APPS });
});

router.put("/apps", (req, res) => {
  try {
    const apps = normalizeApps(req.body?.apps);
    config.set({ apps });
    res.json({ apps });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/apps/reset", (req, res) => {
  config.set({ apps: null });
  res.json({ apps: DEFAULT_APPS });
});

export default router;
