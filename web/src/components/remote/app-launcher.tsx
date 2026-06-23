import { useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Check, Plus, X, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { matchCurrentApp, APP_COLORS, type AppEntry } from "@/lib/apps";

interface AppLauncherProps {
  apps: AppEntry[];
  currentApp: string | null;
  onLaunch: (link: string) => void;
  onSave: (apps: AppEntry[]) => void;
  onReset: () => void;
}

function quickShort(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const value = words.length >= 2 ? words[0][0] + words[1][0] : name.slice(0, 2);
  return value.toUpperCase();
}

/** Grid of app shortcuts with an edit mode to add, remove and reorder them. */
export function AppLauncher({ apps, currentApp, onLaunch, onSave, onReset }: AppLauncherProps) {
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const active = matchCurrentApp(apps, currentApp);

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= apps.length) return;
    const next = [...apps];
    [next[index], next[target]] = [next[target], next[index]];
    onSave(next);
  };

  const remove = (index: number) => onSave(apps.filter((_, i) => i !== index));

  const addApp = (name: string, link: string, color: string) => {
    onSave([...apps, { name, link, color, short: quickShort(name), match: [] }]);
    setAdding(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Apps</h3>
        <div className="flex items-center gap-1">
          {editing && (
            <Button variant="ghost" size="sm" onClick={onReset} className="h-7 gap-1 px-2 text-xs text-muted-foreground">
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditing((e) => !e);
              setAdding(false);
            }}
            className="h-7 gap-1 px-2 text-xs text-muted-foreground"
          >
            {editing ? <Check className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
            {editing ? "Done" : "Edit"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {apps.map((app, index) => (
          <AppTile
            key={`${app.name}-${index}`}
            app={app}
            index={index}
            count={apps.length}
            editing={editing}
            isActive={active?.name === app.name}
            onLaunch={onLaunch}
            onMove={move}
            onRemove={remove}
          />
        ))}

        {editing && (
          <button
            onClick={() => setAdding((a) => !a)}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-3 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs font-medium">Add</span>
          </button>
        )}
      </div>

      {adding && <AddAppForm onAdd={addApp} onCancel={() => setAdding(false)} />}
    </div>
  );
}

function AppTile({
  app,
  index,
  count,
  editing,
  isActive,
  onLaunch,
  onMove,
  onRemove,
}: {
  app: AppEntry;
  index: number;
  count: number;
  editing: boolean;
  isActive: boolean;
  onLaunch: (link: string) => void;
  onMove: (index: number, dir: -1 | 1) => void;
  onRemove: (index: number) => void;
}) {
  const tile = (
    <>
      <span
        className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white shadow-sm"
        style={{ backgroundColor: app.color }}
      >
        {app.short}
      </span>
      <span className="truncate text-xs font-medium">{app.name}</span>
    </>
  );

  if (editing) {
    return (
      <div className="relative flex flex-col items-center gap-2 rounded-xl border p-3">
        <button
          onClick={() => onRemove(index)}
          aria-label={`Remove ${app.name}`}
          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow"
        >
          <X className="h-3 w-3" />
        </button>
        {tile}
        <div className="flex w-full justify-between">
          <button
            onClick={() => onMove(index, -1)}
            disabled={index === 0}
            aria-label="Move left"
            className="text-muted-foreground disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => onMove(index, 1)}
            disabled={index === count - 1}
            aria-label="Move right"
            className="text-muted-foreground disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

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
      {tile}
    </motion.button>
  );
}

function AddAppForm({
  onAdd,
  onCancel,
}: {
  onAdd: (name: string, link: string, color: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [color, setColor] = useState(APP_COLORS[0]);

  const submit = () => {
    if (name.trim() && link.trim()) onAdd(name.trim(), link.trim(), color);
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="space-y-3 overflow-hidden rounded-xl border bg-secondary/40 p-3"
    >
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="App name (e.g. Plex)" />
      <Input
        value={link}
        onChange={(e) => setLink(e.target.value)}
        placeholder="App link (e.g. https://www.plex.tv)"
      />
      <div className="flex flex-wrap gap-1.5">
        {APP_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            aria-label={`Color ${c}`}
            className={cn("h-6 w-6 rounded-full border-2", color === c ? "border-foreground" : "border-transparent")}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button onClick={submit} disabled={!name.trim() || !link.trim()} className="flex-1">
          Add
        </Button>
      </div>
    </motion.div>
  );
}
