import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { AppEntry } from "@/lib/apps";

/**
 * Loads the app shortcut list from the backend and persists edits. Updates are
 * optimistic: local state changes immediately, then saves to the server.
 */
export function useApps() {
  const [apps, setApps] = useState<AppEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getApps()
      .then((res) => setApps(res.apps))
      .catch(() => setApps([]))
      .finally(() => setLoading(false));
  }, []);

  const save = useCallback(async (next: AppEntry[]) => {
    setApps(next); // optimistic
    const res = await api.saveApps(next);
    setApps(res.apps); // adopt the normalized version from the server
  }, []);

  const reset = useCallback(async () => {
    const res = await api.resetApps();
    setApps(res.apps);
  }, []);

  return { apps, loading, save, reset };
}
