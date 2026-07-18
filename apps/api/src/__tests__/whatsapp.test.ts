import { describe, expect, it } from "vitest";
import {
  normalizeWhatsAppTo,
  bookingWhatsAppMessages,
  templateBodyParams,
  templateNameFor,
} from "../services/whatsapp.service.js";

describe("whatsapp helpers", () => {
  it("normalizes CO mobile", () => {
    expect(normalizeWhatsAppTo("3001234567")).toBe("+573001234567");
    expect(normalizeWhatsAppTo("+57 300 123 4567")).toBe("+573001234567");
  });

  it("rejects short numbers", () => {
    expect(normalizeWhatsAppTo("123")).toBeNull();
  });

  it("builds confirmed message", () => {
    const m = bookingWhatsAppMessages({
      kind: "confirmed",
      guestName: "Ana",
      venueName: "Bar X",
      partySize: 2,
    });
    expect(m).toContain("confirmada");
    expect(m).toContain("Bar X");
  });

  it("builds template body params", () => {
    const p = templateBodyParams({
      guestName: "Ana",
      venueName: "Club",
      partySize: 3,
      startsAt: "2026-08-01T19:00:00.000Z",
    });
    expect(p).toHaveLength(4);
    expect(p[0]).toBe("Ana");
    expect(p[2]).toBe("3");
  });

  it("reads template names from env", () => {
    process.env.WHATSAPP_TEMPLATE_HOLD = "nt_booking_hold";
    expect(templateNameFor("hold")).toBe("nt_booking_hold");
    delete process.env.WHATSAPP_TEMPLATE_HOLD;
  });
});
