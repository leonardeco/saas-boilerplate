import { describe, expect, it } from "vitest";
import {
  bookingConfirmedEmail,
  bookingHoldEmail,
  bookingCancelledEmail,
} from "../services/email.service.js";

describe("email templates", () => {
  it("hold email includes guest and venue", () => {
    const m = bookingHoldEmail({
      guestName: "Ana",
      venueName: "Bar Noche",
      partySize: 2,
      reservationId: "abc",
      holdExpiresAt: "2026-01-01T00:00:00Z",
    });
    expect(m.subject).toContain("Bar Noche");
    expect(m.html).toContain("Ana");
    expect(m.html).toContain("HOLD");
  });

  it("confirmed email marks confirmada", () => {
    const m = bookingConfirmedEmail({
      guestName: "Luis",
      venueName: "Casa Demo",
      partySize: 4,
      reservationId: "xyz",
    });
    expect(m.subject.toLowerCase()).toContain("confirm");
    expect(m.html).toContain("Luis");
  });

  it("cancel email", () => {
    const m = bookingCancelledEmail({
      guestName: "Mia",
      venueName: "Club",
      reservationId: "1",
    });
    expect(m.html).toContain("cancel");
  });
});
