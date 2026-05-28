import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { inviteMember, removeMember } from "../services/organization.service.js";

export async function membersRoutes(app: FastifyInstance) {
  // POST /organizations/:slug/members — invite member
  app.post<{ Params: { slug: string } }>(
    "/:slug/members",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { sub } = request.user as { sub: string };
      const schema = z.object({
        email: z.string().email(),
        role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
      });
      const body = schema.safeParse(request.body);
      if (!body.success) return reply.status(400).send({ error: body.error.flatten() });

      try {
        const member = await inviteMember(request.params.slug, sub, body.data.email, body.data.role);
        return reply.status(201).send(member);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "";
        if (msg === "NOT_FOUND") return reply.status(404).send({ error: "Organization not found" });
        if (msg === "FORBIDDEN") return reply.status(403).send({ error: "Forbidden" });
        if (msg === "USER_NOT_FOUND") return reply.status(404).send({ error: "User not found" });
        if (msg === "ALREADY_MEMBER") return reply.status(409).send({ error: "User is already a member" });
        throw err;
      }
    },
  );

  // DELETE /organizations/:slug/members/:userId — remove member
  app.delete<{ Params: { slug: string; userId: string } }>(
    "/:slug/members/:userId",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { sub } = request.user as { sub: string };
      try {
        await removeMember(request.params.slug, sub, request.params.userId);
        return reply.status(204).send();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "";
        if (msg === "NOT_FOUND") return reply.status(404).send({ error: "Not found" });
        if (msg === "FORBIDDEN") return reply.status(403).send({ error: "Forbidden" });
        if (msg === "CANNOT_REMOVE_OWNER") return reply.status(400).send({ error: "Cannot remove the owner" });
        throw err;
      }
    },
  );
}
