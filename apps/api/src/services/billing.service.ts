import Stripe from "stripe";
import { db, subscriptions, plans, organizations } from "@saas/db";
import { eq } from "drizzle-orm";

function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_NOT_CONFIGURED");
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export async function createCheckoutSession(
  orgId: string,
  userId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
) {
  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { organizationId: orgId, userId },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session;
}

export async function createBillingPortalSession(orgId: string, returnUrl: string) {
  const sub = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.organizationId, orgId),
  });

  if (!sub?.stripeCustomerId) throw new Error("NO_SUBSCRIPTION");

  const session = await getStripe().billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: returnUrl,
  });

  return session;
}

export async function handleStripeWebhook(rawBody: Buffer, signature: string) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) throw new Error("STRIPE_NOT_CONFIGURED");
  const event = getStripe().webhooks.constructEvent(
    rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET,
  );

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orgId = session.metadata?.organizationId;
      if (!orgId || !session.subscription || !session.customer) break;

      const freePlan = await db.query.plans.findFirst({ where: eq(plans.name, "FREE") });
      const proPlan = await db.query.plans.findFirst({ where: eq(plans.name, "PRO") });

      await db
        .insert(subscriptions)
        .values({
          organizationId: orgId,
          planId: proPlan?.id ?? freePlan!.id,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          status: "active",
        })
        .onConflictDoUpdate({
          target: subscriptions.organizationId,
          set: {
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            status: "active",
            planId: proPlan?.id ?? freePlan!.id,
            updatedAt: new Date(),
          },
        });
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await db
        .update(subscriptions)
        .set({
          status: sub.status as "active" | "canceled" | "past_due" | "trialing" | "incomplete",
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.stripeSubscriptionId, sub.id));
      break;
    }
  }
}
