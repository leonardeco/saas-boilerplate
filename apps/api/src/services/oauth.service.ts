import { and, eq } from "drizzle-orm";
import {
  db,
  users,
  oauthAccounts,
  organizations,
  organizationMembers,
  plans,
  subscriptions,
} from "@saas/db";
import { env } from "../env.js";

export type OAuthProvider = "google" | "github";

export function oauthConfigured(provider: OAuthProvider): boolean {
  if (provider === "google") {
    return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  }
  return Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
}

export function getAuthorizeUrl(provider: OAuthProvider, state: string): string {
  const redirectUri = `${env.WEB_URL.replace(/\/$/, "")}/api/oauth/callback/${provider}`;
  // API-hosted callback alternative:
  const apiRedirect = `${process.env.API_PUBLIC_URL ?? `http://localhost:${env.API_PORT}`}/auth/oauth/${provider}/callback`;

  if (provider === "google") {
    const u = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    u.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID!);
    u.searchParams.set("redirect_uri", apiRedirect);
    u.searchParams.set("response_type", "code");
    u.searchParams.set("scope", "openid email profile");
    u.searchParams.set("state", state);
    u.searchParams.set("access_type", "online");
    u.searchParams.set("prompt", "select_account");
    return u.toString();
  }

  const u = new URL("https://github.com/login/oauth/authorize");
  u.searchParams.set("client_id", process.env.GITHUB_CLIENT_ID!);
  u.searchParams.set("redirect_uri", apiRedirect);
  u.searchParams.set("scope", "user:email");
  u.searchParams.set("state", state);
  void redirectUri;
  return u.toString();
}

type Profile = {
  providerAccountId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  accessToken?: string;
};

async function exchangeGoogle(code: string): Promise<Profile> {
  const apiRedirect = `${process.env.API_PUBLIC_URL ?? `http://localhost:${env.API_PORT}`}/auth/oauth/google/callback`;
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: apiRedirect,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) throw new Error("OAUTH_TOKEN_EXCHANGE");
  const tokens = (await tokenRes.json()) as { access_token: string };

  const meRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (!meRes.ok) throw new Error("OAUTH_PROFILE");
  const me = (await meRes.json()) as {
    id: string;
    email: string;
    name?: string;
    picture?: string;
  };
  return {
    providerAccountId: me.id,
    email: me.email,
    name: me.name ?? me.email.split("@")[0]!,
    avatarUrl: me.picture,
    accessToken: tokens.access_token,
  };
}

async function exchangeGithub(code: string): Promise<Profile> {
  const apiRedirect = `${process.env.API_PUBLIC_URL ?? `http://localhost:${env.API_PORT}`}/auth/oauth/github/callback`;
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: apiRedirect,
    }),
  });
  if (!tokenRes.ok) throw new Error("OAUTH_TOKEN_EXCHANGE");
  const tokens = (await tokenRes.json()) as { access_token?: string };
  if (!tokens.access_token) throw new Error("OAUTH_TOKEN_EXCHANGE");

  const meRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
      Accept: "application/vnd.github+json",
    },
  });
  if (!meRes.ok) throw new Error("OAUTH_PROFILE");
  const me = (await meRes.json()) as {
    id: number;
    login: string;
    name?: string;
    email?: string;
    avatar_url?: string;
  };

  let email = me.email;
  if (!email) {
    const emailsRes = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        Accept: "application/vnd.github+json",
      },
    });
    if (emailsRes.ok) {
      const emails = (await emailsRes.json()) as Array<{
        email: string;
        primary: boolean;
        verified: boolean;
      }>;
      email =
        emails.find((e) => e.primary && e.verified)?.email ??
        emails.find((e) => e.verified)?.email ??
        emails[0]?.email;
    }
  }
  if (!email) throw new Error("OAUTH_EMAIL_REQUIRED");

  return {
    providerAccountId: String(me.id),
    email,
    name: me.name ?? me.login,
    avatarUrl: me.avatar_url,
    accessToken: tokens.access_token,
  };
}

export async function upsertOAuthUser(
  provider: OAuthProvider,
  code: string,
) {
  const profile =
    provider === "google"
      ? await exchangeGoogle(code)
      : await exchangeGithub(code);

  const [existingLink] = await db
    .select()
    .from(oauthAccounts)
    .where(
      and(
        eq(oauthAccounts.provider, provider),
        eq(oauthAccounts.providerAccountId, profile.providerAccountId),
      ),
    )
    .limit(1);

  if (existingLink) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, existingLink.userId))
      .limit(1);
    if (!user) throw new Error("USER_MISSING");
    return publicUser(user);
  }

  let user =
    (
      await db
        .select()
        .from(users)
        .where(eq(users.email, profile.email))
        .limit(1)
    )[0] ?? null;

  if (!user) {
    const [created] = await db
      .insert(users)
      .values({
        name: profile.name,
        email: profile.email,
        avatarUrl: profile.avatarUrl,
        emailVerified: true,
        passwordHash: null,
      })
      .returning();
    user = created!;

    const slug = profile.email
      .split("@")[0]!
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-");
    const [org] = await db
      .insert(organizations)
      .values({
        name: `${profile.name}'s venues`,
        slug: `${slug}-${Date.now()}`,
      })
      .returning();
    await db.insert(organizationMembers).values({
      organizationId: org!.id,
      userId: user.id,
      role: "OWNER",
    });
    const free = await db.query.plans.findFirst({ where: eq(plans.name, "FREE") });
    if (free) {
      await db.insert(subscriptions).values({
        organizationId: org!.id,
        planId: free.id,
        status: "active",
      });
    }
  }

  await db.insert(oauthAccounts).values({
    userId: user.id,
    provider,
    providerAccountId: profile.providerAccountId,
    accessToken: profile.accessToken,
  });

  return publicUser(user);
}

function publicUser(user: typeof users.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    platformRole: user.platformRole,
    emailVerified: user.emailVerified,
  };
}
