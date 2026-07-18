import { createHash } from "node:crypto";
import { eq, and } from "drizzle-orm";
import {
  db,
  venues,
  venueSources,
  rawPlacePayloads,
  geoCities,
} from "@saas/db";
import {
  computeQualityScore,
  mapTypesToVenueType,
  normalizeName,
  type ExternalPlace,
} from "@saas/domain";

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export async function publishPlaces(
  citySlug: string,
  places: ExternalPlace[],
): Promise<{ created: number; updated: number; skipped: number }> {
  const city = await db.query.geoCities.findFirst({
    where: eq(geoCities.slug, citySlug),
  });
  if (!city) throw new Error(`CITY_NOT_FOUND:${citySlug}`);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const place of places) {
    const hash = createHash("sha256")
      .update(JSON.stringify(place))
      .digest("hex")
      .slice(0, 32);

    await db.insert(rawPlacePayloads).values({
      provider: place.provider,
      externalId: place.externalId,
      payload: place,
    });

    const existingSource = await db
      .select()
      .from(venueSources)
      .where(
        and(
          eq(venueSources.provider, place.provider),
          eq(venueSources.externalId, place.externalId),
        ),
      )
      .limit(1);

    const quality = computeQualityScore({
      ratingAvg: place.ratingAvg ?? null,
      ratingCount: place.ratingCount ?? 0,
      curationBadge: false,
      operational: place.businessStatus !== "CLOSED_PERMANENTLY",
    });

    const type = mapTypesToVenueType(place.types);
    const baseSlug = `${slugify(place.name)}-${citySlug}`;

    if (existingSource[0]) {
      await db
        .update(venues)
        .set({
          ratingAvg: place.ratingAvg ?? undefined,
          ratingCount: place.ratingCount ?? 0,
          qualityScore: quality.score,
          status: quality.isPublishablePremium ? "PUBLISHED" : "DRAFT",
          updatedAt: new Date(),
        })
        .where(eq(venues.id, existingSource[0].venueId));
      await db
        .update(venueSources)
        .set({ lastSyncedAt: new Date(), rawHash: hash })
        .where(eq(venueSources.id, existingSource[0].id));
      updated++;
      continue;
    }

    // Dedupe by slug
    const bySlug = await db
      .select()
      .from(venues)
      .where(eq(venues.slug, baseSlug))
      .limit(1);

    if (bySlug[0]) {
      await db.insert(venueSources).values({
        venueId: bySlug[0].id,
        provider: place.provider,
        externalId: place.externalId,
        rawHash: hash,
        lastSyncedAt: new Date(),
      });
      updated++;
      continue;
    }

    // Soft skip very low quality without badge when no ratings (OSM)
    if (!quality.isPublishablePremium && (place.ratingCount ?? 0) === 0) {
      // Still store as DRAFT for coverage
    }

    const [venue] = await db
      .insert(venues)
      .values({
        cityId: city.id,
        name: place.name,
        slug: `${baseSlug}-${place.externalId.slice(0, 6)}`,
        type,
        address: place.address ?? null,
        phone: place.phone ?? null,
        lat: place.lat,
        lng: place.lng,
        ratingAvg: place.ratingAvg,
        ratingCount: place.ratingCount ?? 0,
        qualityScore: quality.score,
        curationBadge: false,
        claimStatus: "UNCLAIMED",
        bookingEnabled: false,
        status: quality.isPublishablePremium ? "PUBLISHED" : "DRAFT",
        primarySource: place.provider,
        primaryExternalId: place.externalId,
      })
      .returning();

    await db.insert(venueSources).values({
      venueId: venue!.id,
      provider: place.provider,
      externalId: place.externalId,
      rawHash: hash,
      lastSyncedAt: new Date(),
    });
    created++;
  }

  // silence unused import if tree-shaken weirdly
  void normalizeName;
  void skipped;

  return { created, updated, skipped };
}
