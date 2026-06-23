import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// During development the UI runs on Vite's dev server (5173) and proxies API
// calls to the backend on 3000. In production the backend serves the built
// files from web/dist, so requests are same-origin and no proxy is needed.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
  build: {
    outDir: "dist",
  },
});
