import { describe, expect, it } from "vitest";
import {
  normalizeWhatsAppTo,
  bookingWhatsAppMessages,
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
});
