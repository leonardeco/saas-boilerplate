/**
 * Production migration runner.
 * Applies all .sql files from src/migrations/ in alphabetical order,
 * tracking which ones ran in a `_migrations` table.
 * Safe to run on every deploy — already-applied migrations are skipped.
 */
import postgres from "postgres";
import { readdir, readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, "migrations");

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL is required to run migrations");
  process.exit(1);
}

const sql = postgres(DATABASE_URL);

// Create tracking table if it doesn't exist
await sql`
  CREATE TABLE IF NOT EXISTS _migrations (
    id        SERIAL PRIMARY KEY,
    filename  TEXT NOT NULL UNIQUE,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;

// Get already-applied migrations
const applied = await sql<{ filename: string }[]>`
  SELECT filename FROM _migrations ORDER BY filename
`;
const appliedSet = new Set(applied.map((r) => r.filename));

// Read all .sql files sorted alphabetically
const files = (await readdir(MIGRATIONS_DIR))
  .filter((f) => f.endsWith(".sql"))
  .sort();

for (const file of files) {
  if (appliedSet.has(file)) {
    console.log(`  ⏭  ${file} (already applied)`);
    continue;
  }

  const sqlContent = await readFile(join(MIGRATIONS_DIR, file), "utf-8");

  console.log(`  ▶  Applying ${file}...`);
  await sql.unsafe(sqlContent);
  await sql`INSERT INTO _migrations (filename) VALUES (${file})`;
  console.log(`  ✅ ${file} applied`);
}

console.log("✅ All migrations up to date");
await sql.end();
