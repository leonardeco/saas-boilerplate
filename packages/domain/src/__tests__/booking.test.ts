import { describe, expect, it } from "vitest";
import {
  assertTransition,
  canHold,
  canTransition,
  defaultHoldExpiresAt,
} from "../booking.js";

describe("booking state machine", () => {
  it("allows HOLD → CONFIRMED", () => {
    expect(canTransition("HOLD", "CONFIRMED")).toBe(true);
  });

  it("forbids COMPLETED → HOLD", () => {
    expect(canTransition("COMPLETED", "HOLD")).toBe(false);
    expect(() => assertTransition("COMPLETED", "HOLD")).toThrow();
  });

  it("blocks hold when capacity insufficient", () => {
    const r = canHold({
      capacity: 2,
      reservedCount: 2,
      partySize: 1,
      holdExpiresAt: defaultHoldExpiresAt(),
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("insufficient_capacity");
  });

  it("allows hold when capacity remains", () => {
    const r = canHold({
      capacity: 4,
      reservedCount: 2,
      partySize: 2,
      holdExpiresAt: defaultHoldExpiresAt(),
    });
    expect(r.ok).toBe(true);
  });
});
