import "./env.js"; // validate env vars before anything else
import Fastify from "fastify";
import { helmetPlugin } from "./plugins/helmet.js";
import { corsPlugin } from "./plugins/cors.js";
import { jwtPlugin } from "./plugins/jwt.js";
import { swaggerPlugin } from "./plugins/swagger.js";
import { rateLimitPlugin } from "./plugins/rateLimit.js";
import { authRoutes } from "./routes/auth.js";
import { oauthRoutes } from "./routes/oauth.js";
import { organizationsRoutes } from "./routes/organizations.js";
import { membersRoutes } from "./routes/members.js";
import { billingRoutes } from "./routes/billing.js";

const app = Fastify({ logger: true });

// Plugins
await app.register(helmetPlugin);
await app.register(corsPlugin);
await app.register(rateLimitPlugin);
await app.register(swaggerPlugin);
await app.register(jwtPlugin);

// Routes
await app.register(authRoutes, { prefix: "/auth" });
await app.register(oauthRoutes);
await app.register(organizationsRoutes, { prefix: "/organizations" });
await app.register(membersRoutes, { prefix: "/organizations" });
await app.register(billingRoutes, { prefix: "/billing" });

app.get("/health", async () => ({ status: "ok", timestamp: new Date().toISOString() }));

import { env } from "./env.js";
const port = env.API_PORT;
const host = env.API_HOST;

try {
  await app.listen({ port, host });
  console.log(`🚀 API running at http://${host}:${port}`);
  console.log(`📚 Docs at http://${host}:${port}/docs`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
