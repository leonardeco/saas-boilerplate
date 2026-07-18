import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core";
import { venues } from "./venues.js";

export const ingestionJobStatusEnum = pgEnum("ingestion_job_status", [
  "queued",
  "running",
  "completed",
  "failed",
]);

export const venueSources = pgTable("venue_sources", {
  id: uuid("id").primaryKey().defaultRandom(),
  venueId: uuid("venue_id")
    .notNull()
    .references(() => venues.id, { onDelete: "cascade" }),
  provider: varchar("provider", { length: 40 }).notNull(),
  externalId: varchar("external_id", { length: 120 }).notNull(),
  rawHash: varchar("raw_hash", { length: 64 }),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const rawPlacePayloads = pgTable("raw_place_payloads", {
  id: uuid("id").primaryKey().defaultRandom(),
  provider: varchar("provider", { length: 40 }).notNull(),
  externalId: varchar("external_id", { length: 120 }).notNull(),
  payload: jsonb("payload").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const ingestionJobs = pgTable("ingestion_jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  provider: varchar("provider", { length: 40 }).notNull(),
  citySlug: varchar("city_slug", { length: 120 }),
  status: ingestionJobStatusEnum("status").notNull().default("queued"),
  resultCount: integer("result_count").default(0),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
});

export const featureFlags = pgTable("feature_flags", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: varchar("key", { length: 120 }).notNull().unique(),
  enabled: integer("enabled").notNull().default(1),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
