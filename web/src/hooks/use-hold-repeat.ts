import { useCallback, useEffect, useRef } from "react";

interface Options {
  /** Delay before auto-repeat kicks in, in ms. */
  delay?: number;
  /** Interval between repeats once held, in ms. */
  interval?: number;
}

/**
 * Press-and-hold helper: fires `onTrigger` once immediately, then repeats it
 * while the button stays pressed. Returns pointer handlers to spread onto a
 * button. Repeating plain key presses (rather than a held key) avoids any risk
 * of a "stuck" key if the release event is ever missed.
 *
 * Keyboard activation is handled separately by the caller's onClick, so this
 * only wires pointer (mouse/touch/pen) interactions.
 */
export function useHoldRepeat(onTrigger: () => void, { delay = 400, interval = 110 }: Options = {}) {
  const callback = useRef(onTrigger);
  callback.current = onTrigger;

  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const repeat = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (timeout.current) {
      clearTimeout(timeout.current);
      timeout.current = null;
    }
    if (repeat.current) {
      clearInterval(repeat.current);
      repeat.current = null;
    }
  }, []);

  const start = useCallback(() => {
    stop();
    callback.current();
    timeout.current = setTimeout(() => {
      repeat.current = setInterval(() => callback.current(), interval);
    }, delay);
  }, [delay, interval, stop]);

  // Clean up timers if the button unmounts while held.
  useEffect(() => stop, [stop]);

  return {
    onPointerDown: (event: React.PointerEvent) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture?.(event.pointerId);
      start();
    },
    onPointerUp: stop,
    onPointerCancel: stop,
    onPointerLeave: stop,
  };
}
