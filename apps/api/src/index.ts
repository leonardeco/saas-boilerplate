import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import cookie from "@fastify/cookie";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { env } from "./env.js";
import { jwtPlugin } from "./plugins/jwt.js";
import { metricsHook } from "./plugins/metrics-hook.js";
import { otelHook } from "./plugins/otel-hook.js";
import { metrics } from "./lib/metrics.js";
import { recentSpans } from "./lib/otel.js";
import { authRoutes } from "./routes/auth.js";
import { oauthRoutes } from "./routes/oauth.js";
import { geoRoutes } from "./routes/geo.js";
import { catalogRoutes } from "./routes/catalog.js";
import { bookingRoutes } from "./routes/bookings.js";
import { claimRoutes } from "./routes/claims.js";
import { reviewRoutes } from "./routes/reviews.js";
import { billingRoutes } from "./routes/billing.js";
import { adminRoutes } from "./routes/admin.js";
import { venuesManageRoutes } from "./routes/venues-manage.js";
import { usingReadReplica } from "@saas/db";

const VERSION = "1.6.0";
const REGION =
  process.env.REGION ??
  process.env.FLY_REGION ??
  process.env.RAILWAY_REGION ??
  "local";
const isProd = env.NODE_ENV === "production";
const enableSwagger =
  env.ENABLE_SWAGGER === true || (!isProd && env.ENABLE_SWAGGER !== false);

async function main() {
  const app = Fastify({
    trustProxy: env.TRUST_PROXY || isProd,
    logger: {
      level: isProd ? "info" : "debug",
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

  await app.register(helmet, {
    global: true,
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: isProd
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false,
    referrerPolicy: { policy: "no-referrer" },
  });

  const corsOrigins = env.CORS_ORIGIN.split(",").map((s) => s.trim());
  await app.register(cors, {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // server-to-server / mobile
      if (corsOrigins.includes(origin) || corsOrigins.includes("*")) {
        return cb(null, true);
      }
      return cb(new Error("CORS not allowed"), false);
    },
    credentials: true,
  });

  await app.register(cookie, {
    secret: env.JWT_ACCESS_SECRET.slice(0, 32),
    parseOptions: {},
  });

  await app.register(rateLimit, {
    max: isProd ? 120 : 200,
    timeWindow: "1 minute",
    ban: isProd ? 3 : -1,
    allowList: isProd ? [] : ["127.0.0.1"],
  });

  await app.register(jwtPlugin);
  await app.register(metricsHook);
  await app.register(otelHook);

  // Security headers for all JSON responses
  app.addHook("onSend", async (_req, reply, payload) => {
    reply.header("X-Content-Type-Options", "nosniff");
    reply.header("X-Frame-Options", "DENY");
    reply.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    if (isProd) {
      reply.header("Cross-Origin-Opener-Policy", "same-origin");
    }
    return payload;
  });

  if (enableSwagger) {
    await app.register(swagger, {
      openapi: {
        info: {
          title: "NightTable CO API",
          description: "Food & Nightlife premium Colombia",
          version: VERSION,
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
  }

  app.get("/health", async () => ({
    ok: true,
    service: "nighttable-api",
    version: VERSION,
    region: REGION,
    env: env.NODE_ENV,
    ts: new Date().toISOString(),
  }));

  app.get("/ready", async () => ({
    ok: true,
    region: REGION,
    database: Boolean(env.DATABASE_URL),
    readReplica: usingReadReplica(),
    meili: Boolean(env.MEILI_HOST),
    redis: Boolean(env.REDIS_URL),
    otel: process.env.OTEL_ENABLED === "true",
  }));

  app.get("/metrics", async (_req, reply) => {
    // Optionally protect metrics in prod with network policy / basic auth at edge
    reply.header("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
    return metrics.render();
  });

  if (!isProd) {
    app.get("/debug/spans", async () => ({ data: recentSpans().slice(-20) }));
  }

  await app.register(authRoutes, { prefix: "/auth" });
  await app.register(oauthRoutes, { prefix: "/auth/oauth" });
  await app.register(geoRoutes, { prefix: "/geo" });
  await app.register(catalogRoutes, { prefix: "/catalog" });
  await app.register(bookingRoutes, { prefix: "/bookings" });
  await app.register(claimRoutes, { prefix: "/claims" });
  await app.register(reviewRoutes, { prefix: "/reviews" });
  await app.register(billingRoutes, { prefix: "/billing" });
  await app.register(adminRoutes, { prefix: "/admin" });
  await app.register(venuesManageRoutes, { prefix: "/venues" });

  // Hide framework fingerprint
  app.addHook("onRequest", async (_req, reply) => {
    reply.header("X-Powered-By", "NightTable");
  });

  await app.listen({ port: env.API_PORT, host: env.API_HOST });
  app.log.info(
    `NightTable API v${VERSION} region=${REGION} env=${env.NODE_ENV} on ${env.API_HOST}:${env.API_PORT}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
