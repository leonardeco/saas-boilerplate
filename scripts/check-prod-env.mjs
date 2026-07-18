/**
 * Pre-deploy production env sanity check (no secrets printed).
 * Usage: node scripts/check-prod-env.mjs
 * Exit 1 if critical issues.
 */
const required = [
  "DATABASE_URL",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "CORS_ORIGIN",
  "WEB_URL",
  "REDIS_URL",
];

const warnings = [];
const errors = [];

for (const k of required) {
  if (!process.env[k]) errors.push(`missing ${k}`);
}

const access = process.env.JWT_ACCESS_SECRET ?? "";
const refresh = process.env.JWT_REFRESH_SECRET ?? "";
if (access.length < 32) errors.push("JWT_ACCESS_SECRET too short");
if (refresh.length < 32) errors.push("JWT_REFRESH_SECRET too short");
if (access && refresh && access === refresh) {
  errors.push("JWT secrets must differ");
}
if (process.env.COOKIE_SECURE !== "true") {
  errors.push("COOKIE_SECURE must be true");
}
if (process.env.WEB_URL && !process.env.WEB_URL.startsWith("https://")) {
  errors.push("WEB_URL must be https");
}
if (process.env.CORS_ORIGIN?.includes("localhost")) {
  errors.push("CORS_ORIGIN still localhost");
}
if (process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_")) {
  warnings.push("Stripe still in test mode");
}
if (!process.env.RESEND_API_KEY) warnings.push("RESEND_API_KEY not set (email preview only)");
if (!process.env.MEILI_HOST) warnings.push("MEILI_HOST not set (Postgres search only)");
if (!process.env.DATABASE_READ_URL) warnings.push("No read replica configured");

console.log("NightTable production env check\n");
if (errors.length) {
  console.log("ERRORS:");
  errors.forEach((e) => console.log("  ✗", e));
}
if (warnings.length) {
  console.log("WARNINGS:");
  warnings.forEach((w) => console.log("  !", w));
}
if (!errors.length) {
  console.log("  ✓ critical checks passed");
}
process.exit(errors.length ? 1 : 0);
