import Stripe from "stripe";
import { supabaseAdmin } from "./supabase";
import { getPlanFromPriceId } from "./plans";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * Upsert a Stripe Subscription into the Supabase `subscriptions` table.
 *
 * This is a pure DB-sync function — no emails, no side-effects.
 * Designed to be idempotent: safe to call multiple times for the same subscription.
 * Throws on Supabase errors so the caller can catch and log.
 */
export async function upsertSubscriptionFromStripe(
  stripeSubscription: Stripe.Subscription
): Promise<void> {
  const priceId = stripeSubscription.items.data[0]?.price?.id || "";
  const resolved = getPlanFromPriceId(priceId);
  const planId = stripeSubscription.metadata?.plan_id || resolved?.planId || "unknown";
  const billingCycle = stripeSubscription.metadata?.billing_cycle || resolved?.cycle || "monthly";

  const customerId =
    typeof stripeSubscription.customer === "string"
      ? stripeSubscription.customer
      : stripeSubscription.customer.id;

  // Resolve customer email: prefer metadata, fall back to Stripe Customer API.
  let customerEmail = stripeSubscription.metadata?.customer_email || "";
  if (!customerEmail) {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      if (!customer.deleted) {
        customerEmail = customer.email || "";
      }
    } catch {
      /* ignore — email will be empty string */
    }
  }

  // In Stripe SDK v22+, current_period fields live on SubscriptionItem, not Subscription.
  const firstItem = stripeSubscription.items.data[0];
  const periodStart = firstItem?.current_period_start;
  const periodEnd = firstItem?.current_period_end;

  const row: Record<string, unknown> = {
    stripe_subscription_id: stripeSubscription.id,
    stripe_customer_id: customerId,
    stripe_price_id: priceId,
    customer_email: customerEmail,
    plan_id: planId,
    billing_cycle: billingCycle,
    status: stripeSubscription.status,
    current_period_start: periodStart
      ? new Date(periodStart * 1000).toISOString()
      : null,
    current_period_end: periodEnd
      ? new Date(periodEnd * 1000).toISOString()
      : null,
    cancel_at_period_end: stripeSubscription.cancel_at_period_end,
    canceled_at: stripeSubscription.canceled_at
      ? new Date(stripeSubscription.canceled_at * 1000).toISOString()
      : null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin
    .from("subscriptions")
    .upsert(row, { onConflict: "stripe_subscription_id" });

  if (error) {
    throw new Error(
      `[subscriptions] upsert failed for ${stripeSubscription.id}: ${error.message}`
    );
  }
}
