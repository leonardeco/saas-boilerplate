/**
 * Smoke test against a deployed API.
 * Usage: node scripts/smoke-prod.mjs https://nighttable-api.onrender.com
 */
const base = (process.argv[2] || process.env.API_PUBLIC_URL || "").replace(/\/$/, "");
if (!base) {
  console.error("Usage: node scripts/smoke-prod.mjs https://your-api.example.com");
  process.exit(1);
}

async function check(path, expectOk = true) {
  const url = `${base}${path}`;
  const t0 = Date.now();
  try {
    const res = await fetch(url, { redirect: "manual" });
    const ms = Date.now() - t0;
    const ok = expectOk ? res.ok : true;
    let snippet = "";
    try {
      snippet = (await res.text()).slice(0, 120).replace(/\s+/g, " ");
    } catch {
      /* ignore */
    }
    console.log(`${ok ? "✓" : "✗"} ${res.status} ${ms}ms  ${path}  ${snippet}`);
    return ok && res.ok;
  } catch (e) {
    console.log(`✗ ERR  ${path}  ${e.message}`);
    return false;
  }
}

console.log(`Smoke → ${base}\n`);
const results = await Promise.all([
  check("/health"),
  check("/ready"),
  check("/geo/cities"),
  check("/metrics"),
  check("/docs", false), // may be 404 in prod — ok
]);

const critical = results.slice(0, 3).every(Boolean);
console.log(critical ? "\nSmoke critical paths OK" : "\nSmoke FAILED critical paths");
process.exit(critical ? 0 : 1);
