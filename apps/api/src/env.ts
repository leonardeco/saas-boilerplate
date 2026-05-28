import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL debe ser una URL valida de PostgreSQL"),
  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET debe tener al menos 32 caracteres"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET debe tener al menos 32 caracteres"),
  JWT_ACCESS_EXPIRES: z.string().default("15m"),
  JWT_REFRESH_EXPIRES: z.string().default("7d"),
  API_PORT: z.coerce.number().default(3001),
  API_HOST: z.string().default("0.0.0.0"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  STRIPE_SECRET_KEY: z.string().startsWith("sk_", "STRIPE_SECRET_KEY debe empezar con sk_"),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_", "STRIPE_WEBHOOK_SECRET debe empezar con whsec_"),
  // Email — Resend (produccion) o Ethereal auto (desarrollo sin config)
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().default("no-reply@saas-boilerplate.com"),
  // SMTP alternativo (si no usas Resend ni quieres Ethereal)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  // OAuth — opcionales, la app arranca sin ellos pero deshabilita esos providers
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  WEB_URL: z.string().url().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("\n❌ Variables de entorno invalidas o faltantes:\n");
    result.error.errors.forEach((err) => {
      console.error(`  • ${err.path.join(".")}: ${err.message}`);
    });
    console.error("\n💡 Copia .env.example a .env y completa los valores requeridos.\n");
    process.exit(1);
  }

  return result.data;
}

export const env = validateEnv();
