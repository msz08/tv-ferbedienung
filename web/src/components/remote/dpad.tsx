import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DPadProps {
  onPress: (key: "dpad_up" | "dpad_down" | "dpad_left" | "dpad_right" | "select") => void;
}

const arrow =
  "flex items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:text-foreground";

/**
 * Directional pad: four arrows around a central OK button, laid out on a
 * 3x3 grid inside a soft circular surface.
 */
export function DPad({ onPress }: DPadProps) {
  return (
    <div className="relative mx-auto aspect-square w-60 rounded-full border bg-secondary/60 p-3 shadow-inner">
      <div className="grid h-full w-full grid-cols-3 grid-rows-3">
        <div />
        <button className={cn(arrow, "rounded-t-full")} aria-label="Up" onClick={() => onPress("dpad_up")}>
          <ChevronUp className="h-7 w-7" />
        </button>
        <div />

        <button className={cn(arrow, "rounded-l-full")} aria-label="Left" onClick={() => onPress("dpad_left")}>
          <ChevronLeft className="h-7 w-7" />
        </button>
        <div />
        <button className={cn(arrow, "rounded-r-full")} aria-label="Right" onClick={() => onPress("dpad_right")}>
          <ChevronRight className="h-7 w-7" />
        </button>

        <div />
        <button className={cn(arrow, "rounded-b-full")} aria-label="Down" onClick={() => onPress("dpad_down")}>
          <ChevronDown className="h-7 w-7" />
        </button>
        <div />
      </div>

      <motion.button
        type="button"
        aria-label="OK"
        onClick={() => onPress("select")}
        whileTap={{ scale: 0.92 }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
        className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border bg-primary text-sm font-semibold text-primary-foreground shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        OK
      </motion.button>
    </div>
  );
}
