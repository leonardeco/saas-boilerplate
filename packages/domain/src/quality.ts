/**
 * Premium quality scoring (positioning B5).
 * Pure domain rules — no I/O.
 */

export type QualityInput = {
  ratingAvg: number | null;
  ratingCount: number;
  curationBadge: boolean;
  operational: boolean;
};

export type QualityResult = {
  score: number;
  isPublishablePremium: boolean;
  reasons: string[];
};

const MIN_AVG = 4.0;
const MIN_COUNT = 15;
const CURATED_MIN_AVG = 3.8;

/**
 * score 0–100. Premium default listing requires threshold.
 */
export function computeQualityScore(input: QualityInput): QualityResult {
  const reasons: string[] = [];

  if (!input.operational) {
    return { score: 0, isPublishablePremium: false, reasons: ["not_operational"] };
  }

  const avg = input.ratingAvg ?? 0;
  const count = Math.max(0, input.ratingCount);

  // Base: rating weight + volume dampening (log scale)
  const ratingPart = (Math.min(avg, 5) / 5) * 70;
  const volumePart = Math.min(Math.log10(count + 1) / Math.log10(501), 1) * 25;
  const badgePart = input.curationBadge ? 5 : 0;
  const score = Math.round((ratingPart + volumePart + badgePart) * 10) / 10;

  let isPublishablePremium = false;

  if (input.curationBadge && avg >= CURATED_MIN_AVG) {
    isPublishablePremium = true;
    reasons.push("curation_badge");
  } else if (avg >= MIN_AVG && count >= MIN_COUNT) {
    isPublishablePremium = true;
    reasons.push("rating_and_volume");
  } else {
    if (avg < MIN_AVG) reasons.push("rating_below_threshold");
    if (count < MIN_COUNT) reasons.push("review_count_below_threshold");
  }

  // Single 5-star reviews never pass volume
  if (count < MIN_COUNT && !input.curationBadge) {
    isPublishablePremium = false;
  }

  return { score, isPublishablePremium, reasons };
}
