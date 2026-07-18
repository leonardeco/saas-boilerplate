import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { eq, and } from "drizzle-orm";
import {
  db,
  users,
  refreshTokens,
  organizations,
  organizationMembers,
  plans,
  subscriptions,
} from "@saas/db";

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

export async function registerUser(name: string, email: string, password: string) {
  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) throw new Error("EMAIL_IN_USE");

  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await db
    .insert(users)
    .values({ name, email, passwordHash })
    .returning();

  const slugBase = email
    .split("@")[0]!
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-");
  const [org] = await db
    .insert(organizations)
    .values({
      name: `${name}'s venues`,
      slug: `${slugBase}-${Date.now()}`,
    })
    .returning();

  await db.insert(organizationMembers).values({
    organizationId: org!.id,
    userId: user!.id,
    role: "OWNER",
  });

  // Attach FREE plan if available
  const free = await db.query.plans.findFirst({ where: eq(plans.name, "FREE") });
  if (free) {
    await db.insert(subscriptions).values({
      organizationId: org!.id,
      planId: free.id,
      status: "active",
    });
  }

  return { user: publicUser(user!), organization: org };
}

export async function loginUser(email: string, password: string) {
  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user?.passwordHash) throw new Error("INVALID_CREDENTIALS");

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error("INVALID_CREDENTIALS");

  return publicUser(user);
}

export async function createRefreshToken(userId: string) {
  const token = crypto.randomBytes(64).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await db.insert(refreshTokens).values({ token, userId, expiresAt });
  return token;
}

export async function rotateRefreshToken(oldToken: string) {
  const stored = await db.query.refreshTokens.findFirst({
    where: and(eq(refreshTokens.token, oldToken), eq(refreshTokens.revoked, false)),
    with: { user: true },
  });

  if (!stored || stored.expiresAt < new Date()) throw new Error("INVALID_TOKEN");

  await db
    .update(refreshTokens)
    .set({ revoked: true })
    .where(eq(refreshTokens.token, oldToken));

  const newToken = await createRefreshToken(stored.userId);
  return { user: publicUser(stored.user), refreshToken: newToken };
}

export async function revokeRefreshToken(token: string) {
  await db
    .update(refreshTokens)
    .set({ revoked: true })
    .where(eq(refreshTokens.token, token));
}

export async function getUserById(id: string) {
  const user = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!user) return null;
  return publicUser(user);
}
