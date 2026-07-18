import { describe, expect, it } from "vitest";
import { searchQuerySchema } from "../venue.js";

describe("searchQuerySchema", () => {
  it("defaults premiumOnly and lens", () => {
    const parsed = searchQuerySchema.parse({ city: "bogota" });
    expect(parsed.premiumOnly).toBe(true);
    expect(parsed.lens).toBe("comer");
    expect(parsed.page).toBe(1);
  });

  it("rejects empty city", () => {
    expect(() => searchQuerySchema.parse({ city: "" })).toThrow();
  });
});
