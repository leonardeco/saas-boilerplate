import type { FastifyPluginAsync } from "fastify";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db, venues, organizationMembers } from "@saas/db";

async function assertOrgMember(userId: string, organizationId: string) {
  const m = await db.query.organizationMembers.findFirst({
    where: and(
      eq(organizationMembers.userId, userId),
      eq(organizationMembers.organizationId, organizationId),
    ),
  });
  if (!m) throw new Error("FORBIDDEN");
  return m;
}

export const venuesManageRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/mine",
    { preHandler: [app.authenticate] },
    async (request) => {
      const memberships = await db
        .select()
        .from(organizationMembers)
        .where(eq(organizationMembers.userId, request.user.sub));

      const orgIds = memberships.map((m) => m.organizationId);
      if (!orgIds.length) return { data: [] };

      const all = await db.select().from(venues);
      const data = all.filter(
        (v) => v.organizationId && orgIds.includes(v.organizationId),
      );
      return { data };
    },
  );

  app.patch<{ Params: { id: string } }>(
    "/:id",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const schema = z.object({
        name: z.string().min(2).optional(),
        description: z.string().optional(),
        bookingEnabled: z.boolean().optional(),
        minAge: z.number().int().optional(),
        coverAmount: z.number().optional(),
        hasGuestList: z.boolean().optional(),
        capacity: z.number().int().optional(),
        hoursNote: z.string().optional(),
      });
      const body = schema.safeParse(request.body);
      if (!body.success) return reply.status(400).send({ error: body.error.flatten() });

      const [venue] = await db
        .select()
        .from(venues)
        .where(eq(venues.id, request.params.id))
        .limit(1);
      if (!venue?.organizationId) {
        return reply.status(404).send({ error: "Not found" });
      }

      try {
        await assertOrgMember(request.user.sub, venue.organizationId);
      } catch {
        return reply.status(403).send({ error: "Forbidden" });
      }

      const [updated] = await db
        .update(venues)
        .set({
          name: body.data.name,
          description: body.data.description,
          bookingEnabled: body.data.bookingEnabled,
          minAge: body.data.minAge,
          coverAmount: body.data.coverAmount,
          hasGuestList: body.data.hasGuestList,
          capacity: body.data.capacity,
          updatedAt: new Date(),
        })
        .where(eq(venues.id, venue.id))
        .returning();

      return { data: updated };
    },
  );
};
