import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Delete, CornerDownLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface KeypadProps {
  onKey: (key: string) => void;
  onText: (text: string) => void;
}

const DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

/**
 * Collapsible number pad and search box. Digits enter channel numbers; the
 * search field "types" text into the focused field on the TV.
 */
export function Keypad({ onKey, onText }: KeypadProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  const submit = () => {
    const value = text.trim();
    if (!value) return;
    onText(value);
    setText("");
  };

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-xs font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
      >
        Number pad &amp; search
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pt-4">
              {/* Search */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onKey("search")}
                  aria-label="Open search on TV"
                  title="Open search on TV"
                  className="shrink-0"
                >
                  <Search className="h-4 w-4" />
                </Button>
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type to search on TV…"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submit();
                  }}
                />
                <Button onClick={submit} disabled={!text.trim()}>
                  Send
                </Button>
              </div>

              {/* Number grid */}
              <div className="grid grid-cols-3 gap-2">
                {DIGITS.map((d) => (
                  <KeypadKey key={d} label={d} onPress={() => onKey(d)}>
                    {d}
                  </KeypadKey>
                ))}
                <KeypadKey label="Backspace" onPress={() => onKey("delete")}>
                  <Delete className="h-5 w-5" />
                </KeypadKey>
                <KeypadKey label="0" onPress={() => onKey("0")}>
                  0
                </KeypadKey>
                <KeypadKey label="Enter" onPress={() => onKey("enter")}>
                  <CornerDownLeft className="h-5 w-5" />
                </KeypadKey>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function KeypadKey({
  label,
  onPress,
  children,
}: {
  label: string;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onPress}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 500, damping: 28 }}
      className="flex h-12 items-center justify-center rounded-xl border bg-secondary/60 text-lg font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {children}
    </motion.button>
  );
}
