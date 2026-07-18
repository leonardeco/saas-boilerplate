import type { FastifyReply } from "fastify";
import { env } from "../env.js";

const ACCESS = "nt_access";
const REFRESH = "nt_refresh";

export function setAuthCookies(
  reply: FastifyReply,
  tokens: { accessToken: string; refreshToken: string },
) {
  const secure = env.COOKIE_SECURE || env.NODE_ENV === "production";
  const common = {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
  };

  reply.setCookie(ACCESS, tokens.accessToken, {
    ...common,
    maxAge: 15 * 60,
  });
  reply.setCookie(REFRESH, tokens.refreshToken, {
    ...common,
    maxAge: 7 * 24 * 60 * 60,
  });
}

export function clearAuthCookies(reply: FastifyReply) {
  reply.clearCookie(ACCESS, { path: "/" });
  reply.clearCookie(REFRESH, { path: "/" });
}

export function readRefreshFromRequest(request: {
  cookies?: Record<string, string>;
  body?: unknown;
}): string | undefined {
  const body = request.body as { refreshToken?: string } | undefined;
  if (body?.refreshToken) return body.refreshToken;
  return request.cookies?.[REFRESH];
}

export { ACCESS as ACCESS_COOKIE, REFRESH as REFRESH_COOKIE };
