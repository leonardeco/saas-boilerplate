import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { env } from "./env.js";
import { jwtPlugin } from "./plugins/jwt.js";
import { authRoutes } from "./routes/auth.js";
import { geoRoutes } from "./routes/geo.js";
import { catalogRoutes } from "./routes/catalog.js";

async function main() {
  const app = Fastify({ logger: true });

  await app.register(helmet);
  await app.register(cors, { origin: env.CORS_ORIGIN });
  await app.register(rateLimit, { max: 200, timeWindow: "1 minute" });
  await app.register(jwtPlugin);

  await app.register(swagger, {
    openapi: {
      info: {
        title: "NightTable CO API",
        description: "Food & Nightlife premium — Colombia",
        version: "0.1.0",
      },
    },
  });
  await app.register(swaggerUi, { routePrefix: "/docs" });

  app.get("/health", async () => ({
    ok: true,
    service: "nighttable-api",
    ts: new Date().toISOString(),
  }));

  await app.register(authRoutes, { prefix: "/auth" });
  await app.register(geoRoutes, { prefix: "/geo" });
  await app.register(catalogRoutes, { prefix: "/catalog" });

  await app.listen({ port: env.API_PORT, host: env.API_HOST });
  app.log.info(`NightTable API on ${env.API_HOST}:${env.API_PORT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
