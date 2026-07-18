/**
 * Generate production secrets for NightTable CO.
 * Usage: node scripts/gen-secrets.mjs
 * Copy output into Render/Railway — never commit values.
 */
import { randomBytes } from "node:crypto";

function secret(bytes = 48) {
  return randomBytes(bytes).toString("base64url");
}

const out = {
  JWT_ACCESS_SECRET: secret(48),
  JWT_REFRESH_SECRET: secret(48),
  MEILI_MASTER_KEY: secret(32),
  NEXTAUTH_HINT: "not used — cookies use JWT secrets",
};

console.log("# Paste into Render / Railway (do not commit)\n");
for (const [k, v] of Object.entries(out)) {
  if (k.endsWith("_HINT")) continue;
  console.log(`${k}=${v}`);
}
console.log(`
# After services exist, set URLs like:
# WEB_URL=https://nighttable-web.onrender.com
# CORS_ORIGIN=https://nighttable-web.onrender.com
# API_PUBLIC_URL=https://nighttable-api.onrender.com
# NEXT_PUBLIC_API_URL=https://nighttable-api.onrender.com
# COOKIE_SECURE=true
# TRUST_PROXY=true
# NODE_ENV=production
`);
