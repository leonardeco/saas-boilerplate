import IORedis from "ioredis";
import { env } from "../env.js";

let client: IORedis | null = null;

export function getRedis() {
  if (!client) {
    client = new IORedis(env.REDIS_URL, { maxRetriesPerRequest: 3, lazyConnect: true });
  }
  return client;
}

export async function withSlotLock<T>(
  slotId: string,
  fn: () => Promise<T>,
  ttlMs = 5000,
): Promise<T> {
  const redis = getRedis();
  try {
    if (redis.status !== "ready") await redis.connect();
  } catch {
    // Redis optional fallback: still run (less safe under concurrency)
    return fn();
  }

  const key = `lock:slot:${slotId}`;
  const token = `${Date.now()}-${Math.random()}`;
  const ok = await redis.set(key, token, "PX", ttlMs, "NX");
  if (ok !== "OK") {
    throw new Error("SLOT_LOCKED");
  }
  try {
    return await fn();
  } finally {
    const cur = await redis.get(key);
    if (cur === token) await redis.del(key);
  }
}
