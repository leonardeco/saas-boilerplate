import type { ExternalPlace } from "@saas/domain";

export type PlaceProvider = {
  name: string;
  searchCity(params: {
    citySlug: string;
    lat: number;
    lng: number;
    radiusMeters?: number;
  }): Promise<ExternalPlace[]>;
};
