import { z } from "zod";

export const reservationStatusSchema = z.enum([
  "HOLD",
  "CONFIRMED",
  "CANCELLED",
  "NO_SHOW",
  "COMPLETED",
]);

export const holdRequestSchema = z.object({
  venueId: z.string().uuid(),
  slotId: z.string().uuid(),
  partySize: z.number().int().min(1).max(50),
  guestName: z.string().min(1).max(200),
  guestEmail: z.string().email(),
  guestPhone: z.string().min(7).max(30).optional(),
  notes: z.string().max(500).optional(),
});

export const reservationSchema = z.object({
  id: z.string().uuid(),
  venueId: z.string().uuid(),
  slotId: z.string().uuid(),
  status: reservationStatusSchema,
  partySize: z.number().int(),
  holdExpiresAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
});

export type HoldRequest = z.infer<typeof holdRequestSchema>;
export type Reservation = z.infer<typeof reservationSchema>;
