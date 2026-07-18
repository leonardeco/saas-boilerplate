import { describe, expect, it } from "vitest";

/** Mirrors production weak-secret heuristics without loading env module. */
function looksWeak(secret: string) {
  const WEAK = ["change-me", "secret", "password", "123456", "ci-access"];
  const s = secret.toLowerCase();
  return WEAK.some((w) => s.includes(w)) || /^(.)\1+$/.test(secret);
}

describe("production secret policy", () => {
  it("flags default-like secrets", () => {
    expect(looksWeak("change-me-access-secret-min-32-chars-long")).toBe(true);
    expect(looksWeak("ci-access-secret-min-32-characters-xx")).toBe(true);
  });

  it("accepts high-entropy secrets", () => {
    const s = "xK9$mP2vL8qR4nW7jH3cF6bT1yU5iO0aZ";
    expect(looksWeak(s)).toBe(false);
    expect(s.length).toBeGreaterThanOrEqual(32);
  });
});
