/**
 * Promote a user to SUPERADMIN by email.
 * Usage: DATABASE_URL=... node scripts/make-superadmin.mjs you@email.com
 */
import postgres from "postgres";

const email = process.argv[2];
const url = process.env.DATABASE_URL;

if (!email || !url) {
  console.error("Usage: DATABASE_URL=... node scripts/make-superadmin.mjs email@example.com");
  process.exit(1);
}

const sql = postgres(url, { max: 1 });
const rows = await sql`
  UPDATE users
  SET platform_role = 'SUPERADMIN'
  WHERE email = ${email}
  RETURNING id, email, platform_role
`;

if (!rows.length) {
  console.error(`No user found for ${email}`);
  await sql.end();
  process.exit(1);
}

console.log("Updated:", rows[0]);
await sql.end();
