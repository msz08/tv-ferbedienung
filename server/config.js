/**
 * Lightweight JSON-file config store.
 *
 * Persists everything we need to reconnect to a TV without re-pairing:
 *   - the TV's host/IP
 *   - the pairing certificate + private key returned by the TV
 *
 * The file lives next to this module as `config.json` and is gitignored,
 * because it contains the credentials that grant control over the TV.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = join(__dirname, "config.json");

const DEFAULT_CONFIG = {
  port: 3000,
  // The last successfully paired TV, e.g.
  // { host: "192.168.1.42", name: "Grundig TV", cert: "...", key: "..." }
  tv: null,
};

function read() {
  if (!existsSync(CONFIG_PATH)) return { ...DEFAULT_CONFIG };
  try {
    const raw = readFileSync(CONFIG_PATH, "utf8");
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch (err) {
    console.warn(`[config] Could not parse config.json, using defaults: ${err.message}`);
    return { ...DEFAULT_CONFIG };
  }
}

function write(config) {
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf8");
}

let cache = read();

export const config = {
  /** Return the whole config object (cached copy). */
  all() {
    return cache;
  },
  /** Read a single top-level key. */
  get(key) {
    return cache[key];
  },
  /** Merge `patch` into the config and persist it to disk. */
  set(patch) {
    cache = { ...cache, ...patch };
    write(cache);
    return cache;
  },
  /** Persist the paired TV credentials. */
  saveTv(tv) {
    return this.set({ tv });
  },
  /** Forget the paired TV (used when unpairing). */
  clearTv() {
    return this.set({ tv: null });
  },
  path: CONFIG_PATH,
};
