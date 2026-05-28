import type { FastifyInstance } from "fastify";
import { env } from "../env.js";
import { findOrCreateOAuthUser, getGoogleUserInfo, getGitHubUserInfo } from "../services/oauth.service.js";
import { createRefreshToken } from "../services/auth.service.js";

const WEB_URL = env.WEB_URL;

function buildCallbackUrl(app: FastifyInstance, user: { id: string; email: string }) {
  const accessToken = app.jwt.sign(
    { sub: user.id, email: user.email },
    { expiresIn: env.JWT_ACCESS_EXPIRES },
  );
  return { accessToken };
}

export async function oauthRoutes(app: FastifyInstance) {
  // ─── Google ─────────────────────────────────────────────────────────────

  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    const { default: oauthPlugin } = await import("@fastify/oauth2");

    await app.register(oauthPlugin, {
      name: "googleOAuth2",
      scope: ["openid", "email", "profile"],
      credentials: {
        client: { id: env.GOOGLE_CLIENT_ID, secret: env.GOOGLE_CLIENT_SECRET },
        auth: (oauthPlugin as any).GOOGLE_CONFIGURATION,
      },
      startRedirectPath: "/auth/google",
      callbackUri: `${env.CORS_ORIGIN.replace("3000", "3001")}/auth/google/callback`,
    });

    app.get("/auth/google/callback", async (request, reply) => {
      try {
        const tokenData = await (app as any).googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);
        const userInfo = await getGoogleUserInfo(tokenData.token.access_token);
        const user = await findOrCreateOAuthUser("google", userInfo);
        const { accessToken } = buildCallbackUrl(app, user);
        const refreshToken = await createRefreshToken(user.id);

        return reply.redirect(
          `${WEB_URL}/api/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`,
        );
      } catch (err) {
        const msg = err instanceof Error ? encodeURIComponent(err.message) : "oauth_error";
        return reply.redirect(`${WEB_URL}/login?error=${msg}`);
      }
    });
  } else {
    app.log.warn("Google OAuth deshabilitado: GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET no configurados");
  }

  // ─── GitHub ─────────────────────────────────────────────────────────────

  if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
    const { default: oauthPlugin } = await import("@fastify/oauth2");

    await app.register(oauthPlugin, {
      name: "githubOAuth2",
      scope: ["user:email", "read:user"],
      credentials: {
        client: { id: env.GITHUB_CLIENT_ID, secret: env.GITHUB_CLIENT_SECRET },
        auth: (oauthPlugin as any).GITHUB_CONFIGURATION,
      },
      startRedirectPath: "/auth/github",
      callbackUri: `${env.CORS_ORIGIN.replace("3000", "3001")}/auth/github/callback`,
    });

    app.get("/auth/github/callback", async (request, reply) => {
      try {
        const tokenData = await (app as any).githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);
        const userInfo = await getGitHubUserInfo(tokenData.token.access_token);
        const user = await findOrCreateOAuthUser("github", userInfo);
        const { accessToken } = buildCallbackUrl(app, user);
        const refreshToken = await createRefreshToken(user.id);

        return reply.redirect(
          `${WEB_URL}/api/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`,
        );
      } catch (err) {
        const msg = err instanceof Error ? encodeURIComponent(err.message) : "oauth_error";
        return reply.redirect(`${WEB_URL}/login?error=${msg}`);
      }
    });
  } else {
    app.log.warn("GitHub OAuth deshabilitado: GITHUB_CLIENT_ID o GITHUB_CLIENT_SECRET no configurados");
  }
}
