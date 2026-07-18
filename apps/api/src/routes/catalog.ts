import type { FastifyPluginAsync } from "fastify";
import { and, eq } from "drizzle-orm";
import { dbRead, venues, geoCities, usingReadReplica } from "@saas/db";
import { searchQuerySchema } from "@saas/contracts";
import { searchCatalog } from "../services/catalog-search.service.js";

export const catalogRoutes: FastifyPluginAsync = async (app) => {
  app.get("/search", async (request, reply) => {
    const parsed = searchQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }

    try {
      return await searchCatalog(parsed.data);
    } catch (err) {
      if (err instanceof Error && err.message === "CITY_NOT_FOUND") {
        return reply
          .status(404)
          .send({ error: "City not found", code: "CITY_NOT_FOUND" });
      }
      throw err;
    }
  });

  app.get<{ Params: { city: string; slug: string } }>(
    "/:city/:slug",
    async (request, reply) => {
      const city = await dbRead.query.geoCities.findFirst({
        where: eq(geoCities.slug, request.params.city),
      });
      if (!city) {
        return reply.status(404).send({ error: "City not found" });
      }

      const venue = await dbRead.query.venues.findFirst({
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
        meta: { db: usingReadReplica() ? "replica" : "primary" },
      };
    },
  );
};
