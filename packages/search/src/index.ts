import { MeiliSearch } from "meilisearch";

export const VENUES_INDEX = "venues";

export type VenueSearchDocument = {
  id: string;
  name: string;
  slug: string;
  type: string;
  citySlug: string;
  ratingAvg: number | null;
  ratingCount: number;
  qualityScore: number;
  curationBadge: boolean;
  bookingEnabled: boolean;
  _geo?: { lat: number; lng: number };
};

export function createSearchClient(host: string, apiKey: string) {
  return new MeiliSearch({ host, apiKey });
}

export async function ensureVenuesIndex(
  client: MeiliSearch,
): Promise<void> {
  try {
    await client.getIndex(VENUES_INDEX);
  } catch {
    await client.createIndex(VENUES_INDEX, { primaryKey: "id" });
  }

  const index = client.index(VENUES_INDEX);
  await index.updateFilterableAttributes([
    "type",
    "citySlug",
    "curationBadge",
    "bookingEnabled",
    "ratingAvg",
    "qualityScore",
  ]);
  await index.updateSortableAttributes([
    "qualityScore",
    "ratingAvg",
    "ratingCount",
  ]);
  await index.updateSearchableAttributes(["name", "slug", "citySlug"]);
}

export async function upsertVenueDocuments(
  client: MeiliSearch,
  docs: VenueSearchDocument[],
) {
  const index = client.index(VENUES_INDEX);
  return index.addDocuments(docs);
}
