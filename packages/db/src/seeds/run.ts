/**
 * Idempotent seed: geo cities + demo venues + FREE plan.
 * Run: npm run db:seed -w @saas/db
 */
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import { geoCities, geoDepartments, venues, plans } from "../schema/index.js";
import { COLOMBIA_MAJOR_CITIES } from "./geo-co.js";
import { DEMO_VENUES, demoQuality } from "./demo-venues.js";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const client = postgres(url, { max: 1 });
  const db = drizzle(client);

  const deptCache = new Map<string, string>();
  const cityIdBySlug = new Map<string, string>();

  for (const city of COLOMBIA_MAJOR_CITIES) {
    let departmentId = deptCache.get(city.departmentCode);
    if (!departmentId) {
      const existing = await db
        .select()
        .from(geoDepartments)
        .where(eq(geoDepartments.code, city.departmentCode))
        .limit(1);

      if (existing[0]) {
        departmentId = existing[0].id;
      } else {
        const [inserted] = await db
          .insert(geoDepartments)
          .values({
            code: city.departmentCode,
            name: city.departmentName,
            slug: city.departmentName
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{M}/gu, "")
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, ""),
          })
          .returning();
        departmentId = inserted.id;
      }
      deptCache.set(city.departmentCode, departmentId);
    }

    const existingCity = await db
      .select()
      .from(geoCities)
      .where(eq(geoCities.slug, city.slug))
      .limit(1);

    if (!existingCity[0]) {
      const [inserted] = await db
        .insert(geoCities)
        .values({
          departmentId,
          name: city.name,
          slug: city.slug,
          isMajor: city.isMajor,
          lat: city.lat,
          lng: city.lng,
          activationWave: city.activationWave,
        })
        .returning();
      cityIdBySlug.set(city.slug, inserted.id);
      console.log(`+ city ${city.slug}`);
    } else {
      cityIdBySlug.set(city.slug, existingCity[0].id);
      console.log(`= city ${city.slug}`);
    }
  }

  // Plans
  for (const plan of [
    { name: "FREE" as const, maxMembers: 3, maxVenues: 1, featuredListing: false },
    { name: "PRO" as const, maxMembers: 15, maxVenues: 5, featuredListing: true },
    {
      name: "ENTERPRISE" as const,
      maxMembers: 100,
      maxVenues: 50,
      featuredListing: true,
    },
  ]) {
    const existing = await db.select().from(plans).where(eq(plans.name, plan.name)).limit(1);
    if (!existing[0]) {
      await db.insert(plans).values(plan);
      console.log(`+ plan ${plan.name}`);
    }
  }

  // Demo venues
  for (const v of DEMO_VENUES) {
    const cityId = cityIdBySlug.get(v.citySlug);
    if (!cityId) {
      console.warn(`! skip venue ${v.slug}: city ${v.citySlug} missing`);
      continue;
    }
    const existing = await db.select().from(venues).where(eq(venues.slug, v.slug)).limit(1);
    const q = demoQuality(v);
    if (!existing[0]) {
      await db.insert(venues).values({
        cityId,
        name: v.name,
        slug: v.slug,
        description: v.description,
        type: v.type,
        address: v.address,
        lat: v.lat,
        lng: v.lng,
        ratingAvg: v.ratingAvg,
        ratingCount: v.ratingCount,
        qualityScore: q.score,
        curationBadge: v.curationBadge,
        claimStatus: "UNCLAIMED",
        bookingEnabled: v.bookingEnabled,
        status: q.isPublishablePremium ? "PUBLISHED" : "DRAFT",
        priceLevel: v.priceLevel,
        minAge: v.minAge,
        coverAmount: v.coverAmount,
        hasGuestList: v.hasGuestList ?? false,
        capacity: v.capacity,
        primarySource: "manual",
      });
      console.log(`+ venue ${v.slug} premium=${q.isPublishablePremium}`);
    } else {
      console.log(`= venue ${v.slug}`);
    }
  }

  await client.end();
  console.log("Seed complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
