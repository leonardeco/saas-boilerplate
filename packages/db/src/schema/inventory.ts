import {
  pgTable,
  uuid,
  timestamp,
  integer,
  varchar,
  pgEnum,
} from "drizzle-orm/pg-core";
import { venues } from "./venues.js";
import { users } from "./organizations.js";

export const reservationStatusPgEnum = pgEnum("reservation_status", [
  "HOLD",
  "CONFIRMED",
  "CANCELLED",
  "NO_SHOW",
  "COMPLETED",
]);

export const availabilitySlots = pgTable("availability_slots", {
  id: uuid("id").primaryKey().defaultRandom(),
  venueId: uuid("venue_id")
    .notNull()
    .references(() => venues.id, { onDelete: "cascade" }),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  capacity: integer("capacity").notNull().default(10),
  reservedCount: integer("reserved_count").notNull().default(0),
  label: varchar("label", { length: 80 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const reservations = pgTable("reservations", {
  id: uuid("id").primaryKey().defaultRandom(),
  venueId: uuid("venue_id")
    .notNull()
    .references(() => venues.id, { onDelete: "cascade" }),
  slotId: uuid("slot_id")
    .notNull()
    .references(() => availabilitySlots.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  partySize: integer("party_size").notNull(),
  status: reservationStatusPgEnum("status").notNull().default("HOLD"),
  guestName: varchar("guest_name", { length: 200 }).notNull(),
  guestEmail: varchar("guest_email", { length: 255 }).notNull(),
  guestPhone: varchar("guest_phone", { length: 40 }),
  notes: varchar("notes", { length: 500 }),
  holdExpiresAt: timestamp("hold_expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
