import { motion } from "framer-motion";
import { Moon, Sun, Tv, Power, Loader2, Unplug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { Remote } from "@/components/remote/remote";
import { AppLauncher } from "@/components/remote/app-launcher";
import { Keypad } from "@/components/remote/keypad";
import { VolumeBar } from "@/components/remote/volume-bar";
import { Connect } from "@/components/connect/connect";
import { matchCurrentApp } from "@/lib/apps";
import { useToast } from "@/components/ui/toast";
import { useTvStatus } from "@/hooks/use-tv-status";
import { useKeyboardRemote } from "@/hooks/use-keyboard-remote";
import { api, ApiError } from "@/lib/api";

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const status = useTvStatus();
  const connected = status?.connected ?? false;

  const handleKey = (key: string) => {
    api.sendKey(key).catch((err: ApiError) => toast(err.message));
  };
  const handlePower = () => {
    api.power().catch((err: ApiError) => toast(err.message));
  };
  const handleDisconnect = () => {
    api.unpair().catch((err: ApiError) => toast(err.message));
  };
  const handleLaunch = (link: string) => {
    api.launchApp(link).catch((err: ApiError) => toast(err.message));
  };
  const handleText = (text: string) => {
    api.sendText(text).catch((err: ApiError) => toast(err.message));
  };

  useKeyboardRemote({ enabled: connected, onKey: handleKey, onPower: handlePower });

  return (
    <div className="min-h-screen w-full bg-background">
      <header className="mx-auto flex max-w-md items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2">
          <Tv className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-semibold tracking-tight">Television Controller</span>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </header>

      <main className="mx-auto max-w-md px-5 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="rounded-2xl border bg-card p-6 text-card-foreground shadow-sm"
        >
          {status === null ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Connecting…
            </div>
          ) : status.connected ? (
            <div className="space-y-6">
              {/* Connection status bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </span>
                  <div className="leading-tight">
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      {status.name ?? "Android TV"}
                      {status.powered === false && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Power className="h-3 w-3" /> standby
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {status.currentApp
                        ? (matchCurrentApp(status.currentApp)?.name ?? status.currentApp)
                        : status.host}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleDisconnect} className="gap-1.5 text-muted-foreground">
                  <Unplug className="h-3.5 w-3.5" />
                  Disconnect
                </Button>
              </div>

              <VolumeBar volume={status.volume} onKey={handleKey} />

              <Remote onKey={handleKey} onPower={handlePower} />

              <div className="border-t pt-5">
                <Keypad onKey={handleKey} onText={handleText} />
              </div>

              <div className="border-t pt-5">
                <AppLauncher onLaunch={handleLaunch} currentApp={status.currentApp} />
              </div>

              <p className="text-center text-xs text-muted-foreground">
                Tip: use your keyboard — arrows to navigate, Enter to select, Space to play/pause.
              </p>
            </div>
          ) : (
            <Connect saved={status.saved} />
          )}
        </motion.div>
      </main>
    </div>
  );
}
