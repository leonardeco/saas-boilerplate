import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  doublePrecision,
} from "drizzle-orm/pg-core";

export const geoDepartments = pgTable("geo_departments", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 8 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
});

export const geoCities = pgTable("geo_cities", {
  id: uuid("id").primaryKey().defaultRandom(),
  departmentId: uuid("department_id").references(() => geoDepartments.id),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  isMajor: boolean("is_major").notNull().default(false),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  activationWave: varchar("activation_wave", { length: 32 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const geoMunicipalities = pgTable("geo_municipalities", {
  id: uuid("id").primaryKey().defaultRandom(),
  cityId: uuid("city_id")
    .notNull()
    .references(() => geoCities.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull(),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
});
