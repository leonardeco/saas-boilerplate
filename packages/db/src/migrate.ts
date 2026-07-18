/**
 * Apply SQL migrations from src/migrations/*.sql in order.
 * Usage: DATABASE_URL=... npx tsx src/migrate.ts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const sql = postgres(url, { max: 1 });

  await sql`
    CREATE TABLE IF NOT EXISTS "__nighttable_migrations" (
      id text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `;

  const dir = path.join(__dirname, "migrations");
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const id = file;
    const existing = await sql`
      SELECT id FROM "__nighttable_migrations" WHERE id = ${id}
    `;
    if (existing.length) {
      console.log(`= ${id}`);
      continue;
    }
    const body = fs.readFileSync(path.join(dir, file), "utf8");
    await sql.unsafe(body);
    await sql`INSERT INTO "__nighttable_migrations" (id) VALUES (${id})`;
    console.log(`+ ${id}`);
  }

  await sql.end();
  console.log("Migrations complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
