import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import { eq } from "drizzle-orm";
import {
  db,
  ingestionJobs,
  featureFlags,
  venues,
} from "@saas/db";
import { env } from "../env.js";
import { requirePlatformRole } from "../plugins/authz.js";

export const adminRoutes: FastifyPluginAsync = async (app) => {
  const guard = await requirePlatformRole(["SUPERADMIN"]);

  app.post(
    "/ingestion",
    { preHandler: [guard] },
    async (request, reply) => {
      const schema = z.object({
        citySlug: z.string().min(1),
        provider: z
          .enum(["mock", "osm", "google_places", "all"])
          .default("mock"),
      });
      const body = schema.safeParse(request.body);
      if (!body.success) return reply.status(400).send({ error: body.error.flatten() });

      const [job] = await db
        .insert(ingestionJobs)
        .values({
          provider: body.data.provider,
          citySlug: body.data.citySlug,
          status: "queued",
        })
        .returning();

      try {
        const connection = new IORedis(env.REDIS_URL, {
          maxRetriesPerRequest: null,
        });
        const queue = new Queue("ingest", { connection });
        await queue.add("city-ingest", {
          jobId: job!.id,
          citySlug: body.data.citySlug,
          provider: body.data.provider,
        });
        await queue.close();
        connection.disconnect();
      } catch (err) {
        request.log.warn({ err }, "Queue enqueue failed — worker may be offline");
      }

      return reply.status(202).send({ data: job });
    },
  );

  app.get("/ingestion", { preHandler: [guard] }, async () => {
    const data = await db.select().from(ingestionJobs).limit(50);
    return { data };
  });

  app.post(
    "/venues/:id/curation",
    { preHandler: [guard] },
    async (request, reply) => {
      const params = request.params as { id: string };
      const schema = z.object({
        curationBadge: z.boolean(),
        status: z.enum(["DRAFT", "PUBLISHED", "SUSPENDED"]).optional(),
      });
      const body = schema.safeParse(request.body);
      if (!body.success) return reply.status(400).send({ error: body.error.flatten() });

      const [row] = await db
        .update(venues)
        .set({
          curationBadge: body.data.curationBadge,
          status: body.data.status,
          updatedAt: new Date(),
        })
        .where(eq(venues.id, params.id))
        .returning();
      return { data: row };
    },
  );

  app.get("/flags", { preHandler: [guard] }, async () => {
    const data = await db.select().from(featureFlags);
    return { data };
  });

  app.put(
    "/flags/:key",
    { preHandler: [guard] },
    async (request, reply) => {
      const { key } = request.params as { key: string };
      const schema = z.object({
        enabled: z.boolean(),
        description: z.string().optional(),
      });
      const body = schema.safeParse(request.body);
      if (!body.success) return reply.status(400).send({ error: body.error.flatten() });

      const existing = await db
        .select()
        .from(featureFlags)
        .where(eq(featureFlags.key, key))
        .limit(1);

      if (existing[0]) {
        const [row] = await db
          .update(featureFlags)
          .set({
            enabled: body.data.enabled ? 1 : 0,
            description: body.data.description,
          })
          .where(eq(featureFlags.key, key))
          .returning();
        return { data: row };
      }

      const [row] = await db
        .insert(featureFlags)
        .values({
          key,
          enabled: body.data.enabled ? 1 : 0,
          description: body.data.description,
        })
        .returning();
      return reply.status(201).send({ data: row });
    },
  );
};
