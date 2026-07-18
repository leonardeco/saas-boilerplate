import type { FastifyReply, FastifyRequest } from "fastify";
import { eq } from "drizzle-orm";
import { db, users } from "@saas/db";

export async function requirePlatformRole(
  roles: Array<"MODERATOR" | "SUPERADMIN">,
) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    await request.server.authenticate(request, reply);
    if (reply.sent) return;

    const payload = request.user;
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.sub),
    });
    if (!user || !roles.includes(user.platformRole as "MODERATOR" | "SUPERADMIN")) {
      return reply.status(403).send({ error: "Forbidden", code: "FORBIDDEN" });
    }
  };
}
