import { motion } from "framer-motion";
import { Moon, Sun, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { Remote } from "@/components/remote/remote";
import { api, ApiError } from "@/lib/api";

export default function App() {
  const { theme, toggleTheme } = useTheme();

  // Fire-and-forget command senders. Connection state and error surfacing
  // are wired up in the next phase.
  const handleKey = (key: string) => {
    api.sendKey(key).catch((err: ApiError) => console.warn(`key ${key}:`, err.message));
  };
  const handlePower = () => {
    api.power().catch((err: ApiError) => console.warn("power:", err.message));
  };

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
          <Remote onKey={handleKey} onPower={handlePower} />
        </motion.div>
      </main>
    </div>
  );
}
