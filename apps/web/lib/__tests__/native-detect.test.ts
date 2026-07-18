import { describe, expect, it } from "vitest";

/** Pure helpers mirrored for unit safety without window. */
function formatDeepLink(city: string, slug: string) {
  return `nighttable://co/${city}/${slug}`;
}

describe("native deep links", () => {
  it("builds scheme path", () => {
    expect(formatDeepLink("bogota", "bar-x")).toBe(
      "nighttable://co/bogota/bar-x",
    );
  });
});
