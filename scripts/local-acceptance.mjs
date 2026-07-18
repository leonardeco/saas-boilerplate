/**
 * Local end-to-end acceptance against running API.
 * Usage: node scripts/local-acceptance.mjs [http://127.0.0.1:3001]
 */
const base = (process.argv[2] || "http://127.0.0.1:3001").replace(/\/$/, "");
const email = `qa_${Date.now()}@nighttable.local`;
const password = "TestPass123!";
const name = "QA Local";

let passed = 0;
let failed = 0;
const jar = { cookie: "" };

function log(ok, msg, extra = "") {
  console.log(`${ok ? "✓" : "✗"} ${msg}${extra ? " — " + extra : ""}`);
  if (ok) passed++;
  else failed++;
}

async function req(path, opts = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(opts.headers || {}),
  };
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
  if (jar.cookie) headers.Cookie = jar.cookie;

  const res = await fetch(`${base}${path}`, {
    ...opts,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  const setCookie = res.headers.getSetCookie?.() || [];
  if (setCookie.length) {
    jar.cookie = setCookie.map((c) => c.split(";")[0]).join("; ");
  }

  let data = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { res, data, status: res.status };
}

async function main() {
  console.log(`\nNightTable local acceptance → ${base}\n`);

  // 1 health
  {
    const { status, data } = await req("/health");
    log(status === 200 && data?.ok, "GET /health", `v${data?.version}`);
  }

  // 2 geo
  {
    const { status, data } = await req("/geo/cities");
    log(
      status === 200 && Array.isArray(data?.data) && data.data.length >= 5,
      "GET /geo/cities",
      `${data?.data?.length ?? 0} cities`,
    );
  }

  // 3 catalog bogota
  let venue = null;
  let bookable = null;
  {
    const { status, data } = await req(
      "/catalog/search?city=bogota&lens=comer&premiumOnly=true",
    );
    const list = data?.data ?? [];
    venue = list[0] ?? null;
    log(status === 200 && list.length > 0, "GET /catalog/search bogota", `${list.length} venues`);
  }
  {
    const { status, data } = await req(
      "/catalog/search?city=bogota&bookingOnly=true",
    );
    bookable = data?.data?.[0] ?? null;
    log(
      status === 200 && !!bookable,
      "catalog bookingOnly",
      bookable?.name ?? "none",
    );
  }

  // 4 register
  let accessToken = null;
  {
    const { status, data } = await req("/auth/register", {
      method: "POST",
      body: { name, email, password },
    });
    accessToken = data?.accessToken;
    log(status === 201 && !!accessToken, "POST /auth/register", email);
  }

  // 5 me
  {
    const { status, data } = await req("/auth/me", { token: accessToken });
    log(status === 200 && data?.user?.email === email, "GET /auth/me");
  }

  // 6 login
  {
    const { status, data } = await req("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    if (data?.accessToken) accessToken = data.accessToken;
    log(status === 200 && !!data?.accessToken, "POST /auth/login");
  }

  // 7 booking hold + confirm
  let reservationId = null;
  if (bookable?.id) {
    const slots = await req(`/bookings/slots/${bookable.id}`);
    const slot = slots.data?.data?.[0];
    log(slots.status === 200 && !!slot, "GET /bookings/slots", slot?.id?.slice(0, 8));

    if (slot) {
      const hold = await req("/bookings/hold", {
        method: "POST",
        token: accessToken,
        body: {
          venueId: bookable.id,
          slotId: slot.id,
          partySize: 2,
          guestName: name,
          guestEmail: email,
          guestPhone: "3001234567",
        },
      });
      reservationId = hold.data?.data?.id;
      log(
        hold.status === 201 && hold.data?.data?.status === "HOLD",
        "POST /bookings/hold",
        hold.data?.data?.status || hold.data?.code,
      );

      if (reservationId) {
        const conf = await req(`/bookings/${reservationId}/confirm`, {
          method: "POST",
          token: accessToken,
          body: {},
        });
        log(
          conf.status === 200 && conf.data?.data?.status === "CONFIRMED",
          "POST /bookings/:id/confirm",
          conf.data?.data?.status || conf.data?.code,
        );
      }
    }
  } else {
    log(false, "booking flow skipped (no bookable venue)");
  }

  // 8 review
  if (venue?.id && accessToken) {
    const rev = await req("/reviews", {
      method: "POST",
      token: accessToken,
      body: {
        venueId: venue.id,
        stars: 5,
        body: "Excelente prueba QA local",
      },
    });
    log(
      rev.status === 201 || rev.status === 409,
      "POST /reviews",
      String(rev.status),
    );
  }

  // 9 mine
  if (accessToken) {
    const mine = await req("/bookings/mine", { token: accessToken });
    log(
      mine.status === 200 && Array.isArray(mine.data?.data),
      "GET /bookings/mine",
      `${mine.data?.data?.length ?? 0} reservations`,
    );
  }

  // 10 venue detail
  if (venue) {
    const det = await req(`/catalog/bogota/${venue.slug}`);
    log(det.status === 200 && det.data?.data?.slug === venue.slug, "GET venue detail");
  }

  console.log(`\nResult: ${passed} passed, ${failed} failed`);
  console.log(`QA user: ${email} / ${password}`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
