import { useEffect, useState } from "react";
import { subscribeStatus, type TvStatus } from "@/lib/api";

/**
 * Live TV status, kept in sync with the backend over Server-Sent Events.
 * `null` until the first frame arrives.
 */
export function useTvStatus(): TvStatus | null {
  const [status, setStatus] = useState<TvStatus | null>(null);

  useEffect(() => subscribeStatus(setStatus), []);

  return status;
}
