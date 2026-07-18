import {
  isNativeApp,
  nativeClearTokens,
  nativeGetAccessToken,
  nativeGetRefreshToken,
  nativeSetTokens,
} from "./native";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/**
 * Dual auth:
 * - Browser: httpOnly cookies (credentials: include)
 * - Capacitor native: Bearer from Preferences (secure storage)
 */
export function apiUrl(path: string) {
  return `${API}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function apiFetch(path: string, init?: RequestInit) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };

  if (isNativeApp()) {
    const token = await nativeGetAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  return fetch(apiUrl(path), {
    ...init,
    credentials: "include",
    headers,
  });
}

export async function loginWithPassword(email: string, password: string) {
  const res = await fetch(apiUrl("/auth/login"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (res.ok && isNativeApp() && data.accessToken && data.refreshToken) {
    await nativeSetTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
  }
  return { res, data };
}

export async function registerWithPassword(input: {
  name: string;
  email: string;
  password: string;
}) {
  const res = await fetch(apiUrl("/auth/register"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (res.ok && isNativeApp() && data.accessToken && data.refreshToken) {
    await nativeSetTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
  }
  return { res, data };
}

/** Try refresh cookie or native refresh token; returns true if /auth/me succeeds. */
export async function ensureSession(): Promise<boolean> {
  let me = await apiFetch("/auth/me");
  if (me.ok) return true;

  if (isNativeApp()) {
    const refresh = await nativeGetRefreshToken();
    if (!refresh) return false;
    const refreshed = await fetch(apiUrl("/auth/refresh"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh }),
    });
    if (!refreshed.ok) {
      await nativeClearTokens();
      return false;
    }
    const data = await refreshed.json();
    if (data.accessToken && data.refreshToken) {
      await nativeSetTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
    }
  } else {
    const refreshed = await apiFetch("/auth/refresh", {
      method: "POST",
      body: "{}",
    });
    if (!refreshed.ok) return false;
  }

  me = await apiFetch("/auth/me");
  return me.ok;
}

export async function logout() {
  try {
    if (isNativeApp()) {
      const refresh = await nativeGetRefreshToken();
      await apiFetch("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken: refresh }),
      });
      await nativeClearTokens();
    } else {
      await apiFetch("/auth/logout", { method: "POST", body: "{}" });
    }
  } catch {
    /* ignore */
  }
}
