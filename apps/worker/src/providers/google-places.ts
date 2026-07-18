import type { ExternalPlace } from "@saas/domain";
import type { PlaceProvider } from "./types.js";

/**
 * Google Places Nearby Search (New/Legacy text). Requires GOOGLE_PLACES_API_KEY.
 * Returns [] when key missing — never throws for missing config.
 */
export const googlePlacesProvider: PlaceProvider = {
  name: "google_places",
  async searchCity({ lat, lng, radiusMeters = 2500 }) {
    const key = process.env.GOOGLE_PLACES_API_KEY;
    if (!key) return [];

    const url = new URL(
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
    );
    url.searchParams.set("location", `${lat},${lng}`);
    url.searchParams.set("radius", String(radiusMeters));
    url.searchParams.set("type", "restaurant");
    url.searchParams.set("key", key);

    try {
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = (await res.json()) as {
        results?: Array<{
          place_id: string;
          name: string;
          geometry: { location: { lat: number; lng: number } };
          rating?: number;
          user_ratings_total?: number;
          vicinity?: string;
          types?: string[];
          business_status?: string;
        }>;
      };
      return (data.results ?? []).map(
        (r): ExternalPlace => ({
          provider: "google_places",
          externalId: r.place_id,
          name: r.name,
          lat: r.geometry.location.lat,
          lng: r.geometry.location.lng,
          address: r.vicinity ?? null,
          ratingAvg: r.rating ?? null,
          ratingCount: r.user_ratings_total ?? 0,
          types: r.types ?? ["restaurant"],
          businessStatus: r.business_status ?? "OPERATIONAL",
        }),
      );
    } catch {
      return [];
    }
  },
};
