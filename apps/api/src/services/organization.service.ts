import { db, organizations, organizationMembers, users } from "@saas/db";
import { eq, and } from "drizzle-orm";

export async function getOrganizationsByUser(userId: string) {
  return db.query.organizationMembers.findMany({
    where: eq(organizationMembers.userId, userId),
    with: { organization: { with: { subscription: { with: { plan: true } } } } },
  });
}

export async function getOrganization(slug: string, userId: string) {
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.slug, slug),
    with: {
      members: { with: { user: true } },
      subscription: { with: { plan: true } },
    },
  });

  if (!org) throw new Error("NOT_FOUND");

  const isMember = org.members.some((m) => m.userId === userId);
  if (!isMember) throw new Error("FORBIDDEN");

  return org;
}

export async function updateOrganization(
  slug: string,
  userId: string,
  data: { name?: string; logoUrl?: string },
) {
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.slug, slug),
    with: { members: true },
  });
  if (!org) throw new Error("NOT_FOUND");

  const member = org.members.find((m) => m.userId === userId);
  if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
    throw new Error("FORBIDDEN");
  }

  const [updated] = await db
    .update(organizations)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(organizations.id, org.id))
    .returning();

  return updated;
}

export async function inviteMember(orgSlug: string, inviterId: string, email: string, role: "ADMIN" | "MEMBER") {
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.slug, orgSlug),
    with: { members: true },
  });
  if (!org) throw new Error("NOT_FOUND");

  const inviter = org.members.find((m) => m.userId === inviterId);
  if (!inviter || (inviter.role !== "OWNER" && inviter.role !== "ADMIN")) {
    throw new Error("FORBIDDEN");
  }

  const target = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!target) throw new Error("USER_NOT_FOUND");

  const existing = org.members.find((m) => m.userId === target.id);
  if (existing) throw new Error("ALREADY_MEMBER");

  const [member] = await db
    .insert(organizationMembers)
    .values({ organizationId: org.id, userId: target.id, role })
    .returning();

  return member;
}

export async function removeMember(orgSlug: string, removerId: string, memberId: string) {
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.slug, orgSlug),
    with: { members: true },
  });
  if (!org) throw new Error("NOT_FOUND");

  const remover = org.members.find((m) => m.userId === removerId);
  if (!remover || (remover.role !== "OWNER" && remover.role !== "ADMIN")) {
    throw new Error("FORBIDDEN");
  }

  const target = org.members.find((m) => m.userId === memberId);
  if (!target) throw new Error("NOT_FOUND");
  if (target.role === "OWNER") throw new Error("CANNOT_REMOVE_OWNER");

  await db
    .delete(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, org.id),
        eq(organizationMembers.userId, memberId),
      ),
    );
}
