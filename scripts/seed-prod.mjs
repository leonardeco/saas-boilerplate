/**
 * Production-safe seed: geo + plans + flags, NO demo venues.
 * Requires DATABASE_URL.
 */
import { spawnSync } from "node:child_process";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

process.env.NODE_ENV = "production";
process.env.SEED_DEMO_VENUES = "false";

const r = spawnSync(
  "npm",
  ["run", "db:seed", "-w", "@saas/db"],
  { stdio: "inherit", env: process.env, shell: true },
);
process.exit(r.status ?? 1);
