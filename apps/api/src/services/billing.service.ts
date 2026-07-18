import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db, organizations, plans, subscriptions } from "@saas/db";
import { env } from "../env.js";

function stripeClient() {
  if (!env.STRIPE_SECRET_KEY?.startsWith("sk_")) return null;
  return new Stripe(env.STRIPE_SECRET_KEY);
}

export async function createCheckoutSession(input: {
  organizationId: string;
  priceId: string;
  userId: string;
}) {
  const stripe = stripeClient();
  if (!stripe) throw new Error("STRIPE_NOT_CONFIGURED");

  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, input.organizationId),
  });
  if (!org) throw new Error("ORG_NOT_FOUND");

  let sub = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.organizationId, input.organizationId),
  });

  let customerId = sub?.stripeCustomerId ?? undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      metadata: { organizationId: org.id },
      name: org.name,
    });
    customerId = customer.id;
    if (sub) {
      await db
        .update(subscriptions)
        .set({ stripeCustomerId: customerId })
        .where(eq(subscriptions.id, sub.id));
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: input.priceId, quantity: 1 }],
    success_url: `${env.WEB_URL}/dashboard/billing?success=1`,
    cancel_url: `${env.WEB_URL}/dashboard/billing?canceled=1`,
    metadata: { organizationId: org.id },
  });

  return { url: session.url };
}

export async function createPortalSession(organizationId: string) {
  const stripe = stripeClient();
  if (!stripe) throw new Error("STRIPE_NOT_CONFIGURED");

  const sub = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.organizationId, organizationId),
  });
  if (!sub?.stripeCustomerId) throw new Error("NO_CUSTOMER");

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${env.WEB_URL}/dashboard/billing`,
  });
  return { url: session.url };
}

export async function handleStripeWebhook(rawBody: Buffer, signature: string) {
  const stripe = stripeClient();
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) throw new Error("STRIPE_NOT_CONFIGURED");

  const event = stripe.webhooks.constructEvent(
    rawBody,
    signature,
    env.STRIPE_WEBHOOK_SECRET,
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orgId = session.metadata?.organizationId;
    if (orgId && session.subscription) {
      const pro = await db.query.plans.findFirst({ where: eq(plans.name, "PRO") });
      if (pro) {
        const existing = await db.query.subscriptions.findFirst({
          where: eq(subscriptions.organizationId, orgId),
        });
        if (existing) {
          await db
            .update(subscriptions)
            .set({
              planId: pro.id,
              stripeSubscriptionId: String(session.subscription),
              stripeCustomerId: String(session.customer),
              status: "active",
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.id, existing.id));
        }
      }
    }
  }

  return { received: true };
}

export async function listPlans() {
  return db.select().from(plans);
}
