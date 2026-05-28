import Fastify from "fastify";
import { jwtPlugin } from "../../plugins/jwt.js";
import { authRoutes } from "../../routes/auth.js";
import { organizationsRoutes } from "../../routes/organizations.js";
import { membersRoutes } from "../../routes/members.js";

/**
 * Builds a Fastify test instance with plugins and routes registered.
 * Does NOT start listening — use app.inject() for requests.
 */
export async function buildTestApp() {
  const app = Fastify({ logger: false });

  await app.register(jwtPlugin);
  await app.register(authRoutes, { prefix: "/auth" });
  await app.register(organizationsRoutes, { prefix: "/organizations" });
  await app.register(membersRoutes, { prefix: "/organizations" });

  app.get("/health", async () => ({ status: "ok" }));

  await app.ready();
  return app;
}

/**
 * Signs a JWT for a given user — use in tests that need an authenticated request.
 */
export function signTestToken(
  app: Awaited<ReturnType<typeof buildTestApp>>,
  payload: { sub: string; email: string },
) {
  return app.jwt.sign(payload, { expiresIn: "15m" });
}
