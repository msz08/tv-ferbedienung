/**
 * Thin client for the backend API. Same-origin in production (the server
 * serves the UI); proxied to :3000 by Vite during development.
 */
import type { AppEntry } from "@/lib/apps";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError((data as { error?: string }).error ?? res.statusText, res.status);
  }
  return data as T;
}

const post = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined });

export interface TvStatus {
  connected: boolean;
  pairing: boolean;
  saved: { host: string; name: string | null } | null;
  host: string | null;
  name: string | null;
  powered: boolean;
  volume: { level?: number; maximum?: number; muted?: boolean } | null;
  currentApp: string | null;
}

export interface TvDevice {
  name: string;
  host: string;
  port: number;
}

export const api = {
  getStatus: () => request<TvStatus>("/api/tv/status"),
  sendKey: (key: string) => post<{ sent: string }>("/api/tv/key", { key }),
  power: () => post<{ sent: string }>("/api/tv/power"),
  sendText: (text: string) => post<{ sent: number }>("/api/tv/text", { text }),
  launchApp: (link: string) => post<{ sent: string }>("/api/tv/app", { link }),

  // App shortcuts
  getApps: () => request<{ apps: AppEntry[] }>("/api/apps"),
  saveApps: (apps: AppEntry[]) => request<{ apps: AppEntry[] }>("/api/apps", { method: "PUT", body: JSON.stringify({ apps }) }),
  resetApps: () => post<{ apps: AppEntry[] }>("/api/apps/reset"),

  // Discovery & pairing
  discover: () => request<{ devices: TvDevice[] }>("/api/tv/discover"),
  pairStart: (host: string, name?: string) =>
    post<{ status: string; host: string; name: string }>("/api/tv/pair/start", { host, name }),
  pairFinish: (code: string) =>
    post<{ status: string; host: string; name: string }>("/api/tv/pair/finish", { code }),
  connect: () => post<TvStatus>("/api/tv/connect"),
  unpair: () => post<{ status: string }>("/api/tv/unpair"),
};

/**
 * Subscribe to live TV status over Server-Sent Events. Returns an
 * unsubscribe function. EventSource reconnects automatically on drop.
 */
export function subscribeStatus(onUpdate: (status: TvStatus) => void): () => void {
  const source = new EventSource("/api/tv/events");
  source.onmessage = (event) => {
    try {
      onUpdate(JSON.parse(event.data) as TvStatus);
    } catch {
      /* ignore malformed frames */
    }
  };
  return () => source.close();
}
