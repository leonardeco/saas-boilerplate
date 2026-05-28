import { db, users, oauthAccounts, organizations, organizationMembers } from "@saas/db";
import { eq, and } from "drizzle-orm";

export type OAuthProvider = "google" | "github";

export interface OAuthUserInfo {
  providerUserId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

/**
 * Finds an existing user by OAuth account, or creates a new one.
 * If the email already exists as a local account, links the OAuth provider to it.
 */
export async function findOrCreateOAuthUser(
  provider: OAuthProvider,
  info: OAuthUserInfo,
) {
  // 1. Check if this OAuth account already exists
  const existingOAuth = await db.query.oauthAccounts.findFirst({
    where: and(
      eq(oauthAccounts.provider, provider),
      eq(oauthAccounts.providerUserId, info.providerUserId),
    ),
    with: { user: true },
  });

  if (existingOAuth) {
    // Update avatar/name in case they changed
    await db
      .update(oauthAccounts)
      .set({ name: info.name, avatarUrl: info.avatarUrl, updatedAt: new Date() })
      .where(eq(oauthAccounts.id, existingOAuth.id));
    return existingOAuth.user;
  }

  // 2. Check if user exists by email (has a local account)
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, info.email),
  });

  if (existingUser) {
    // Link OAuth provider to existing account
    await db.insert(oauthAccounts).values({
      userId: existingUser.id,
      provider,
      providerUserId: info.providerUserId,
      email: info.email,
      name: info.name,
      avatarUrl: info.avatarUrl,
    });

    // Update avatar if user doesn't have one
    if (!existingUser.avatarUrl && info.avatarUrl) {
      await db
        .update(users)
        .set({ avatarUrl: info.avatarUrl, emailVerified: true, updatedAt: new Date() })
        .where(eq(users.id, existingUser.id));
    }

    return existingUser;
  }

  // 3. Create brand new user
  const [newUser] = await db
    .insert(users)
    .values({
      name: info.name,
      email: info.email,
      passwordHash: null, // OAuth-only user
      avatarUrl: info.avatarUrl,
      emailVerified: true, // OAuth emails are pre-verified
    })
    .returning();

  // Link OAuth account
  await db.insert(oauthAccounts).values({
    userId: newUser!.id,
    provider,
    providerUserId: info.providerUserId,
    email: info.email,
    name: info.name,
    avatarUrl: info.avatarUrl,
  });

  // Create personal organization
  const slug = info.email.split("@")[0]!.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const [org] = await db
    .insert(organizations)
    .values({ name: `${info.name}'s Workspace`, slug: `${slug}-${Date.now()}` })
    .returning();

  await db.insert(organizationMembers).values({
    organizationId: org!.id,
    userId: newUser!.id,
    role: "OWNER",
  });

  return newUser!;
}

// ─── Provider user info fetchers ────────────────────────────────────────────

export async function getGoogleUserInfo(accessToken: string): Promise<OAuthUserInfo> {
  const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Failed to fetch Google user info");
  const data = await res.json() as {
    id: string; email: string; name: string; picture?: string;
  };
  return {
    providerUserId: data.id,
    email: data.email,
    name: data.name,
    avatarUrl: data.picture,
  };
}

export async function getGitHubUserInfo(accessToken: string): Promise<OAuthUserInfo> {
  const [userRes, emailsRes] = await Promise.all([
    fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}`, "User-Agent": "saas-boilerplate" },
    }),
    fetch("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${accessToken}`, "User-Agent": "saas-boilerplate" },
    }),
  ]);

  if (!userRes.ok) throw new Error("Failed to fetch GitHub user info");

  const user = await userRes.json() as {
    id: number; login: string; name?: string; avatar_url?: string; email?: string;
  };

  // GitHub users can have private emails — fetch from emails endpoint
  let email = user.email ?? "";
  if (!email && emailsRes.ok) {
    const emails = await emailsRes.json() as { email: string; primary: boolean; verified: boolean }[];
    email = emails.find((e) => e.primary && e.verified)?.email ?? emails[0]?.email ?? "";
  }

  if (!email) throw new Error("No se pudo obtener el email de GitHub. Asegurate de que tu email sea publico o verificado.");

  return {
    providerUserId: String(user.id),
    email,
    name: user.name ?? user.login,
    avatarUrl: user.avatar_url,
  };
}
