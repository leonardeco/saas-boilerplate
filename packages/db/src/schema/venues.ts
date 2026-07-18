import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
  boolean,
  doublePrecision,
  integer,
  real,
} from "drizzle-orm/pg-core";
import { geoCities, geoMunicipalities } from "./geo.js";
import { organizations } from "./organizations.js";

export const venueTypeEnum = pgEnum("venue_type", [
  "RESTAURANT",
  "BAR",
  "CLUB",
  "MIXED",
]);

export const claimStatusEnum = pgEnum("claim_status", [
  "UNCLAIMED",
  "PENDING",
  "CLAIMED",
  "VERIFIED",
]);

export const venueStatusEnum = pgEnum("venue_status", [
  "DRAFT",
  "PUBLISHED",
  "SUSPENDED",
]);

export const venues = pgTable("venues", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id, {
    onDelete: "set null",
  }),
  cityId: uuid("city_id")
    .notNull()
    .references(() => geoCities.id),
  municipalityId: uuid("municipality_id").references(() => geoMunicipalities.id),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  type: venueTypeEnum("type").notNull().default("RESTAURANT"),
  address: text("address"),
  phone: varchar("phone", { length: 40 }),
  website: text("website"),
  instagram: varchar("instagram", { length: 120 }),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  ratingAvg: real("rating_avg"),
  ratingCount: integer("rating_count").notNull().default(0),
  qualityScore: real("quality_score").notNull().default(0),
  curationBadge: boolean("curation_badge").notNull().default(false),
  claimStatus: claimStatusEnum("claim_status").notNull().default("UNCLAIMED"),
  bookingEnabled: boolean("booking_enabled").notNull().default(false),
  status: venueStatusEnum("status").notNull().default("DRAFT"),
  priceLevel: integer("price_level"),
  // Nightlife
  minAge: integer("min_age"),
  coverAmount: real("cover_amount"),
  hasGuestList: boolean("has_guest_list").notNull().default(false),
  capacity: integer("capacity"),
  primarySource: varchar("primary_source", { length: 40 }),
  primaryExternalId: varchar("primary_external_id", { length: 120 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Venue = typeof venues.$inferSelect;
export type NewVenue = typeof venues.$inferInsert;
