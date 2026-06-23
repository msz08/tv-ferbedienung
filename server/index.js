/**
 * Television Controller — backend entry point.
 *
 * Responsibilities:
 *   1. Serve the built React UI (web/dist) as static files.
 *   2. Expose a JSON API under /api for discovery, pairing and remote control.
 *
 * Routes for TV discovery, pairing and commands are added in later phases.
 */
import express from "express";
import cors from "cors";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync } from "node:fs";

import { config } from "./config.js";
import healthRoutes from "./routes/health.js";
import tvRoutes from "./routes/tv.js";
import { tvManager } from "./tv/manager.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WEB_DIST = join(__dirname, "..", "web", "dist");

const app = express();
app.use(cors());
app.use(express.json());

// --- API ------------------------------------------------------------------
app.use("/api", healthRoutes);
app.use("/api", tvRoutes);

// --- Static web UI ---------------------------------------------------------
if (existsSync(WEB_DIST)) {
  app.use(express.static(WEB_DIST));
  // SPA fallback: hand any non-API route to the React app.
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(join(WEB_DIST, "index.html"));
  });
} else {
  // Helpful message during development before the UI has been built.
  app.get("/", (req, res) => {
    res
      .status(200)
      .send(
        "<h1>Television Controller</h1>" +
          "<p>The web UI has not been built yet. Run <code>npm run build</code> from the project root.</p>"
      );
  });
}

const PORT = process.env.PORT || config.get("port") || 3000;

app.listen(PORT, () => {
  console.log(`\n  📺 Television Controller server running`);
  console.log(`     ➜  http://localhost:${PORT}\n`);

  // Try to silently reconnect to a previously paired TV. If it's currently
  // off/unreachable, keep retrying in the background until it comes back.
  tvManager
    .connectSaved()
    .then((status) => {
      if (status) console.log(`     ✓ Reconnected to ${status.name} (${status.host})`);
    })
    .catch((err) => {
      console.warn(`     ! Saved TV not reachable yet (${err.message}); will keep retrying`);
      tvManager.ensureReconnect();
    });
});
