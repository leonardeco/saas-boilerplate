import { describe, expect, it } from "vitest";
import { searchQuerySchema } from "@saas/contracts";

describe("catalog search query", () => {
  it("parses text query q", () => {
    const r = searchQuerySchema.parse({
      city: "bogota",
      q: "carne",
      lens: "comer",
    });
    expect(r.q).toBe("carne");
    expect(r.premiumOnly).toBe(true);
  });
});
