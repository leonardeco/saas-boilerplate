import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  getOrganizationsByUser,
  getOrganization,
  updateOrganization,
} from "../services/organization.service.js";

export async function organizationsRoutes(app: FastifyInstance) {
  // GET /organizations — list orgs for current user
  app.get("/", { preHandler: [app.authenticate] }, async (request, reply) => {
    const { sub } = request.user as { sub: string };
    const orgs = await getOrganizationsByUser(sub);
    return reply.send(orgs);
  });

  // GET /organizations/:slug
  app.get<{ Params: { slug: string } }>(
    "/:slug",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { sub } = request.user as { sub: string };
      try {
        const org = await getOrganization(request.params.slug, sub);
        return reply.send(org);
      } catch (err: unknown) {
        if (err instanceof Error && err.message === "NOT_FOUND") return reply.status(404).send({ error: "Organization not found" });
        if (err instanceof Error && err.message === "FORBIDDEN") return reply.status(403).send({ error: "Forbidden" });
        throw err;
      }
    },
  );

  // PATCH /organizations/:slug
  app.patch<{ Params: { slug: string } }>(
    "/:slug",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { sub } = request.user as { sub: string };
      const schema = z.object({ name: z.string().min(2).max(100).optional(), logoUrl: z.string().url().optional() });
      const body = schema.safeParse(request.body);
      if (!body.success) return reply.status(400).send({ error: body.error.flatten() });

      try {
        const org = await updateOrganization(request.params.slug, sub, body.data);
        return reply.send(org);
      } catch (err: unknown) {
        if (err instanceof Error && err.message === "NOT_FOUND") return reply.status(404).send({ error: "Not found" });
        if (err instanceof Error && err.message === "FORBIDDEN") return reply.status(403).send({ error: "Forbidden" });
        throw err;
      }
    },
  );
}
