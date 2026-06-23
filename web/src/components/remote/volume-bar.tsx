import { motion } from "framer-motion";
import { Volume1, Volume2, VolumeX, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TvStatus } from "@/lib/api";

interface VolumeBarProps {
  volume: TvStatus["volume"];
  onKey: (key: string) => void;
}

/**
 * Live volume indicator driven by the TV's own state, with mute and +/-.
 * The TV reports an absolute level/maximum, so the bar always reflects the
 * real on-screen volume rather than a local guess.
 */
export function VolumeBar({ volume, onKey }: VolumeBarProps) {
  const known = volume != null;
  const level = volume?.level ?? 0;
  const maximum = volume?.maximum && volume.maximum > 0 ? volume.maximum : 100;
  const muted = volume?.muted ?? false;
  const percent = muted ? 0 : Math.round((level / maximum) * 100);
  const label = !known ? "—" : muted ? "Muted" : `${percent}%`;

  const VolumeIcon = muted ? VolumeX : percent < 50 ? Volume1 : Volume2;

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onKey("mute")}
        aria-label={muted ? "Unmute" : "Mute"}
        title={muted ? "Unmute" : "Mute"}
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors hover:bg-accent",
          muted && "text-destructive"
        )}
      >
        <VolumeIcon className="h-4 w-4" />
      </button>

      <div className="flex flex-1 items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: known ? `${percent}%` : "0%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>
        <span className="w-9 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{label}</span>
      </div>

      <div className="flex shrink-0 gap-1">
        <button
          onClick={() => onKey("volume_down")}
          aria-label="Volume down"
          className="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors hover:bg-accent"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          onClick={() => onKey("volume_up")}
          aria-label="Volume up"
          className="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors hover:bg-accent"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
