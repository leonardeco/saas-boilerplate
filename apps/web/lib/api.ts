const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function apiUrl(path: string) {
  return `${API}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(apiUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    next: init?.cache === "no-store" ? undefined : { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${path}`);
  }
  return res.json() as Promise<T>;
}

export type City = {
  name: string;
  slug: string;
  isMajor: boolean;
  activationWave: string;
  departmentName: string;
  lat: number;
  lng: number;
};

export type VenueCard = {
  id: string;
  name: string;
  slug: string;
  type: string;
  address: string | null;
  ratingAvg: number | null;
  ratingCount: number;
  qualityScore: number;
  curationBadge: boolean;
  bookingEnabled: boolean;
  citySlug: string;
  description: string | null;
  minAge?: number | null;
  coverAmount?: number | null;
};
