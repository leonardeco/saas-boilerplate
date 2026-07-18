/**
 * Idempotent geo seed. Run: npm run db:seed -w @saas/db
 * Requires DATABASE_URL.
 */
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import { geoCities, geoDepartments } from "../schema/geo.js";
import { COLOMBIA_MAJOR_CITIES } from "./geo-co.js";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const client = postgres(url, { max: 1 });
  const db = drizzle(client);

  const deptCache = new Map<string, string>();

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
      await db.insert(geoCities).values({
        departmentId,
        name: city.name,
        slug: city.slug,
        isMajor: city.isMajor,
        lat: city.lat,
        lng: city.lng,
        activationWave: city.activationWave,
      });
      console.log(`+ city ${city.slug}`);
    } else {
      console.log(`= city ${city.slug}`);
    }
  }

  await client.end();
  console.log(`Seeded ${COLOMBIA_MAJOR_CITIES.length} major cities`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
