/**
 * Normalize external POI names/phones for dedupe.
 */

export function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizePhoneCo(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) return null;
  // Prefer last 10 digits for CO mobiles
  if (digits.length >= 10) return digits.slice(-10);
  return digits;
}

export type ExternalPlace = {
  provider: "google_places" | "foursquare" | "osm" | "csv" | "manual";
  externalId: string;
  name: string;
  lat: number;
  lng: number;
  address?: string | null;
  phone?: string | null;
  ratingAvg?: number | null;
  ratingCount?: number | null;
  types?: string[];
  businessStatus?: string | null;
};

export function mapTypesToVenueType(
  types: string[] = [],
): "RESTAURANT" | "BAR" | "CLUB" | "MIXED" {
  const t = types.map((x) => x.toLowerCase());
  const isClub = t.some((x) => x.includes("night_club") || x.includes("nightclub"));
  const isBar = t.some((x) => x.includes("bar") || x.includes("pub") || x.includes("lounge"));
  const isRest = t.some(
    (x) => x.includes("restaurant") || x.includes("food") || x.includes("meal"),
  );
  if (isClub && (isRest || isBar)) return "MIXED";
  if (isClub) return "CLUB";
  if (isBar && isRest) return "MIXED";
  if (isBar) return "BAR";
  return "RESTAURANT";
}
