import { and, eq, gte, desc, inArray } from "drizzle-orm";
import { db, venues, geoCities } from "@saas/db";
import { createSearchClient, VENUES_INDEX } from "@saas/search";
import type { SearchQuery } from "@saas/contracts";
import { env } from "../env.js";

export type CatalogHit = {
  id: string;
  name: string;
  slug: string;
  type: string;
  address: string | null;
  lat: number;
  lng: number;
  ratingAvg: number | null;
  ratingCount: number;
  qualityScore: number;
  curationBadge: boolean;
  bookingEnabled: boolean;
  claimStatus: string;
  minAge: number | null;
  coverAmount: number | null;
  hasGuestList: boolean;
  capacity: number | null;
  priceLevel: number | null;
  description: string | null;
  citySlug: string;
  tags: string[];
  _source?: "meili" | "postgres";
};

export async function searchCatalog(q: SearchQuery): Promise<{
  data: CatalogHit[];
  meta: Record<string, unknown>;
}> {
  const city = await db.query.geoCities.findFirst({
    where: eq(geoCities.slug, q.city),
  });
  if (!city) {
    const err = new Error("CITY_NOT_FOUND");
    throw err;
  }

  // Prefer Meilisearch when configured
  if (env.MEILI_HOST) {
    try {
      const meili = await searchMeili(q, city.slug);
      if (meili) return meili;
    } catch (e) {
      console.warn("[catalog] Meili fallback to Postgres", e);
    }
  }

  return searchPostgres(q, city.id, city.slug);
}

async function searchMeili(q: SearchQuery, citySlug: string) {
  const client = createSearchClient(
    env.MEILI_HOST!,
    env.MEILI_MASTER_KEY ?? "dev-master-key-change-me",
  );

  const filters: string[] = [`citySlug = "${citySlug}"`];
  if (q.premiumOnly) filters.push("qualityScore >= 40");
  if (q.bookingOnly) filters.push("bookingEnabled = true");
  if (q.minStars != null) filters.push(`ratingAvg >= ${q.minStars}`);

  if (q.type?.length) {
    filters.push(`type IN [${q.type.map((t) => `"${t}"`).join(", ")}]`);
  } else if (q.lens === "salir") {
    filters.push(`type IN ["BAR", "CLUB", "MIXED"]`);
  } else if (q.lens === "comer") {
    filters.push(`type IN ["RESTAURANT", "MIXED"]`);
  }

  const index = client.index(VENUES_INDEX);
  const result = await index.search(q.q ?? "", {
    filter: filters.join(" AND "),
    sort: ["qualityScore:desc"],
    limit: q.pageSize,
    offset: (q.page - 1) * q.pageSize,
  });

  const hits = result.hits as Array<Record<string, unknown>>;
  if (!hits.length && !q.q) {
    // empty index → fall through
    return null;
  }

  // Enrich with PG fields for full public schema
  const ids = hits.map((h) => String(h.id));
  if (!ids.length) {
    return {
      data: [] as CatalogHit[],
      meta: {
        page: q.page,
        pageSize: q.pageSize,
        city: citySlug,
        lens: q.lens,
        source: "meili",
        estimatedTotal: result.estimatedTotalHits,
      },
    };
  }

  const rows = await db.select().from(venues).where(inArray(venues.id, ids));
  const byId = new Map(rows.map((r) => [r.id, r]));

  const data: CatalogHit[] = hits
    .map((h) => {
      const r = byId.get(String(h.id));
      if (!r) return null;
      return {
        id: r.id,
        name: r.name,
        slug: r.slug,
        type: r.type,
        address: r.address,
        lat: r.lat,
        lng: r.lng,
        ratingAvg: r.ratingAvg,
        ratingCount: r.ratingCount,
        qualityScore: r.qualityScore,
        curationBadge: r.curationBadge,
        bookingEnabled: r.bookingEnabled,
        claimStatus: r.claimStatus,
        minAge: r.minAge,
        coverAmount: r.coverAmount,
        hasGuestList: r.hasGuestList,
        capacity: r.capacity,
        priceLevel: r.priceLevel,
        description: r.description,
        citySlug,
        tags: [] as string[],
        _source: "meili" as const,
      };
    })
    .filter((x): x is CatalogHit => x != null);

  return {
    data,
    meta: {
      page: q.page,
      pageSize: q.pageSize,
      city: citySlug,
      lens: q.lens,
      source: "meili",
      estimatedTotal: result.estimatedTotalHits,
    },
  };
}

async function searchPostgres(
  q: SearchQuery,
  cityId: string,
  citySlug: string,
) {
  const conditions = [eq(venues.cityId, cityId), eq(venues.status, "PUBLISHED")];

  if (q.premiumOnly) conditions.push(gte(venues.qualityScore, 40));
  if (q.bookingOnly) conditions.push(eq(venues.bookingEnabled, true));
  if (q.minStars != null) conditions.push(gte(venues.ratingAvg, q.minStars));

  if (q.type?.length) {
    conditions.push(inArray(venues.type, q.type));
  } else if (q.lens === "salir") {
    conditions.push(inArray(venues.type, ["BAR", "CLUB", "MIXED"]));
  } else if (q.lens === "comer") {
    conditions.push(inArray(venues.type, ["RESTAURANT", "MIXED"]));
  }

  const offset = (q.page - 1) * q.pageSize;
  const rows = await db
    .select()
    .from(venues)
    .where(and(...conditions))
    .orderBy(desc(venues.qualityScore))
    .limit(q.pageSize)
    .offset(offset);

  // Optional text filter in memory for q
  let filtered = rows;
  if (q.q?.trim()) {
    const needle = q.q.toLowerCase();
    filtered = rows.filter(
      (r) =>
        r.name.toLowerCase().includes(needle) ||
        (r.description?.toLowerCase().includes(needle) ?? false),
    );
  }

  return {
    data: filtered.map(
      (r): CatalogHit => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        type: r.type,
        address: r.address,
        lat: r.lat,
        lng: r.lng,
        ratingAvg: r.ratingAvg,
        ratingCount: r.ratingCount,
        qualityScore: r.qualityScore,
        curationBadge: r.curationBadge,
        bookingEnabled: r.bookingEnabled,
        claimStatus: r.claimStatus,
        minAge: r.minAge,
        coverAmount: r.coverAmount,
        hasGuestList: r.hasGuestList,
        capacity: r.capacity,
        priceLevel: r.priceLevel,
        description: r.description,
        citySlug,
        tags: [],
        _source: "postgres",
      }),
    ),
    meta: {
      page: q.page,
      pageSize: q.pageSize,
      city: citySlug,
      lens: q.lens,
      source: "postgres",
    },
  };
}
