/**
 * Thin client for the backend API. Same-origin in production (the server
 * serves the UI); proxied to :3000 by Vite during development.
 */

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
  host: string | null;
  name: string | null;
  powered: boolean;
  volume: { level?: number; max?: number; muted?: boolean } | null;
  currentApp: string | null;
}

export const api = {
  getStatus: () => request<TvStatus>("/api/tv/status"),
  sendKey: (key: string) => post<{ sent: string }>("/api/tv/key", { key }),
  power: () => post<{ sent: string }>("/api/tv/power"),
  launchApp: (link: string) => post<{ sent: string }>("/api/tv/app", { link }),
};
