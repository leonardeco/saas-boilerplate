import { describe, expect, it } from "vitest";
import { computeQualityScore } from "../quality.js";

describe("computeQualityScore", () => {
  it("rejects non-operational venues", () => {
    const r = computeQualityScore({
      ratingAvg: 5,
      ratingCount: 100,
      curationBadge: true,
      operational: false,
    });
    expect(r.isPublishablePremium).toBe(false);
    expect(r.score).toBe(0);
  });

  it("rejects high rating with too few reviews (no badge)", () => {
    const r = computeQualityScore({
      ratingAvg: 5,
      ratingCount: 1,
      curationBadge: false,
      operational: true,
    });
    expect(r.isPublishablePremium).toBe(false);
    expect(r.reasons).toContain("review_count_below_threshold");
  });

  it("accepts solid rating and volume", () => {
    const r = computeQualityScore({
      ratingAvg: 4.5,
      ratingCount: 80,
      curationBadge: false,
      operational: true,
    });
    expect(r.isPublishablePremium).toBe(true);
    expect(r.score).toBeGreaterThan(50);
  });

  it("accepts curated venues with slightly lower avg", () => {
    const r = computeQualityScore({
      ratingAvg: 3.9,
      ratingCount: 5,
      curationBadge: true,
      operational: true,
    });
    expect(r.isPublishablePremium).toBe(true);
    expect(r.reasons).toContain("curation_badge");
  });
});
