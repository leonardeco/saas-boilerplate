import type { ExternalPlace } from "@saas/domain";
import type { PlaceProvider } from "./types.js";

/** Deterministic mock POIs for local/dev without API keys. */
export const mockProvider: PlaceProvider = {
  name: "mock",
  async searchCity({ citySlug, lat, lng }) {
    const base: ExternalPlace[] = [
      {
        provider: "manual",
        externalId: `${citySlug}-mock-rest-1`,
        name: `Casa Demo ${citySlug}`,
        lat: lat + 0.01,
        lng: lng + 0.01,
        address: `Centro ${citySlug}`,
        phone: "3001234567",
        ratingAvg: 4.5,
        ratingCount: 120,
        types: ["restaurant"],
        businessStatus: "OPERATIONAL",
      },
      {
        provider: "manual",
        externalId: `${citySlug}-mock-bar-1`,
        name: `Bar Noche ${citySlug}`,
        lat: lat - 0.008,
        lng: lng + 0.005,
        address: `Zona rosa ${citySlug}`,
        ratingAvg: 4.3,
        ratingCount: 88,
        types: ["bar"],
        businessStatus: "OPERATIONAL",
      },
      {
        provider: "manual",
        externalId: `${citySlug}-mock-club-1`,
        name: `Club Pulse ${citySlug}`,
        lat: lat + 0.004,
        lng: lng - 0.006,
        address: `Distrito ${citySlug}`,
        ratingAvg: 4.1,
        ratingCount: 45,
        types: ["night_club"],
        businessStatus: "OPERATIONAL",
      },
    ];
    return base;
  },
};
