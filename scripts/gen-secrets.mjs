/**
 * Generate production secrets for NightTable CO.
 * Usage: node scripts/gen-secrets.mjs
 * Writes secrets.local.env (gitignored) and prints only the path.
 * Never commit values.
 */
import { randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

function secret(bytes = 48) {
  return randomBytes(bytes).toString("base64url");
}

const out = {
  JWT_ACCESS_SECRET: secret(48),
  JWT_REFRESH_SECRET: secret(48),
  MEILI_MASTER_KEY: secret(32),
};

const file = path.resolve("secrets.local.env");
const existing = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";

// Don't overwrite existing secrets unless FORCE=1
if (existing.includes("JWT_ACCESS_SECRET=") && process.env.FORCE !== "1") {
  console.log(`Secrets already in ${file}`);
  console.log("Re-run with FORCE=1 to rotate (will overwrite).");
  console.log("\nNext: open Render Blueprint → paste JWT_* from that file.");
  process.exit(0);
}

const body = `# NightTable local secrets — DO NOT COMMIT
# Generated ${new Date().toISOString()}

JWT_ACCESS_SECRET=${out.JWT_ACCESS_SECRET}
JWT_REFRESH_SECRET=${out.JWT_REFRESH_SECRET}
MEILI_MASTER_KEY=${out.MEILI_MASTER_KEY}

# Fill after Render creates services:
# WEB_URL=https://nighttable-web-xxxx.onrender.com
# CORS_ORIGIN=https://nighttable-web-xxxx.onrender.com
# API_PUBLIC_URL=https://nighttable-api-xxxx.onrender.com
# NEXT_PUBLIC_API_URL=https://nighttable-api-xxxx.onrender.com

NODE_ENV=production
COOKIE_SECURE=true
TRUST_PROXY=true
`;

fs.writeFileSync(file, body, "utf8");
console.log(`Wrote ${file}`);
console.log("Open that file locally and copy JWT_* into Render (do not paste secrets in chat).");
console.log("\nRender: https://dashboard.render.com → New → Blueprint → leonardeco/saas-boilerplate");
