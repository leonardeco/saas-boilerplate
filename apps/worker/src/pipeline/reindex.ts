import { eq } from "drizzle-orm";
import { db, venues, geoCities } from "@saas/db";
import {
  createSearchClient,
  ensureVenuesIndex,
  upsertVenueDocuments,
  type VenueSearchDocument,
} from "@saas/search";

export async function reindexPublishedVenues() {
  const host = process.env.MEILI_HOST;
  const key = process.env.MEILI_MASTER_KEY ?? "dev-master-key-change-me";
  if (!host) {
    console.log("[reindex] MEILI_HOST not set — skip");
    return { indexed: 0 };
  }

  const client = createSearchClient(host, key);
  await ensureVenuesIndex(client);

  const rows = await db
    .select({
      id: venues.id,
      name: venues.name,
      slug: venues.slug,
      type: venues.type,
      ratingAvg: venues.ratingAvg,
      ratingCount: venues.ratingCount,
      qualityScore: venues.qualityScore,
      curationBadge: venues.curationBadge,
      bookingEnabled: venues.bookingEnabled,
      lat: venues.lat,
      lng: venues.lng,
      cityId: venues.cityId,
    })
    .from(venues)
    .where(eq(venues.status, "PUBLISHED"));

  const cityMap = new Map<string, string>();
  const cities = await db.select().from(geoCities);
  for (const c of cities) cityMap.set(c.id, c.slug);

  const docs: VenueSearchDocument[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    type: r.type,
    citySlug: cityMap.get(r.cityId) ?? "unknown",
    ratingAvg: r.ratingAvg,
    ratingCount: r.ratingCount,
    qualityScore: r.qualityScore,
    curationBadge: r.curationBadge,
    bookingEnabled: r.bookingEnabled,
    _geo: { lat: r.lat, lng: r.lng },
  }));

  if (docs.length) await upsertVenueDocuments(client, docs);
  return { indexed: docs.length };
}
