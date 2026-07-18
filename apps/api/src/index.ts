import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { geoRoutes } from "./routes/geo.js";

const port = Number(process.env.API_PORT ?? 3001);
const host = process.env.API_HOST ?? "0.0.0.0";

async function main() {
  const app = Fastify({ logger: true });

  await app.register(helmet);
  await app.register(cors, {
    origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  });
  await app.register(rateLimit, { max: 200, timeWindow: "1 minute" });

  app.get("/health", async () => ({
    ok: true,
    service: "nighttable-api",
    ts: new Date().toISOString(),
  }));

  await app.register(geoRoutes, { prefix: "/geo" });

  await app.listen({ port, host });
  console.log(`[api] listening on ${host}:${port}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
