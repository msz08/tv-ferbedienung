import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { APPS, matchCurrentApp, type AppEntry } from "@/lib/apps";

interface AppLauncherProps {
  onLaunch: (link: string) => void;
  currentApp: string | null;
}

/** Grid of one-tap app shortcuts; the active app gets a highlighted ring. */
export function AppLauncher({ onLaunch, currentApp }: AppLauncherProps) {
  const active = matchCurrentApp(currentApp);

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Apps</h3>
      <div className="grid grid-cols-3 gap-2">
        {APPS.map((app) => (
          <AppTile key={app.name} app={app} isActive={active?.name === app.name} onLaunch={onLaunch} />
        ))}
      </div>
    </div>
  );
}

function AppTile({
  app,
  isActive,
  onLaunch,
}: {
  app: AppEntry;
  isActive: boolean;
  onLaunch: (link: string) => void;
}) {
  return (
    <motion.button
      type="button"
      aria-label={`Open ${app.name}`}
      title={`Open ${app.name}`}
      onClick={() => onLaunch(app.link)}
      whileTap={{ scale: 0.94 }}
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 500, damping: 28 }}
      className={cn(
        "flex flex-col items-center gap-2 rounded-xl border p-3 transition-colors hover:bg-accent",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        isActive && "ring-2 ring-primary"
      )}
    >
      <span
        className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white shadow-sm"
        style={{ backgroundColor: app.color }}
      >
        {app.short}
      </span>
      <span className="truncate text-xs font-medium">{app.name}</span>
    </motion.button>
  );
}
