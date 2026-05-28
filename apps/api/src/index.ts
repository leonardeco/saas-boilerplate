import Fastify from "fastify";
import { corsPlugin } from "./plugins/cors.js";
import { jwtPlugin } from "./plugins/jwt.js";
import { swaggerPlugin } from "./plugins/swagger.js";
import { rateLimitPlugin } from "./plugins/rateLimit.js";
import { authRoutes } from "./routes/auth.js";
import { organizationsRoutes } from "./routes/organizations.js";
import { membersRoutes } from "./routes/members.js";
import { billingRoutes } from "./routes/billing.js";

const app = Fastify({ logger: true });

// Plugins
await app.register(corsPlugin);
await app.register(rateLimitPlugin);
await app.register(swaggerPlugin);
await app.register(jwtPlugin);

// Routes
await app.register(authRoutes, { prefix: "/auth" });
await app.register(organizationsRoutes, { prefix: "/organizations" });
await app.register(membersRoutes, { prefix: "/organizations" });
await app.register(billingRoutes, { prefix: "/billing" });

app.get("/health", async () => ({ status: "ok", timestamp: new Date().toISOString() }));

const port = Number(process.env.API_PORT ?? 3001);
const host = process.env.API_HOST ?? "0.0.0.0";

try {
  await app.listen({ port, host });
  console.log(`🚀 API running at http://${host}:${port}`);
  console.log(`📚 Docs at http://${host}:${port}/docs`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
