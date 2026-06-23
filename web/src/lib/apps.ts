/**
 * Catalog of common Android TV apps. Launching uses sendAppLink with a URL
 * the app registers as a deep link. `match` holds substrings used to detect
 * whether the app is currently in the foreground (from status.currentApp,
 * which the TV reports as a package name or link).
 */
export interface AppEntry {
  name: string;
  link: string;
  /** Short label shown on the tile (initials). */
  short: string;
  /** Brand color for the tile. */
  color: string;
  /** Substrings that identify this app in the reported current app. */
  match: string[];
}

export const APPS: AppEntry[] = [
  {
    name: "YouTube",
    link: "https://www.youtube.com",
    short: "YT",
    color: "#FF0000",
    match: ["youtube"],
  },
  {
    name: "Netflix",
    link: "https://www.netflix.com/title",
    short: "N",
    color: "#E50914",
    match: ["netflix", "ninja"],
  },
  {
    name: "Prime Video",
    link: "https://app.primevideo.com",
    short: "PV",
    color: "#1399FF",
    match: ["primevideo", "amazonvideo", "amazon"],
  },
  {
    name: "Disney+",
    link: "https://www.disneyplus.com",
    short: "D+",
    color: "#113CCF",
    match: ["disney"],
  },
  {
    name: "Spotify",
    link: "spotify://",
    short: "S",
    color: "#1DB954",
    match: ["spotify"],
  },
  {
    name: "Twitch",
    link: "https://www.twitch.tv",
    short: "TW",
    color: "#9146FF",
    match: ["twitch"],
  },
];

/** Find the app that matches the TV's reported current app, if any. */
export function matchCurrentApp(currentApp: string | null): AppEntry | undefined {
  if (!currentApp) return undefined;
  const value = currentApp.toLowerCase();
  return APPS.find((app) => app.match.some((m) => value.includes(m)));
}
