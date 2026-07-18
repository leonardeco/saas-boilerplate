import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import {
  createReview,
  listReviews,
  flagReview,
} from "../services/review.service.js";
import { requirePlatformRole } from "../plugins/authz.js";

export const reviewRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Params: { venueId: string } }>("/venue/:venueId", async (req) => {
    const data = await listReviews(req.params.venueId);
    return { data };
  });

  app.post("/", { preHandler: [app.authenticate] }, async (request, reply) => {
    const schema = z.object({
      venueId: z.string().uuid(),
      stars: z.number().int().min(1).max(5),
      body: z.string().max(2000).optional(),
    });
    const body = schema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: body.error.flatten() });

    try {
      const data = await createReview({
        ...body.data,
        userId: request.user.sub,
      });
      return reply.status(201).send({ data });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "ERROR";
      const status = msg === "ALREADY_REVIEWED" ? 409 : 400;
      return reply.status(status).send({ error: msg, code: msg });
    }
  });

  app.post<{ Params: { id: string } }>(
    "/:id/flag",
    { preHandler: [await requirePlatformRole(["MODERATOR", "SUPERADMIN"])] },
    async (request) => {
      const data = await flagReview(request.params.id);
      return { data };
    },
  );
};
