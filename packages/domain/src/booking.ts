/**
 * Booking state machine (ADR-0004). Pure transitions.
 */

export const RESERVATION_STATUSES = [
  "HOLD",
  "CONFIRMED",
  "CANCELLED",
  "NO_SHOW",
  "COMPLETED",
] as const;

export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

const ALLOWED: Record<ReservationStatus, ReservationStatus[]> = {
  HOLD: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "NO_SHOW", "CANCELLED"],
  CANCELLED: [],
  NO_SHOW: [],
  COMPLETED: [],
};

export function canTransition(
  from: ReservationStatus,
  to: ReservationStatus,
): boolean {
  return ALLOWED[from].includes(to);
}

export function assertTransition(
  from: ReservationStatus,
  to: ReservationStatus,
): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid booking transition: ${from} → ${to}`);
  }
}

export function canHold(params: {
  capacity: number;
  reservedCount: number;
  partySize: number;
  holdExpiresAt: Date;
  now?: Date;
}): { ok: true } | { ok: false; reason: string } {
  const now = params.now ?? new Date();
  if (params.partySize < 1) return { ok: false, reason: "invalid_party_size" };
  if (params.holdExpiresAt.getTime() <= now.getTime()) {
    return { ok: false, reason: "hold_ttl_invalid" };
  }
  const remaining = params.capacity - params.reservedCount;
  if (params.partySize > remaining) {
    return { ok: false, reason: "insufficient_capacity" };
  }
  return { ok: true };
}

export function defaultHoldExpiresAt(now = new Date(), ttlMinutes = 8): Date {
  return new Date(now.getTime() + ttlMinutes * 60_000);
}
