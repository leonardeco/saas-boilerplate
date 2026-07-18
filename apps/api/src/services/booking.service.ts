import { and, eq, gt, sql } from "drizzle-orm";
import {
  db,
  availabilitySlots,
  reservations,
  venues,
  organizationMembers,
} from "@saas/db";
import {
  assertTransition,
  canHold,
  defaultHoldExpiresAt,
} from "@saas/domain";
import { withSlotLock } from "../lib/redis.js";
import type { HoldRequest } from "@saas/contracts";

export async function listSlots(venueId: string) {
  const now = new Date();
  return db
    .select()
    .from(availabilitySlots)
    .where(
      and(
        eq(availabilitySlots.venueId, venueId),
        gt(availabilitySlots.startsAt, now),
      ),
    )
    .orderBy(availabilitySlots.startsAt);
}

export async function createSlot(input: {
  venueId: string;
  startsAt: Date;
  endsAt: Date;
  capacity: number;
  label?: string;
}) {
  const [slot] = await db
    .insert(availabilitySlots)
    .values({
      venueId: input.venueId,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      capacity: input.capacity,
      label: input.label,
    })
    .returning();
  return slot;
}

export async function holdReservation(
  input: HoldRequest,
  userId?: string,
) {
  const venue = await db.query.venues.findFirst({
    where: eq(venues.id, input.venueId),
  });
  if (!venue || !venue.bookingEnabled || venue.status !== "PUBLISHED") {
    throw new Error("BOOKING_DISABLED");
  }

  return withSlotLock(input.slotId, async () => {
    const [slot] = await db
      .select()
      .from(availabilitySlots)
      .where(eq(availabilitySlots.id, input.slotId))
      .limit(1);
    if (!slot || slot.venueId !== input.venueId) throw new Error("SLOT_NOT_FOUND");

    const holdExpiresAt = defaultHoldExpiresAt();
    const check = canHold({
      capacity: slot.capacity,
      reservedCount: slot.reservedCount,
      partySize: input.partySize,
      holdExpiresAt,
    });
    if (!check.ok) throw new Error(check.reason.toUpperCase());

    const [reservation] = await db
      .insert(reservations)
      .values({
        venueId: input.venueId,
        slotId: input.slotId,
        userId: userId ?? null,
        partySize: input.partySize,
        status: "HOLD",
        guestName: input.guestName,
        guestEmail: input.guestEmail,
        guestPhone: input.guestPhone,
        notes: input.notes,
        holdExpiresAt,
      })
      .returning();

    await db
      .update(availabilitySlots)
      .set({ reservedCount: sql`${availabilitySlots.reservedCount} + ${input.partySize}` })
      .where(eq(availabilitySlots.id, input.slotId));

    return reservation;
  });
}

export async function confirmReservation(id: string, userId?: string) {
  const [res] = await db
    .select()
    .from(reservations)
    .where(eq(reservations.id, id))
    .limit(1);
  if (!res) throw new Error("NOT_FOUND");
  if (userId && res.userId && res.userId !== userId) throw new Error("FORBIDDEN");

  if (res.status === "HOLD" && res.holdExpiresAt && res.holdExpiresAt < new Date()) {
    await expireHold(res.id, res.slotId, res.partySize);
    throw new Error("HOLD_EXPIRED");
  }

  assertTransition(res.status, "CONFIRMED");

  const [updated] = await db
    .update(reservations)
    .set({ status: "CONFIRMED", holdExpiresAt: null, updatedAt: new Date() })
    .where(eq(reservations.id, id))
    .returning();
  return updated;
}

export async function cancelReservation(id: string, actor: {
  userId?: string;
  isStaff?: boolean;
}) {
  const [res] = await db
    .select()
    .from(reservations)
    .where(eq(reservations.id, id))
    .limit(1);
  if (!res) throw new Error("NOT_FOUND");
  if (!actor.isStaff && actor.userId && res.userId && res.userId !== actor.userId) {
    throw new Error("FORBIDDEN");
  }

  assertTransition(res.status, "CANCELLED");

  return withSlotLock(res.slotId, async () => {
    const [updated] = await db
      .update(reservations)
      .set({ status: "CANCELLED", updatedAt: new Date() })
      .where(eq(reservations.id, id))
      .returning();

    if (res.status === "HOLD" || res.status === "CONFIRMED") {
      await db
        .update(availabilitySlots)
        .set({
          reservedCount: sql`GREATEST(0, ${availabilitySlots.reservedCount} - ${res.partySize})`,
        })
        .where(eq(availabilitySlots.id, res.slotId));
    }
    return updated;
  });
}

async function expireHold(id: string, slotId: string, partySize: number) {
  await db
    .update(reservations)
    .set({ status: "CANCELLED", updatedAt: new Date() })
    .where(eq(reservations.id, id));
  await db
    .update(availabilitySlots)
    .set({
      reservedCount: sql`GREATEST(0, ${availabilitySlots.reservedCount} - ${partySize})`,
    })
    .where(eq(availabilitySlots.id, slotId));
}

export async function listAgenda(venueId: string, userId: string) {
  const venue = await db.query.venues.findFirst({ where: eq(venues.id, venueId) });
  if (!venue?.organizationId) throw new Error("FORBIDDEN");

  const membership = await db.query.organizationMembers.findFirst({
    where: and(
      eq(organizationMembers.organizationId, venue.organizationId),
      eq(organizationMembers.userId, userId),
    ),
  });
  if (!membership) throw new Error("FORBIDDEN");

  return db
    .select()
    .from(reservations)
    .where(eq(reservations.venueId, venueId))
    .orderBy(reservations.createdAt);
}

export async function myReservations(userId: string) {
  return db
    .select()
    .from(reservations)
    .where(eq(reservations.userId, userId))
    .orderBy(reservations.createdAt);
}
