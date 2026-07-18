import { z } from "zod";

export const venueTypeSchema = z.enum(["RESTAURANT", "BAR", "CLUB", "MIXED"]);
export const claimStatusSchema = z.enum([
  "UNCLAIMED",
  "PENDING",
  "CLAIMED",
  "VERIFIED",
]);
export const venueStatusSchema = z.enum(["DRAFT", "PUBLISHED", "SUSPENDED"]);
export const lensSchema = z.enum(["comer", "salir"]);

export const venuePublicSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  type: venueTypeSchema,
  citySlug: z.string(),
  municipalitySlug: z.string().nullable().optional(),
  address: z.string().nullable(),
  lat: z.number(),
  lng: z.number(),
  ratingAvg: z.number().nullable(),
  ratingCount: z.number(),
  qualityScore: z.number(),
  curationBadge: z.boolean(),
  bookingEnabled: z.boolean(),
  claimStatus: claimStatusSchema,
  minAge: z.number().int().nullable().optional(),
  coverAmount: z.number().nullable().optional(),
  hasGuestList: z.boolean().optional(),
  capacity: z.number().int().nullable().optional(),
  priceLevel: z.number().int().min(1).max(4).nullable().optional(),
  tags: z.array(z.string()).default([]),
});

export const searchQuerySchema = z.object({
  city: z.string().min(1),
  q: z.string().optional(),
  type: z.array(venueTypeSchema).optional(),
  minStars: z.coerce.number().min(0).max(5).optional(),
  lens: lensSchema.default("comer"),
  premiumOnly: z.coerce.boolean().default(true),
  bookingOnly: z.coerce.boolean().default(false),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export type VenuePublic = z.infer<typeof venuePublicSchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
