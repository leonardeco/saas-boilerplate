import type { FastifyInstance } from "fastify";
import {
  createCheckoutSession,
  createBillingPortalSession,
  handleStripeWebhook,
} from "../services/billing.service.js";

export async function billingRoutes(app: FastifyInstance) {
  // POST /billing/checkout — create Stripe Checkout session
  app.post<{ Body: { organizationId: string; priceId: string } }>(
    "/checkout",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { sub } = request.user as { sub: string };
      const { organizationId, priceId } = request.body;
      const origin = request.headers.origin ?? "http://localhost:3000";

      const session = await createCheckoutSession(
        organizationId,
        sub,
        priceId,
        `${origin}/billing?success=true`,
        `${origin}/billing?canceled=true`,
      );

      return reply.send({ url: session.url });
    },
  );

  // POST /billing/portal — create Stripe Billing Portal session
  app.post<{ Body: { organizationId: string } }>(
    "/portal",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const origin = request.headers.origin ?? "http://localhost:3000";
      try {
        const session = await createBillingPortalSession(
          request.body.organizationId,
          `${origin}/billing`,
        );
        return reply.send({ url: session.url });
      } catch {
        return reply.status(404).send({ error: "No active subscription found" });
      }
    },
  );

  // POST /billing/webhook — Stripe webhook (raw body needed)
  app.post(
    "/webhook",
    {
      config: { rawBody: true },
    },
    async (request, reply) => {
      const sig = request.headers["stripe-signature"] as string;
      if (!sig) return reply.status(400).send({ error: "Missing stripe-signature" });

      try {
        await handleStripeWebhook(request.rawBody as Buffer, sig);
        return reply.send({ received: true });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Webhook error";
        return reply.status(400).send({ error: msg });
      }
    },
  );
}
