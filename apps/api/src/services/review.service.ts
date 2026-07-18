import { and, avg, count, eq, sql } from "drizzle-orm";
import { db, reviews, venues, reservations } from "@saas/db";
import { computeQualityScore } from "@saas/domain";

export async function createReview(input: {
  venueId: string;
  userId: string;
  stars: number;
  body?: string;
}) {
  if (input.stars < 1 || input.stars > 5) throw new Error("INVALID_STARS");

  const existing = await db
    .select()
    .from(reviews)
    .where(
      and(eq(reviews.venueId, input.venueId), eq(reviews.userId, input.userId)),
    )
    .limit(1);
  if (existing[0]) throw new Error("ALREADY_REVIEWED");

  const completed = await db
    .select()
    .from(reservations)
    .where(
      and(
        eq(reservations.venueId, input.venueId),
        eq(reservations.userId, input.userId),
        eq(reservations.status, "COMPLETED"),
      ),
    )
    .limit(1);

  const [row] = await db
    .insert(reviews)
    .values({
      venueId: input.venueId,
      userId: input.userId,
      stars: input.stars,
      body: input.body,
      verifiedVisit: !!completed[0],
    })
    .returning();

  await recalculateVenueRatings(input.venueId);
  return row;
}

export async function listReviews(venueId: string) {
  return db
    .select()
    .from(reviews)
    .where(and(eq(reviews.venueId, venueId), eq(reviews.flagged, false)))
    .orderBy(sql`${reviews.createdAt} desc`);
}

export async function flagReview(reviewId: string) {
  const [row] = await db
    .update(reviews)
    .set({ flagged: true })
    .where(eq(reviews.id, reviewId))
    .returning();
  return row;
}

export async function recalculateVenueRatings(venueId: string) {
  const [agg] = await db
    .select({
      avg: avg(reviews.stars),
      count: count(reviews.id),
    })
    .from(reviews)
    .where(and(eq(reviews.venueId, venueId), eq(reviews.flagged, false)));

  const venue = await db.query.venues.findFirst({ where: eq(venues.id, venueId) });
  if (!venue) return;

  const ratingAvg = agg?.avg != null ? Number(agg.avg) : null;
  const ratingCount = Number(agg?.count ?? 0);
  const quality = computeQualityScore({
    ratingAvg,
    ratingCount,
    curationBadge: venue.curationBadge,
    operational: true,
  });

  await db
    .update(venues)
    .set({
      ratingAvg,
      ratingCount,
      qualityScore: quality.score,
      status: quality.isPublishablePremium ? "PUBLISHED" : venue.status,
      updatedAt: new Date(),
    })
    .where(eq(venues.id, venueId));
}
