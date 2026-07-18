CREATE TABLE IF NOT EXISTS "oauth_accounts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "provider" varchar(40) NOT NULL,
  "provider_account_id" varchar(255) NOT NULL,
  "access_token" text,
  "refresh_token" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "oauth_provider_account_uidx"
  ON "oauth_accounts" ("provider", "provider_account_id");
