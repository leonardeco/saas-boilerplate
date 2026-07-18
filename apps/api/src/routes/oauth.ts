import type { FastifyPluginAsync } from "fastify";
import crypto from "node:crypto";
import { env } from "../env.js";
import {
  getAuthorizeUrl,
  oauthConfigured,
  upsertOAuthUser,
  type OAuthProvider,
} from "../services/oauth.service.js";
import { createRefreshToken } from "../services/auth.service.js";
import { setAuthCookies } from "../lib/cookies.js";
import { metrics } from "../lib/metrics.js";

const states = new Map<string, number>();

function cleanStates() {
  const now = Date.now();
  for (const [k, exp] of states) {
    if (exp < now) states.delete(k);
  }
}

export const oauthRoutes: FastifyPluginAsync = async (app) => {
  app.get("/providers", async () => ({
    data: {
      google: oauthConfigured("google"),
      github: oauthConfigured("github"),
    },
  }));

  app.get<{ Params: { provider: string } }>("/:provider/start", async (req, reply) => {
    const provider = req.params.provider as OAuthProvider;
    if (provider !== "google" && provider !== "github") {
      return reply.status(400).send({ error: "Unknown provider" });
    }
    if (!oauthConfigured(provider)) {
      return reply.status(503).send({
        error: "OAuth provider not configured",
        code: "OAUTH_NOT_CONFIGURED",
      });
    }
    cleanStates();
    const state = crypto.randomBytes(16).toString("hex");
    states.set(state, Date.now() + 10 * 60_000);
    metrics.inc("oauth_start_total", { provider });
    return reply.redirect(getAuthorizeUrl(provider, state));
  });

  app.get<{
    Params: { provider: string };
    Querystring: { code?: string; state?: string; error?: string };
  }>("/:provider/callback", async (req, reply) => {
    const provider = req.params.provider as OAuthProvider;
    if (provider !== "google" && provider !== "github") {
      return reply.status(400).send({ error: "Unknown provider" });
    }
    if (req.query.error) {
      return reply.redirect(
        `${env.WEB_URL}/login?error=${encodeURIComponent(req.query.error)}`,
      );
    }
    const { code, state } = req.query;
    if (!code || !state || !states.has(state)) {
      return reply.redirect(`${env.WEB_URL}/login?error=invalid_state`);
    }
    states.delete(state);

    try {
      const user = await upsertOAuthUser(provider, code);
      const accessToken = app.jwt.sign(
        {
          sub: user.id,
          email: user.email,
          platformRole: user.platformRole,
        },
        { expiresIn: env.JWT_ACCESS_EXPIRES },
      );
      const refreshToken = await createRefreshToken(user.id);
      setAuthCookies(reply, { accessToken, refreshToken });
      metrics.inc("oauth_success_total", { provider });
      return reply.redirect(`${env.WEB_URL}/dashboard?oauth=1`);
    } catch (err) {
      metrics.inc("oauth_error_total", { provider });
      const msg = err instanceof Error ? err.message : "oauth_failed";
      return reply.redirect(
        `${env.WEB_URL}/login?error=${encodeURIComponent(msg)}`,
      );
    }
  });
};
