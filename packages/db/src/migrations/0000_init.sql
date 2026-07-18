CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "public"."member_role" AS ENUM('OWNER', 'ADMIN', 'MEMBER');
CREATE TYPE "public"."platform_role" AS ENUM('USER', 'MODERATOR', 'SUPERADMIN');
CREATE TYPE "public"."venue_type" AS ENUM('RESTAURANT', 'BAR', 'CLUB', 'MIXED');
CREATE TYPE "public"."claim_status" AS ENUM('UNCLAIMED', 'PENDING', 'CLAIMED', 'VERIFIED');
CREATE TYPE "public"."venue_status" AS ENUM('DRAFT', 'PUBLISHED', 'SUSPENDED');
CREATE TYPE "public"."plan_name" AS ENUM('FREE', 'PRO', 'ENTERPRISE');
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'canceled', 'past_due', 'trialing', 'incomplete');

CREATE TABLE IF NOT EXISTS "geo_departments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "code" varchar(8) NOT NULL UNIQUE,
  "name" varchar(120) NOT NULL,
  "slug" varchar(120) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "geo_cities" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "department_id" uuid REFERENCES "geo_departments"("id"),
  "name" varchar(120) NOT NULL,
  "slug" varchar(120) NOT NULL UNIQUE,
  "is_major" boolean DEFAULT false NOT NULL,
  "lat" double precision,
  "lng" double precision,
  "activation_wave" varchar(32),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "geo_municipalities" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "city_id" uuid NOT NULL REFERENCES "geo_cities"("id") ON DELETE cascade,
  "name" varchar(120) NOT NULL,
  "slug" varchar(120) NOT NULL,
  "lat" double precision,
  "lng" double precision
);

CREATE TABLE IF NOT EXISTS "organizations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(255) NOT NULL,
  "slug" varchar(255) NOT NULL UNIQUE,
  "logo_url" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(255) NOT NULL,
  "email" varchar(255) NOT NULL UNIQUE,
  "password_hash" text,
  "avatar_url" text,
  "email_verified" boolean DEFAULT false NOT NULL,
  "platform_role" "platform_role" DEFAULT 'USER' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "organization_members" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE cascade,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "role" "member_role" DEFAULT 'MEMBER' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "venues" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid REFERENCES "organizations"("id") ON DELETE set null,
  "city_id" uuid NOT NULL REFERENCES "geo_cities"("id"),
  "municipality_id" uuid REFERENCES "geo_municipalities"("id"),
  "name" varchar(255) NOT NULL,
  "slug" varchar(255) NOT NULL UNIQUE,
  "description" text,
  "type" "venue_type" DEFAULT 'RESTAURANT' NOT NULL,
  "address" text,
  "phone" varchar(40),
  "website" text,
  "instagram" varchar(120),
  "lat" double precision NOT NULL,
  "lng" double precision NOT NULL,
  "rating_avg" real,
  "rating_count" integer DEFAULT 0 NOT NULL,
  "quality_score" real DEFAULT 0 NOT NULL,
  "curation_badge" boolean DEFAULT false NOT NULL,
  "claim_status" "claim_status" DEFAULT 'UNCLAIMED' NOT NULL,
  "booking_enabled" boolean DEFAULT false NOT NULL,
  "status" "venue_status" DEFAULT 'DRAFT' NOT NULL,
  "price_level" integer,
  "min_age" integer,
  "cover_amount" real,
  "has_guest_list" boolean DEFAULT false NOT NULL,
  "capacity" integer,
  "primary_source" varchar(40),
  "primary_external_id" varchar(120),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "refresh_tokens" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "token" text NOT NULL UNIQUE,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "revoked" boolean DEFAULT false NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "plans" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" "plan_name" NOT NULL UNIQUE,
  "stripe_monthly_price_id" varchar(255),
  "stripe_yearly_price_id" varchar(255),
  "max_members" integer DEFAULT 3 NOT NULL,
  "max_venues" integer DEFAULT 1 NOT NULL,
  "featured_listing" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "subscriptions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL UNIQUE REFERENCES "organizations"("id") ON DELETE cascade,
  "plan_id" uuid NOT NULL REFERENCES "plans"("id"),
  "stripe_customer_id" varchar(255) UNIQUE,
  "stripe_subscription_id" varchar(255) UNIQUE,
  "status" "subscription_status" DEFAULT 'active' NOT NULL,
  "current_period_start" timestamp with time zone,
  "current_period_end" timestamp with time zone,
  "cancel_at_period_end" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "venues_city_id_idx" ON "venues" ("city_id");
CREATE INDEX IF NOT EXISTS "venues_status_idx" ON "venues" ("status");
CREATE INDEX IF NOT EXISTS "venues_type_idx" ON "venues" ("type");
