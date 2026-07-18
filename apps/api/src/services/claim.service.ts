import crypto from "node:crypto";
import { and, eq } from "drizzle-orm";
import {
  db,
  claimRequests,
  venues,
  organizationMembers,
} from "@saas/db";

export async function requestClaim(input: {
  venueId: string;
  userId: string;
  contactEmail: string;
  contactPhone?: string;
  message?: string;
  organizationId?: string;
}) {
  const venue = await db.query.venues.findFirst({
    where: eq(venues.id, input.venueId),
  });
  if (!venue) throw new Error("VENUE_NOT_FOUND");
  if (venue.claimStatus === "CLAIMED" || venue.claimStatus === "VERIFIED") {
    throw new Error("ALREADY_CLAIMED");
  }

  const token = crypto.randomBytes(24).toString("hex");
  const [row] = await db
    .insert(claimRequests)
    .values({
      venueId: input.venueId,
      userId: input.userId,
      organizationId: input.organizationId,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      message: input.message,
      verificationToken: token,
      status: "PENDING",
    })
    .returning();

  await db
    .update(venues)
    .set({ claimStatus: "PENDING", updatedAt: new Date() })
    .where(eq(venues.id, input.venueId));

  return { claim: row, verificationToken: token };
}

export async function approveClaim(claimId: string, adminUserId: string) {
  void adminUserId;
  const [claim] = await db
    .select()
    .from(claimRequests)
    .where(eq(claimRequests.id, claimId))
    .limit(1);
  if (!claim || claim.status !== "PENDING") throw new Error("INVALID_CLAIM");

  let orgId = claim.organizationId;
  if (!orgId) {
    // attach first org where user is OWNER
    const membership = await db.query.organizationMembers.findFirst({
      where: and(
        eq(organizationMembers.userId, claim.userId),
        eq(organizationMembers.role, "OWNER"),
      ),
    });
    orgId = membership?.organizationId ?? null;
  }
  if (!orgId) throw new Error("NO_ORGANIZATION");

  await db
    .update(venues)
    .set({
      organizationId: orgId,
      claimStatus: "CLAIMED",
      bookingEnabled: true,
      updatedAt: new Date(),
    })
    .where(eq(venues.id, claim.venueId));

  const [updated] = await db
    .update(claimRequests)
    .set({ status: "APPROVED", resolvedAt: new Date(), organizationId: orgId })
    .where(eq(claimRequests.id, claimId))
    .returning();

  return updated;
}

export async function rejectClaim(claimId: string) {
  const [claim] = await db
    .select()
    .from(claimRequests)
    .where(eq(claimRequests.id, claimId))
    .limit(1);
  if (!claim) throw new Error("NOT_FOUND");

  await db
    .update(venues)
    .set({ claimStatus: "UNCLAIMED", updatedAt: new Date() })
    .where(eq(venues.id, claim.venueId));

  return db
    .update(claimRequests)
    .set({ status: "REJECTED", resolvedAt: new Date() })
    .where(eq(claimRequests.id, claimId))
    .returning();
}

export async function listPendingClaims() {
  return db
    .select()
    .from(claimRequests)
    .where(eq(claimRequests.status, "PENDING"));
}
