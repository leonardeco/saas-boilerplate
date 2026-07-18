import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { holdRequestSchema } from "@saas/contracts";
import {
  holdReservation,
  confirmReservation,
  cancelReservation,
  listSlots,
  createSlot,
  listAgenda,
  myReservations,
} from "../services/booking.service.js";

export const bookingRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Params: { venueId: string } }>("/slots/:venueId", async (req) => {
    const data = await listSlots(req.params.venueId);
    return { data };
  });

  app.post(
    "/slots",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const schema = z.object({
        venueId: z.string().uuid(),
        startsAt: z.string().datetime(),
        endsAt: z.string().datetime(),
        capacity: z.number().int().min(1).max(500),
        label: z.string().optional(),
      });
      const body = schema.safeParse(request.body);
      if (!body.success) return reply.status(400).send({ error: body.error.flatten() });

      const slot = await createSlot({
        venueId: body.data.venueId,
        startsAt: new Date(body.data.startsAt),
        endsAt: new Date(body.data.endsAt),
        capacity: body.data.capacity,
        label: body.data.label,
      });
      return reply.status(201).send({ data: slot });
    },
  );

  app.post(
    "/hold",
    {
      config: {
        rateLimit: { max: 20, timeWindow: "1 minute" },
      },
    },
    async (request, reply) => {
      const body = holdRequestSchema.safeParse(request.body);
      if (!body.success) {
        return reply.status(400).send({ error: body.error.flatten() });
      }

      let userId: string | undefined;
      try {
        await request.jwtVerify();
        userId = request.user.sub;
      } catch {
        /* guest hold allowed */
      }

      try {
        const reservation = await holdReservation(body.data, userId);
        return reply.status(201).send({ data: reservation });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "ERROR";
        const status =
          msg === "SLOT_LOCKED" || msg === "INSUFFICIENT_CAPACITY" ? 409 : 400;
        return reply.status(status).send({ error: msg, code: msg });
      }
    },
  );

  app.post<{ Params: { id: string } }>(
    "/:id/confirm",
    async (request, reply) => {
      let userId: string | undefined;
      try {
        await request.jwtVerify();
        userId = request.user.sub;
      } catch {
        /* optional */
      }
      try {
        const data = await confirmReservation(request.params.id, userId);
        return { data };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "ERROR";
        return reply.status(400).send({ error: msg, code: msg });
      }
    },
  );

  app.post<{ Params: { id: string } }>(
    "/:id/cancel",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      try {
        const data = await cancelReservation(request.params.id, {
          userId: request.user.sub,
        });
        return { data };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "ERROR";
        const status = msg === "FORBIDDEN" ? 403 : 400;
        return reply.status(status).send({ error: msg, code: msg });
      }
    },
  );

  app.get(
    "/mine",
    { preHandler: [app.authenticate] },
    async (request) => {
      const data = await myReservations(request.user.sub);
      return { data };
    },
  );

  app.get<{ Params: { venueId: string } }>(
    "/agenda/:venueId",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      try {
        const data = await listAgenda(request.params.venueId, request.user.sub);
        return { data };
      } catch {
        return reply.status(403).send({ error: "Forbidden", code: "FORBIDDEN" });
      }
    },
  );
};
