import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import {
  requestClaim,
  approveClaim,
  rejectClaim,
  listPendingClaims,
} from "../services/claim.service.js";
import { requirePlatformRole } from "../plugins/authz.js";

export const claimRoutes: FastifyPluginAsync = async (app) => {
  app.post("/", { preHandler: [app.authenticate] }, async (request, reply) => {
    const schema = z.object({
      venueId: z.string().uuid(),
      contactEmail: z.string().email(),
      contactPhone: z.string().optional(),
      message: z.string().max(1000).optional(),
      organizationId: z.string().uuid().optional(),
    });
    const body = schema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: body.error.flatten() });

    try {
      const result = await requestClaim({
        ...body.data,
        userId: request.user.sub,
      });
      return reply.status(201).send({
        data: result.claim,
        // In prod send token by email; expose in dev for testing
        verificationToken:
          process.env.NODE_ENV === "production"
            ? undefined
            : result.verificationToken,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "ERROR";
      return reply.status(400).send({ error: msg, code: msg });
    }
  });

  app.get(
    "/pending",
    { preHandler: [await requirePlatformRole(["SUPERADMIN", "MODERATOR"])] },
    async () => ({ data: await listPendingClaims() }),
  );

  app.post<{ Params: { id: string } }>(
    "/:id/approve",
    { preHandler: [await requirePlatformRole(["SUPERADMIN"])] },
    async (request, reply) => {
      try {
        const data = await approveClaim(request.params.id, request.user.sub);
        return { data };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "ERROR";
        return reply.status(400).send({ error: msg, code: msg });
      }
    },
  );

  app.post<{ Params: { id: string } }>(
    "/:id/reject",
    { preHandler: [await requirePlatformRole(["SUPERADMIN"])] },
    async (request, reply) => {
      try {
        const data = await rejectClaim(request.params.id);
        return { data };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "ERROR";
        return reply.status(400).send({ error: msg, code: msg });
      }
    },
  );
};
