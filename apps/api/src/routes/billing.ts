import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import {
  createCheckoutSession,
  createPortalSession,
  handleStripeWebhook,
  listPlans,
} from "../services/billing.service.js";

export const billingRoutes: FastifyPluginAsync = async (app) => {
  app.get("/plans", async () => ({ data: await listPlans() }));

  app.post(
    "/checkout",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const schema = z.object({
        organizationId: z.string().uuid(),
        priceId: z.string().min(3),
      });
      const body = schema.safeParse(request.body);
      if (!body.success) return reply.status(400).send({ error: body.error.flatten() });

      try {
        const data = await createCheckoutSession({
          ...body.data,
          userId: request.user.sub,
        });
        return data;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "ERROR";
        const status = msg === "STRIPE_NOT_CONFIGURED" ? 503 : 400;
        return reply.status(status).send({ error: msg, code: msg });
      }
    },
  );

  app.post(
    "/portal",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const schema = z.object({ organizationId: z.string().uuid() });
      const body = schema.safeParse(request.body);
      if (!body.success) return reply.status(400).send({ error: body.error.flatten() });

      try {
        return await createPortalSession(body.data.organizationId);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "ERROR";
        return reply.status(400).send({ error: msg, code: msg });
      }
    },
  );

  app.post(
    "/webhook",
    {
      config: { rawBody: true },
    },
    async (request, reply) => {
      const sig = request.headers["stripe-signature"];
      if (typeof sig !== "string") {
        return reply.status(400).send({ error: "Missing signature" });
      }
      try {
        const raw =
          (request as { rawBody?: Buffer }).rawBody ??
          Buffer.from(JSON.stringify(request.body));
        const data = await handleStripeWebhook(raw, sig);
        return data;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "ERROR";
        return reply.status(400).send({ error: msg });
      }
    },
  );
};
