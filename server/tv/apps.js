/**
 * App shortcut catalog. The defaults below seed the launcher; users can edit
 * their own list, which is persisted in config.json. Every stored app is
 * normalized so the UI can render a tile and detect the foreground app.
 *
 * App entry shape: { name, link, short, color, match[] }
 *   - link:  a URL the app registers as a deep link (sent via sendAppLink)
 *   - short: 1-2 char label for the tile
 *   - match: lowercase substrings used to detect the current app
 */
export const DEFAULT_APPS = [
  { name: "YouTube", link: "https://www.youtube.com", short: "YT", color: "#FF0000", match: ["youtube"] },
  { name: "Netflix", link: "https://www.netflix.com/title", short: "N", color: "#E50914", match: ["netflix", "ninja"] },
  {
    name: "Prime Video",
    link: "https://app.primevideo.com",
    short: "PV",
    color: "#1399FF",
    match: ["primevideo", "amazonvideo", "amazon"],
  },
  { name: "Disney+", link: "https://www.disneyplus.com", short: "D+", color: "#113CCF", match: ["disney"] },
  { name: "Spotify", link: "spotify://", short: "S", color: "#1DB954", match: ["spotify"] },
  { name: "Twitch", link: "https://www.twitch.tv", short: "TW", color: "#9146FF", match: ["twitch"] },
];

const MAX_APPS = 24;

function initials(name) {
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

/** Derive foreground-detection substrings from the name and link host. */
function deriveMatch(name, link) {
  const tokens = new Set();
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (cleanName) tokens.add(cleanName);
  try {
    const host = new URL(link).hostname.replace(/^www\./, "");
    const base = host.split(".")[0];
    if (base) tokens.add(base.toLowerCase());
  } catch {
    /* non-URL links (e.g. spotify://) fall back to the name token */
  }
  return [...tokens];
}

/** Validate and normalize a single app entry; returns null if unusable. */
export function normalizeApp(app) {
  if (!app || typeof app !== "object") return null;
  const name = String(app.name ?? "").trim().slice(0, 40);
  const link = String(app.link ?? "").trim().slice(0, 400);
  if (!name || !link) return null;

  const short = (app.short ? String(app.short).trim() : "").slice(0, 3) || initials(name);
  const color = /^#[0-9a-fA-F]{6}$/.test(app.color) ? app.color : "#64748b";
  const match = Array.isArray(app.match) && app.match.length ? app.match.map(String) : deriveMatch(name, link);

  return { name, link, short, color, match };
}

/** Validate and normalize a full app list submitted by the client. */
export function normalizeApps(apps) {
  if (!Array.isArray(apps)) throw new Error("apps must be an array.");
  const normalized = apps.map(normalizeApp).filter(Boolean).slice(0, MAX_APPS);
  return normalized;
}
