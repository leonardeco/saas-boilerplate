const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/**
 * Cookie-only auth client.
 * Relies on httpOnly cookies (nt_access / nt_refresh) with credentials: "include".
 * No tokens in localStorage.
 */
export function apiUrl(path: string) {
  return `${API}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function apiFetch(path: string, init?: RequestInit) {
  return fetch(apiUrl(path), {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

/** Try refresh cookie session; returns true if /auth/me succeeds. */
export async function ensureSession(): Promise<boolean> {
  const me = await apiFetch("/auth/me");
  if (me.ok) return true;
  const refreshed = await apiFetch("/auth/refresh", { method: "POST", body: "{}" });
  if (!refreshed.ok) return false;
  const me2 = await apiFetch("/auth/me");
  return me2.ok;
}

export async function logout() {
  try {
    await apiFetch("/auth/logout", { method: "POST", body: "{}" });
  } catch {
    /* ignore */
  }
}
