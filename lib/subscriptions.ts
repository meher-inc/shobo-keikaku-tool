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

  // Check if a canonical row with this stripe_subscription_id already exists.
  const { data: existingRow } = await supabaseAdmin
    .from("subscriptions")
    .select("id")
    .eq("stripe_subscription_id", stripeSubscription.id)
    .maybeSingle();

  if (existingRow) {
    // Update the existing canonical row in place.
    const { error } = await supabaseAdmin
      .from("subscriptions")
      .update(row)
      .eq("id", existingRow.id);

    if (error) {
      throw new Error(
        `[subscriptions] update failed for ${stripeSubscription.id}: ${error.message}`
      );
    }
    return;
  }

  // No canonical row yet. Look for a draft row (stripe_subscription_id IS NULL)
  // created by the checkout endpoint, matching by subscription_draft_id in metadata.
  const draftId = stripeSubscription.metadata?.subscription_draft_id;
  if (draftId) {
    const { data: draftRow } = await supabaseAdmin
      .from("subscriptions")
      .select("id")
      .eq("id", draftId)
      .is("stripe_subscription_id", null)
      .maybeSingle();

    if (draftRow) {
      // Promote the draft row to canonical by filling in Stripe data.
      const { error } = await supabaseAdmin
        .from("subscriptions")
        .update(row)
        .eq("id", draftRow.id);

      if (error) {
        throw new Error(
          `[subscriptions] draft promotion failed for ${stripeSubscription.id}: ${error.message}`
        );
      }
      return;
    }
  }

  // No existing row and no draft — insert fresh.
  const { error } = await supabaseAdmin
    .from("subscriptions")
    .insert(row);

  if (error) {
    // UNIQUE violation means another event just inserted it — safe to ignore.
    if (error.code === "23505") {
      console.log(
        `[subscriptions] concurrent insert race for ${stripeSubscription.id}, ignoring`
      );
      return;
    }
    throw new Error(
      `[subscriptions] insert failed for ${stripeSubscription.id}: ${error.message}`
    );
  }
}
