import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DATABASE_READ_URL: z.string().optional(),
  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET min 32 chars"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET min 32 chars"),
  JWT_ACCESS_EXPIRES: z.string().default("15m"),
  JWT_REFRESH_EXPIRES: z.string().default("7d"),
  API_PORT: z.coerce.number().default(parseInt(process.env.PORT ?? "3001", 10)),
  API_HOST: z.string().default("0.0.0.0"),
  API_PUBLIC_URL: z.string().optional(),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  MEILI_HOST: z.string().optional(),
  MEILI_MASTER_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  WEB_URL: z.string().default("http://localhost:3000"),
  COOKIE_SECURE: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  ENABLE_SWAGGER: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
  TRUST_PROXY: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const WEAK = [
  "change-me",
  "secret",
  "password",
  "123456",
  "ci-access",
  "ci-refresh",
  "min-32",
];

function looksWeak(secret: string) {
  const s = secret.toLowerCase();
  return WEAK.some((w) => s.includes(w)) || /^(.)\1+$/.test(secret);
}

function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("\nInvalid environment variables:\n");
    for (const err of result.error.errors) {
      console.error(`  • ${err.path.join(".")}: ${err.message}`);
    }
    console.error("\nCopy .env.example → .env and fill required values.\n");
    process.exit(1);
  }

  const data = result.data;

  if (data.NODE_ENV === "production") {
    const hardErrors: string[] = [];

    if (looksWeak(data.JWT_ACCESS_SECRET) || looksWeak(data.JWT_REFRESH_SECRET)) {
      hardErrors.push("JWT secrets look weak/default — generate with openssl rand -base64 48");
    }
    if (data.JWT_ACCESS_SECRET === data.JWT_REFRESH_SECRET) {
      hardErrors.push("JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must differ");
    }
    if (!data.COOKIE_SECURE) {
      hardErrors.push("COOKIE_SECURE must be true in production");
    }
    if (!data.WEB_URL.startsWith("https://")) {
      hardErrors.push("WEB_URL must be https:// in production");
    }
    if (
      data.CORS_ORIGIN.includes("localhost") ||
      data.CORS_ORIGIN === "*"
    ) {
      hardErrors.push("CORS_ORIGIN must be your production web origin (not localhost/*)");
    }
    if (data.STRIPE_SECRET_KEY?.startsWith("sk_test_")) {
      console.warn(
        "⚠️  STRIPE_SECRET_KEY is test mode in production NODE_ENV",
      );
    }
    if (!data.REDIS_URL || data.REDIS_URL.includes("localhost")) {
      console.warn(
        "⚠️  REDIS_URL looks local — booking locks need shared Redis in multi-instance prod",
      );
    }

    if (hardErrors.length) {
      console.error("\nProduction env hardening failed:\n");
      for (const e of hardErrors) console.error(`  • ${e}`);
      console.error("");
      process.exit(1);
    }
  }

  return data;
}

export const env = validateEnv();
