import { useEffect } from "react";

interface Options {
  enabled: boolean;
  onKey: (key: string) => void;
  onPower: () => void;
}

// Physical key -> remote command. Multiple keys may map to one command.
const KEY_BINDINGS: Record<string, string> = {
  ArrowUp: "dpad_up",
  ArrowDown: "dpad_down",
  ArrowLeft: "dpad_left",
  ArrowRight: "dpad_right",
  Enter: "select",
  Backspace: "back",
  Escape: "back",
  " ": "play_pause",
  "+": "volume_up",
  "=": "volume_up",
  "-": "volume_down",
  m: "mute",
  M: "mute",
  h: "home",
  H: "home",
};

/**
 * Map the keyboard to the remote so it feels like a real one. Ignores key
 * presses while the user is typing in a field, and only runs when connected.
 */
export function useKeyboardRemote({ enabled, onKey, onPower }: Options) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      if (event.key === "p" || event.key === "P") {
        event.preventDefault();
        onPower();
        return;
      }

      const command = KEY_BINDINGS[event.key];
      if (!command) return;
      event.preventDefault();
      onKey(command);
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled, onKey, onPower]);
}
