import type { ExternalPlace } from "@saas/domain";
import type { PlaceProvider } from "./types.js";

/**
 * OpenStreetMap Overpass — legal open data.
 * Best-effort; fails soft if network blocked.
 */
export const osmProvider: PlaceProvider = {
  name: "osm",
  async searchCity({ lat, lng, radiusMeters = 3000 }) {
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"~"restaurant|bar|nightclub|pub"](around:${radiusMeters},${lat},${lng});
        way["amenity"~"restaurant|bar|nightclub|pub"](around:${radiusMeters},${lat},${lng});
      );
      out center 40;
    `;
    try {
      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query,
        headers: { "Content-Type": "text/plain" },
      });
      if (!res.ok) return [];
      const data = (await res.json()) as {
        elements: Array<{
          id: number;
          lat?: number;
          lon?: number;
          center?: { lat: number; lon: number };
          tags?: Record<string, string>;
        }>;
      };
      return data.elements
        .map((el): ExternalPlace | null => {
          const plat = el.lat ?? el.center?.lat;
          const plng = el.lon ?? el.center?.lon;
          const name = el.tags?.name;
          if (plat == null || plng == null || !name) return null;
          const amenity = el.tags?.amenity ?? "restaurant";
          return {
            provider: "osm",
            externalId: String(el.id),
            name,
            lat: plat,
            lng: plng,
            address: el.tags?.["addr:street"] ?? null,
            phone: el.tags?.phone ?? null,
            ratingAvg: null,
            ratingCount: 0,
            types: [amenity],
            businessStatus: "OPERATIONAL",
          };
        })
        .filter((x): x is ExternalPlace => x != null);
    } catch {
      return [];
    }
  },
};
