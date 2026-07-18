import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import cookie from "@fastify/cookie";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { env } from "./env.js";
import { jwtPlugin } from "./plugins/jwt.js";
import { authRoutes } from "./routes/auth.js";
import { geoRoutes } from "./routes/geo.js";
import { catalogRoutes } from "./routes/catalog.js";
import { bookingRoutes } from "./routes/bookings.js";
import { claimRoutes } from "./routes/claims.js";
import { reviewRoutes } from "./routes/reviews.js";
import { billingRoutes } from "./routes/billing.js";
import { adminRoutes } from "./routes/admin.js";
import { venuesManageRoutes } from "./routes/venues-manage.js";

async function main() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === "production" ? "info" : "debug",
      redact: [
        "req.headers.authorization",
        "req.headers.cookie",
        "password",
        "passwordHash",
        "refreshToken",
        "accessToken",
      ],
    },
  });

  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
  });
  await app.register(cookie);
  await app.register(rateLimit, {
    max: 200,
    timeWindow: "1 minute",
  });
  await app.register(jwtPlugin);

  await app.register(swagger, {
    openapi: {
      info: {
        title: "NightTable CO API",
        description: "Food & Nightlife premium Colombia",
        version: "1.1.0",
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
  });
  await app.register(swaggerUi, { routePrefix: "/docs" });

  app.get("/health", async () => ({
    ok: true,
    service: "nighttable-api",
    version: "1.1.0",
    ts: new Date().toISOString(),
  }));

  app.get("/ready", async () => ({
    ok: true,
    database: Boolean(env.DATABASE_URL),
    meili: Boolean(env.MEILI_HOST),
    redis: Boolean(env.REDIS_URL),
  }));

  await app.register(authRoutes, { prefix: "/auth" });
  await app.register(geoRoutes, { prefix: "/geo" });
  await app.register(catalogRoutes, { prefix: "/catalog" });
  await app.register(bookingRoutes, { prefix: "/bookings" });
  await app.register(claimRoutes, { prefix: "/claims" });
  await app.register(reviewRoutes, { prefix: "/reviews" });
  await app.register(billingRoutes, { prefix: "/billing" });
  await app.register(adminRoutes, { prefix: "/admin" });
  await app.register(venuesManageRoutes, { prefix: "/venues" });

  await app.listen({ port: env.API_PORT, host: env.API_HOST });
  app.log.info(`NightTable API on ${env.API_HOST}:${env.API_PORT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
