const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/** Prefer cookies (credentials) + optional Bearer from localStorage for SPA. */
export function authHeaders(extra?: HeadersInit): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return { ...headers, ...(extra as Record<string, string>) };
}

export async function apiFetch(path: string, init?: RequestInit) {
  return fetch(`${API}${path.startsWith("/") ? path : `/${path}`}`, {
    ...init,
    credentials: "include",
    headers: {
      ...authHeaders(),
      ...(init?.headers ?? {}),
    },
  });
}
