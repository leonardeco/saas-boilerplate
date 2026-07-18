import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";

async function main() {
  const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });

  // Ping Redis
  const pong = await connection.ping();
  console.log(`[worker] redis: ${pong}`);

  const ingestQueue = new Queue("ingest", { connection });

  // Placeholder processor — real adapters in S2
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const worker = new Worker(
    "ingest",
    async (job) => {
      console.log(`[worker] job ${job.name}`, job.data);
      return { ok: true };
    },
    { connection },
  );

  worker.on("completed", (job) => {
    console.log(`[worker] completed ${job.id}`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[worker] failed ${job?.id}`, err.message);
  });

  // Health: enqueue a noop on boot in development
  if (process.env.NODE_ENV !== "production") {
    await ingestQueue.add("noop", { at: new Date().toISOString() });
  }

  console.log("[worker] NightTable CO worker ready (ingest queue)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
