import { describe, expect, it } from "vitest";
import { mapTypesToVenueType, normalizeName, normalizePhoneCo } from "../normalize-place.js";

describe("normalize", () => {
  it("normalizes names", () => {
    expect(normalizeName("Café Ñoño!!!")).toContain("cafe");
  });

  it("maps nightlife types", () => {
    expect(mapTypesToVenueType(["night_club"])).toBe("CLUB");
    expect(mapTypesToVenueType(["bar", "restaurant"])).toBe("MIXED");
  });

  it("normalizes CO phones", () => {
    expect(normalizePhoneCo("+57 300 123 4567")).toBe("3001234567");
  });
});
