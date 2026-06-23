import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useHoldRepeat } from "@/hooks/use-hold-repeat";

interface RemoteButtonProps {
  label: string;
  onPress: () => void;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "primary" | "danger";
  disabled?: boolean;
  /** Repeat the press while held (e.g. volume, seeking). */
  repeat?: boolean;
}

const variants = {
  default: "bg-secondary text-secondary-foreground hover:bg-accent",
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  danger: "bg-secondary text-destructive hover:bg-destructive hover:text-destructive-foreground",
};

/**
 * A single remote key: tactile press feedback via Framer Motion, accessible
 * label, and a subtle hover state. Layout/shape is set by the caller.
 */
export function RemoteButton({
  label,
  onPress,
  children,
  className,
  variant = "default",
  disabled,
  repeat = false,
}: RemoteButtonProps) {
  const hold = useHoldRepeat(onPress);

  // When repeating, pointer input drives the hold handlers; onClick is kept
  // only for keyboard activation (detail === 0) to stay accessible.
  const interaction = repeat
    ? { ...hold, onClick: (e: React.MouseEvent) => e.detail === 0 && onPress() }
    : { onClick: onPress };

  return (
    <motion.button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      {...interaction}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 500, damping: 28 }}
      className={cn(
        "flex select-none items-center justify-center rounded-2xl border shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-40",
        variants[variant],
        className
      )}
    >
      {children}
    </motion.button>
  );
}
