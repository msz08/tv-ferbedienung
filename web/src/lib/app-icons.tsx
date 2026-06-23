import type { ComponentType } from "react";
import { SiYoutube, SiNetflix, SiSpotify, SiTwitch, SiAppletv, SiPlex, SiHbo, SiMax } from "react-icons/si";
import { PrimeVideoLogo, DisneyPlusLogo } from "@/lib/app-logos";
import type { AppEntry } from "@/lib/apps";

/**
 * Real brand logos for known apps (white glyph on the tile's brand color).
 * Apps without a known logo fall back to their initials. Only brands with an
 * official Simple Icons glyph are included; others stay on initials.
 */
const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  youtube: SiYoutube,
  netflix: SiNetflix,
  primevideo: PrimeVideoLogo,
  disney: DisneyPlusLogo,
  spotify: SiSpotify,
  twitch: SiTwitch,
  appletv: SiAppletv,
  plex: SiPlex,
  hbo: SiHbo,
  max: SiMax,
};

/** Resolve a brand logo for an app by its name and match tokens, if any. */
export function resolveAppIcon(app: AppEntry): ComponentType<{ className?: string }> | null {
  const name = app.name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const tokens = [name, ...app.match.map((m) => m.toLowerCase())];
  for (const key of Object.keys(ICONS)) {
    if (tokens.some((t) => t.includes(key))) return ICONS[key];
  }
  return null;
}
