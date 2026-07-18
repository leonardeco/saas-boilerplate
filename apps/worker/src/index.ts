import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { eq } from "drizzle-orm";
import { db, ingestionJobs, geoCities } from "@saas/db";
import { mockProvider } from "./providers/mock.js";
import { osmProvider } from "./providers/osm.js";
import { googlePlacesProvider } from "./providers/google-places.js";
import { publishPlaces } from "./pipeline/publish.js";
import { reindexPublishedVenues } from "./pipeline/reindex.js";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";

type IngestJobData = {
  jobId?: string;
  citySlug: string;
  provider?: "mock" | "osm" | "google_places" | "all";
};

async function runIngest(data: IngestJobData) {
  const provider = data.provider ?? "mock";
  const city = await db.query.geoCities.findFirst({
    where: eq(geoCities.slug, data.citySlug),
  });
  if (!city || city.lat == null || city.lng == null) {
    throw new Error(`City missing coords: ${data.citySlug}`);
  }

  const providers =
    provider === "all"
      ? [mockProvider, osmProvider, googlePlacesProvider]
      : provider === "osm"
        ? [osmProvider]
        : provider === "google_places"
          ? [googlePlacesProvider]
          : [mockProvider];

  let total = 0;
  let created = 0;
  let updated = 0;

  for (const p of providers) {
    const places = await p.searchCity({
      citySlug: data.citySlug,
      lat: city.lat,
      lng: city.lng,
    });
    total += places.length;
    const r = await publishPlaces(data.citySlug, places);
    created += r.created;
    updated += r.updated;
  }

  const re = await reindexPublishedVenues();
  return { total, created, updated, indexed: re.indexed };
}

async function main() {
  const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });
  console.log(`[worker] redis: ${await connection.ping()}`);

  const ingestQueue = new Queue("ingest", { connection });

  const worker = new Worker(
    "ingest",
    async (job) => {
      if (job.name === "noop") return { ok: true };
      if (job.name === "reindex") return reindexPublishedVenues();

      const data = job.data as IngestJobData;
      if (data.jobId) {
        await db
          .update(ingestionJobs)
          .set({ status: "running" })
          .where(eq(ingestionJobs.id, data.jobId));
      }

      try {
        const result = await runIngest(data);
        if (data.jobId) {
          await db
            .update(ingestionJobs)
            .set({
              status: "completed",
              resultCount: result.total,
              finishedAt: new Date(),
            })
            .where(eq(ingestionJobs.id, data.jobId));
        }
        return result;
      } catch (err) {
        if (data.jobId) {
          await db
            .update(ingestionJobs)
            .set({
              status: "failed",
              errorMessage: err instanceof Error ? err.message : String(err),
              finishedAt: new Date(),
            })
            .where(eq(ingestionJobs.id, data.jobId));
        }
        throw err;
      }
    },
    { connection },
  );

  worker.on("completed", (job) => {
    console.log(`[worker] completed ${job.name} ${job.id}`, job.returnvalue);
  });
  worker.on("failed", (job, err) => {
    console.error(`[worker] failed ${job?.id}`, err.message);
  });

  // Export queue name for API producers
  void ingestQueue;

  console.log("[worker] NightTable ready — queues: ingest");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
