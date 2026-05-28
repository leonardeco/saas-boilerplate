import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url("NEXT_PUBLIC_API_URL debe ser una URL valida"),
  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET debe tener al menos 32 caracteres"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

function validateEnv() {
  const result = envSchema.safeParse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    NODE_ENV: process.env.NODE_ENV,
  });

  if (!result.success) {
    console.error("\n❌ Variables de entorno invalidas o faltantes en Web:\n");
    result.error.errors.forEach((err) => {
      console.error(`  • ${err.path.join(".")}: ${err.message}`);
    });
    console.error("\n💡 Copia .env.example a .env y completa los valores requeridos.\n");
    if (process.env.NODE_ENV === "production") process.exit(1);
  }

  return result.data!;
}

export const env = validateEnv();
