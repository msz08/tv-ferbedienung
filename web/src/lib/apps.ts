/**
 * App shortcut types and helpers. The actual catalog is owned by the backend
 * (defaults + the user's saved edits) and fetched at runtime.
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

/** Find the app in `apps` that matches the TV's reported current app, if any. */
export function matchCurrentApp(apps: AppEntry[], currentApp: string | null): AppEntry | undefined {
  if (!currentApp) return undefined;
  const value = currentApp.toLowerCase();
  return apps.find((app) => app.match.some((m) => value.includes(m)));
}

/** Preset tile colors offered when adding a custom app. */
export const APP_COLORS = [
  "#FF0000",
  "#E50914",
  "#1399FF",
  "#113CCF",
  "#1DB954",
  "#9146FF",
  "#F97316",
  "#0EA5E9",
  "#64748b",
];
