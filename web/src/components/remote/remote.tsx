import {
  Power,
  Home,
  ChevronLeft,
  Volume2,
  VolumeX,
  Plus,
  Minus,
  Play,
  SkipBack,
  SkipForward,
  Rewind,
  FastForward,
} from "lucide-react";
import { RemoteButton } from "./remote-button";
import { DPad } from "./dpad";

interface RemoteProps {
  onKey: (key: string) => void;
  onPower: () => void;
  disabled?: boolean;
}

/** A vertical rocker (e.g. volume / channel) with +, label and -. */
function Rocker({
  label,
  icon,
  onUp,
  onDown,
}: {
  label: string;
  icon: React.ReactNode;
  onUp: () => void;
  onDown: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-full border bg-secondary/60 p-1.5">
      <RemoteButton label={`${label} up`} onPress={onUp} repeat className="h-11 w-11">
        <Plus className="h-5 w-5" />
      </RemoteButton>
      <div className="py-1 text-muted-foreground">{icon}</div>
      <RemoteButton label={`${label} down`} onPress={onDown} repeat className="h-11 w-11">
        <Minus className="h-5 w-5" />
      </RemoteButton>
    </div>
  );
}

/**
 * The full on-screen remote. Stateless: it just maps button presses to key
 * names and forwards them. Power is a dedicated toggle endpoint.
 */
export function Remote({ onKey, onPower, disabled }: RemoteProps) {
  const k = (key: string) => () => onKey(key);

  return (
    <div className="space-y-6">
      {/* Top controls: power, mute, home, back */}
      <div className="flex items-center justify-between">
        <RemoteButton label="Power" onPress={onPower} variant="danger" disabled={disabled} className="h-12 w-12">
          <Power className="h-5 w-5" />
        </RemoteButton>
        <div className="flex gap-2">
          <RemoteButton label="Mute" onPress={k("mute")} disabled={disabled} className="h-12 w-12">
            <VolumeX className="h-5 w-5" />
          </RemoteButton>
          <RemoteButton label="Back" onPress={k("back")} disabled={disabled} className="h-12 w-12">
            <ChevronLeft className="h-5 w-5" />
          </RemoteButton>
          <RemoteButton label="Home" onPress={k("home")} disabled={disabled} className="h-12 w-12">
            <Home className="h-5 w-5" />
          </RemoteButton>
        </div>
      </div>

      {/* Directional pad */}
      <div className={disabled ? "pointer-events-none opacity-40" : undefined}>
        <DPad onPress={(key) => onKey(key)} />
      </div>

      {/* Volume / Channel rockers */}
      <div className={`flex items-stretch justify-center gap-10 ${disabled ? "pointer-events-none opacity-40" : ""}`}>
        <Rocker label="Volume" icon={<Volume2 className="h-5 w-5" />} onUp={k("volume_up")} onDown={k("volume_down")} />
        <Rocker
          label="Channel"
          icon={<span className="text-xs font-semibold">CH</span>}
          onUp={k("channel_up")}
          onDown={k("channel_down")}
        />
      </div>

      {/* Media transport */}
      <div className="flex items-center justify-center gap-2">
        <RemoteButton label="Previous" onPress={k("previous")} disabled={disabled} className="h-11 w-11">
          <SkipBack className="h-4 w-4" />
        </RemoteButton>
        <RemoteButton label="Rewind" onPress={k("rewind")} repeat disabled={disabled} className="h-11 w-11">
          <Rewind className="h-4 w-4" />
        </RemoteButton>
        <RemoteButton
          label="Play or pause"
          onPress={k("play_pause")}
          variant="primary"
          disabled={disabled}
          className="h-14 w-14"
        >
          <Play className="h-5 w-5" />
        </RemoteButton>
        <RemoteButton label="Fast forward" onPress={k("fast_forward")} repeat disabled={disabled} className="h-11 w-11">
          <FastForward className="h-4 w-4" />
        </RemoteButton>
        <RemoteButton label="Next" onPress={k("next")} disabled={disabled} className="h-11 w-11">
          <SkipForward className="h-4 w-4" />
        </RemoteButton>
      </div>
    </div>
  );
}
