import type { FastifyPluginAsync } from "fastify";
import { eq } from "drizzle-orm";
import { COLOMBIA_MAJOR_CITIES } from "@saas/db/seeds/geo-co";
import { dbRead, geoCities, usingReadReplica } from "@saas/db";

/**
 * Prefer DB (read replica) when migrated/seeded; fallback to static seed constants.
 */
export const geoRoutes: FastifyPluginAsync = async (app) => {
  app.get("/cities", async () => {
    try {
      const rows = await dbRead.select().from(geoCities);
      if (rows.length) {
        return {
          data: rows.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            isMajor: c.isMajor,
            activationWave: c.activationWave,
            lat: c.lat,
            lng: c.lng,
          })),
          meta: { source: "db", db: usingReadReplica() ? "replica" : "primary" },
        };
      }
    } catch {
      /* fall through */
    }

    return {
      data: COLOMBIA_MAJOR_CITIES.map((c) => ({
        name: c.name,
        slug: c.slug,
        isMajor: c.isMajor,
        activationWave: c.activationWave,
        lat: c.lat,
        lng: c.lng,
        departmentName: c.departmentName,
      })),
      meta: { source: "seed" },
    };
  });

  app.get<{ Params: { slug: string } }>("/cities/:slug", async (req, reply) => {
    try {
      const city = await dbRead.query.geoCities.findFirst({
        where: eq(geoCities.slug, req.params.slug),
      });
      if (city) {
        return {
          data: city,
          meta: { source: "db", db: usingReadReplica() ? "replica" : "primary" },
        };
      }
    } catch {
      /* fall through */
    }

    const city = COLOMBIA_MAJOR_CITIES.find((c) => c.slug === req.params.slug);
    if (!city) {
      return reply
        .status(404)
        .send({ error: "City not found", code: "CITY_NOT_FOUND" });
    }
    return { data: city, meta: { source: "seed" } };
  });
};
