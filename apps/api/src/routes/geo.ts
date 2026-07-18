import type { FastifyPluginAsync } from "fastify";
import { COLOMBIA_MAJOR_CITIES } from "@saas/db/seeds/geo-co";

/**
 * S0: geo list served from seed constants so the API works before migrate.
 * S1+ will read from Postgres.
 */
export const geoRoutes: FastifyPluginAsync = async (app) => {
  app.get("/cities", async () => {
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
    };
  });

  app.get<{ Params: { slug: string } }>("/cities/:slug", async (req, reply) => {
    const city = COLOMBIA_MAJOR_CITIES.find((c) => c.slug === req.params.slug);
    if (!city) {
      return reply.status(404).send({ error: "City not found", code: "CITY_NOT_FOUND" });
    }
    return { data: city };
  });
};
