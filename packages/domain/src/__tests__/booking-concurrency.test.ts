import { describe, expect, it } from "vitest";
import { canHold, defaultHoldExpiresAt } from "../booking.js";

/**
 * Pure-domain simulation of concurrent holds against capacity=1.
 * Integration race with Redis/PG is covered when DATABASE_URL is set
 * (apps/api integration); this locks the business rule.
 */
describe("concurrent hold capacity simulation", () => {
  it("only one of two parallel parties can take last seat", () => {
    let reserved = 0;
    const capacity = 1;
    const holdExpiresAt = defaultHoldExpiresAt();

    const attempts = [
      { partySize: 1 },
      { partySize: 1 },
    ];

    const results = attempts.map((a) => {
      const check = canHold({
        capacity,
        reservedCount: reserved,
        partySize: a.partySize,
        holdExpiresAt,
      });
      if (check.ok) {
        reserved += a.partySize;
        return "ok";
      }
      return check.reason;
    });

    expect(results.filter((r) => r === "ok")).toHaveLength(1);
    expect(results).toContain("insufficient_capacity");
    expect(reserved).toBe(1);
  });

  it("rejects party larger than remaining", () => {
    const r = canHold({
      capacity: 4,
      reservedCount: 3,
      partySize: 2,
      holdExpiresAt: defaultHoldExpiresAt(),
    });
    expect(r.ok).toBe(false);
  });
});
