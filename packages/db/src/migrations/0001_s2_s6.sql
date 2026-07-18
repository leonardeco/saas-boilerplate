CREATE TYPE "public"."ingestion_job_status" AS ENUM('queued', 'running', 'completed', 'failed');
CREATE TYPE "public"."reservation_status" AS ENUM('HOLD', 'CONFIRMED', 'CANCELLED', 'NO_SHOW', 'COMPLETED');
CREATE TYPE "public"."claim_request_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE IF NOT EXISTS "venue_sources" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "venue_id" uuid NOT NULL REFERENCES "venues"("id") ON DELETE cascade,
  "provider" varchar(40) NOT NULL,
  "external_id" varchar(120) NOT NULL,
  "raw_hash" varchar(64),
  "last_synced_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "raw_place_payloads" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "provider" varchar(40) NOT NULL,
  "external_id" varchar(120) NOT NULL,
  "payload" jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "ingestion_jobs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "provider" varchar(40) NOT NULL,
  "city_slug" varchar(120),
  "status" "ingestion_job_status" DEFAULT 'queued' NOT NULL,
  "result_count" integer DEFAULT 0,
  "error_message" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "finished_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "feature_flags" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "key" varchar(120) NOT NULL UNIQUE,
  "enabled" integer DEFAULT 1 NOT NULL,
  "description" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "availability_slots" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "venue_id" uuid NOT NULL REFERENCES "venues"("id") ON DELETE cascade,
  "starts_at" timestamp with time zone NOT NULL,
  "ends_at" timestamp with time zone NOT NULL,
  "capacity" integer DEFAULT 10 NOT NULL,
  "reserved_count" integer DEFAULT 0 NOT NULL,
  "label" varchar(80),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "reserved_lte_capacity" CHECK (reserved_count <= capacity)
);

CREATE TABLE IF NOT EXISTS "reservations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "venue_id" uuid NOT NULL REFERENCES "venues"("id") ON DELETE cascade,
  "slot_id" uuid NOT NULL REFERENCES "availability_slots"("id") ON DELETE cascade,
  "user_id" uuid REFERENCES "users"("id") ON DELETE set null,
  "party_size" integer NOT NULL,
  "status" "reservation_status" DEFAULT 'HOLD' NOT NULL,
  "guest_name" varchar(200) NOT NULL,
  "guest_email" varchar(255) NOT NULL,
  "guest_phone" varchar(40),
  "notes" varchar(500),
  "hold_expires_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "claim_requests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "venue_id" uuid NOT NULL REFERENCES "venues"("id") ON DELETE cascade,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "organization_id" uuid REFERENCES "organizations"("id"),
  "contact_email" varchar(255) NOT NULL,
  "contact_phone" varchar(40),
  "message" text,
  "verification_token" varchar(128),
  "status" "claim_request_status" DEFAULT 'PENDING' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "resolved_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "reviews" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "venue_id" uuid NOT NULL REFERENCES "venues"("id") ON DELETE cascade,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "stars" integer NOT NULL,
  "body" text,
  "verified_visit" boolean DEFAULT false NOT NULL,
  "flagged" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "reviews_user_venue_uidx" ON "reviews" ("user_id", "venue_id");
CREATE INDEX IF NOT EXISTS "slots_venue_starts_idx" ON "availability_slots" ("venue_id", "starts_at");
CREATE INDEX IF NOT EXISTS "reservations_venue_status_idx" ON "reservations" ("venue_id", "status");
