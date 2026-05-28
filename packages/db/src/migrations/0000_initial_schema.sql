-- Initial schema migration
-- Generated from Drizzle schema definitions

-- ─── Enums ────────────────────────────────────────────────────────────────────

CREATE TYPE "member_role" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');
CREATE TYPE "plan_name" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');
CREATE TYPE "subscription_status" AS ENUM ('active', 'canceled', 'past_due', 'trialing', 'incomplete');
CREATE TYPE "oauth_provider" AS ENUM ('google', 'github');

-- ─── Users ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "users" (
  "id"             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name"           VARCHAR(255) NOT NULL,
  "email"          VARCHAR(255) NOT NULL UNIQUE,
  "password_hash"  TEXT,
  "avatar_url"     TEXT,
  "email_verified" BOOLEAN NOT NULL DEFAULT false,
  "created_at"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Organizations ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "organizations" (
  "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name"       VARCHAR(255) NOT NULL,
  "slug"       VARCHAR(255) NOT NULL UNIQUE,
  "logo_url"   TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "organization_members" (
  "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "organization_id" UUID NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "user_id"         UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "role"            "member_role" NOT NULL DEFAULT 'MEMBER',
  "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Plans & Subscriptions ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "plans" (
  "id"                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name"                   "plan_name" NOT NULL UNIQUE,
  "stripe_monthly_price_id" VARCHAR(255),
  "stripe_yearly_price_id"  VARCHAR(255),
  "max_members"            INTEGER NOT NULL DEFAULT 1,
  "max_projects"           INTEGER NOT NULL DEFAULT 3,
  "created_at"             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "subscriptions" (
  "id"                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "organization_id"       UUID NOT NULL UNIQUE REFERENCES "organizations"("id") ON DELETE CASCADE,
  "plan_id"               UUID NOT NULL REFERENCES "plans"("id"),
  "stripe_customer_id"    VARCHAR(255) UNIQUE,
  "stripe_subscription_id" VARCHAR(255) UNIQUE,
  "status"                "subscription_status" NOT NULL DEFAULT 'active',
  "current_period_start"  TIMESTAMPTZ,
  "current_period_end"    TIMESTAMPTZ,
  "cancel_at_period_end"  TIMESTAMPTZ,
  "created_at"            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Refresh Tokens ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "refresh_tokens" (
  "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "token"      TEXT NOT NULL UNIQUE,
  "user_id"    UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "revoked"    BOOLEAN NOT NULL DEFAULT false,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── OAuth Accounts ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "oauth_accounts" (
  "id"               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"          UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "provider"         "oauth_provider" NOT NULL,
  "provider_user_id" VARCHAR(255) NOT NULL,
  "email"            VARCHAR(255),
  "name"             VARCHAR(255),
  "avatar_url"       TEXT,
  "created_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("provider", "provider_user_id")
);

-- ─── Password Reset Tokens ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "token_hash"  TEXT NOT NULL UNIQUE,
  "user_id"     UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "expires_at"  TIMESTAMPTZ NOT NULL,
  "used_at"     TIMESTAMPTZ,
  "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Seed: default plans ──────────────────────────────────────────────────────

INSERT INTO "plans" ("name", "max_members", "max_projects") VALUES
  ('FREE',       1,  3),
  ('PRO',       10, 20),
  ('ENTERPRISE', 100, 999)
ON CONFLICT ("name") DO NOTHING;
