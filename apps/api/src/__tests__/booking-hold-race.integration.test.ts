/**
 * Real concurrent holds against Postgres when RUN_INTEGRATION=1.
 */
import { describe, expect, it, beforeAll } from "vitest";

const run = process.env.RUN_INTEGRATION === "1" && Boolean(process.env.DATABASE_URL);

describe.skipIf(!run)("hold race against DB", () => {
  let holdReservation: typeof import("../services/booking.service.js").holdReservation;
  let createSlot: typeof import("../services/booking.service.js").createSlot;
  let venueId: string;
  let slotId: string;

  beforeAll(async () => {
    process.env.JWT_ACCESS_SECRET ??= "ci-access-secret-min-32-characters-xx";
    process.env.JWT_REFRESH_SECRET ??= "ci-refresh-secret-min-32-characters-x";

    const { db, venues, geoCities } = await import("@saas/db");
    const booking = await import("../services/booking.service.js");
    holdReservation = booking.holdReservation;
    createSlot = booking.createSlot;

    const city = await db.query.geoCities.findFirst();
    if (!city) throw new Error("seed cities first");

    const [v] = await db
      .insert(venues)
      .values({
        cityId: city.id,
        name: "Race Test Venue",
        slug: `race-venue-${Date.now()}`,
        type: "RESTAURANT",
        lat: 4.7,
        lng: -74.0,
        bookingEnabled: true,
        status: "PUBLISHED",
        qualityScore: 80,
        ratingAvg: 4.5,
        ratingCount: 50,
      })
      .returning();
    venueId = v!.id;

    const starts = new Date(Date.now() + 86400000);
    const ends = new Date(starts.getTime() + 7200000);
    const slot = await createSlot({
      venueId,
      startsAt: starts,
      endsAt: ends,
      capacity: 1,
      label: "race",
    });
    slotId = slot!.id;
  }, 60_000);

  it("only one of two concurrent holds succeeds", async () => {
    const payload = {
      venueId,
      slotId,
      partySize: 1,
      guestName: "A",
      guestEmail: "a@example.com",
    };

    const results = await Promise.allSettled([
      holdReservation({ ...payload, guestEmail: "a1@example.com", guestName: "A1" }),
      holdReservation({ ...payload, guestEmail: "a2@example.com", guestName: "A2" }),
    ]);

    const ok = results.filter((r) => r.status === "fulfilled");
    const fail = results.filter((r) => r.status === "rejected");
    expect(ok.length).toBe(1);
    expect(fail.length).toBe(1);
  });
});
