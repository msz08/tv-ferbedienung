import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useHoldRepeat } from "@/hooks/use-hold-repeat";

interface DPadProps {
  onPress: (key: "dpad_up" | "dpad_down" | "dpad_left" | "dpad_right" | "select") => void;
}

const arrow =
  "flex items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:text-foreground";

/** A directional arrow that repeats while held (e.g. fast scrolling lists). */
function Arrow({
  label,
  className,
  onPress,
  children,
}: {
  label: string;
  className: string;
  onPress: () => void;
  children: React.ReactNode;
}) {
  const hold = useHoldRepeat(onPress);
  return (
    <button
      className={cn(arrow, className)}
      aria-label={label}
      {...hold}
      onClick={(e) => e.detail === 0 && onPress()}
    >
      {children}
    </button>
  );
}

/**
 * Directional pad: four arrows around a central OK button, laid out on a
 * 3x3 grid inside a soft circular surface.
 */
export function DPad({ onPress }: DPadProps) {
  return (
    <div className="relative mx-auto aspect-square w-52 rounded-full border bg-secondary/60 p-3 shadow-inner">
      <div className="grid h-full w-full grid-cols-3 grid-rows-3">
        <div />
        <Arrow label="Up" className="rounded-t-full" onPress={() => onPress("dpad_up")}>
          <ChevronUp className="h-7 w-7" />
        </Arrow>
        <div />

        <Arrow label="Left" className="rounded-l-full" onPress={() => onPress("dpad_left")}>
          <ChevronLeft className="h-7 w-7" />
        </Arrow>
        <div />
        <Arrow label="Right" className="rounded-r-full" onPress={() => onPress("dpad_right")}>
          <ChevronRight className="h-7 w-7" />
        </Arrow>

        <div />
        <Arrow label="Down" className="rounded-b-full" onPress={() => onPress("dpad_down")}>
          <ChevronDown className="h-7 w-7" />
        </Arrow>
        <div />
      </div>

      <motion.button
        type="button"
        aria-label="OK"
        onClick={() => onPress("select")}
        whileTap={{ scale: 0.92 }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
        className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border bg-primary text-sm font-semibold text-primary-foreground shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        OK
      </motion.button>
    </div>
  );
}
