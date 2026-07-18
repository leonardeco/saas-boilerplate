import type { FastifyPluginAsync } from "fastify";
import { and, eq, gte, desc, inArray } from "drizzle-orm";
import { db, venues, geoCities } from "@saas/db";
import { searchQuerySchema } from "@saas/contracts";

export const catalogRoutes: FastifyPluginAsync = async (app) => {
  app.get("/search", async (request, reply) => {
    const parsed = searchQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }

    const q = parsed.data;
    const city = await db.query.geoCities.findFirst({
      where: eq(geoCities.slug, q.city),
    });
    if (!city) {
      return reply.status(404).send({ error: "City not found", code: "CITY_NOT_FOUND" });
    }

    const conditions = [eq(venues.cityId, city.id), eq(venues.status, "PUBLISHED")];

    if (q.premiumOnly) {
      conditions.push(gte(venues.qualityScore, 40));
    }
    if (q.bookingOnly) {
      conditions.push(eq(venues.bookingEnabled, true));
    }
    if (q.minStars != null) {
      conditions.push(gte(venues.ratingAvg, q.minStars));
    }

    if (q.type?.length) {
      conditions.push(inArray(venues.type, q.type));
    } else if (q.lens === "salir") {
      conditions.push(inArray(venues.type, ["BAR", "CLUB", "MIXED"]));
    } else if (q.lens === "comer") {
      conditions.push(inArray(venues.type, ["RESTAURANT", "MIXED"]));
    }

    const offset = (q.page - 1) * q.pageSize;
    const rows = await db
      .select({
        id: venues.id,
        name: venues.name,
        slug: venues.slug,
        type: venues.type,
        address: venues.address,
        lat: venues.lat,
        lng: venues.lng,
        ratingAvg: venues.ratingAvg,
        ratingCount: venues.ratingCount,
        qualityScore: venues.qualityScore,
        curationBadge: venues.curationBadge,
        bookingEnabled: venues.bookingEnabled,
        claimStatus: venues.claimStatus,
        minAge: venues.minAge,
        coverAmount: venues.coverAmount,
        hasGuestList: venues.hasGuestList,
        capacity: venues.capacity,
        priceLevel: venues.priceLevel,
        description: venues.description,
      })
      .from(venues)
      .where(and(...conditions))
      .orderBy(desc(venues.qualityScore))
      .limit(q.pageSize)
      .offset(offset);

    return {
      data: rows.map((r) => ({
        ...r,
        citySlug: city.slug,
        tags: [] as string[],
      })),
      meta: { page: q.page, pageSize: q.pageSize, city: city.slug, lens: q.lens },
    };
  });

  app.get<{ Params: { city: string; slug: string } }>(
    "/:city/:slug",
    async (request, reply) => {
      const city = await db.query.geoCities.findFirst({
        where: eq(geoCities.slug, request.params.city),
      });
      if (!city) {
        return reply.status(404).send({ error: "City not found" });
      }

      const venue = await db.query.venues.findFirst({
        where: and(
          eq(venues.slug, request.params.slug),
          eq(venues.cityId, city.id),
          eq(venues.status, "PUBLISHED"),
        ),
      });
      if (!venue) {
        return reply.status(404).send({ error: "Venue not found" });
      }

      return {
        data: {
          ...venue,
          citySlug: city.slug,
          cityName: city.name,
        },
      };
    },
  );
};
