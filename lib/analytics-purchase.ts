import type Stripe from "stripe";
import { FUNNEL_MEASUREMENT_ID, ATTRIBUTION_KEYS, sanitizeCheckoutAnalytics } from "./analytics-schema";
import { isSpotPlanId } from "./spot-plans";

export function purchasePayload(session: Stripe.Checkout.Session, completedAt: number) {
  const meta = session.metadata || {};
  if (session.mode !== "payment" || session.payment_status !== "paid" || !isSpotPlanId(meta.plan || "")) return null;
  if (!session.amount_total || session.amount_total <= 0 || session.currency !== "jpy") return null;
  const transactionId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
  if (!transactionId || !/^pi_[a-zA-Z0-9]+$/.test(transactionId)) return null;
  const context = sanitizeCheckoutAnalytics({
    client_id: meta.ga_client_id, session_id: meta.ga_session_id,
    fire_department: meta.ga_fire_department, building_use: meta.ga_building_use,
    attribution: Object.fromEntries([...ATTRIBUTION_KEYS, "referrer"].map(key => [key, meta[`ga_first_${key}`]])),
  });
  if (!context) return null;
  return {
    client_id: context.client_id,
    timestamp_micros: completedAt * 1_000_000,
    events: [{ name: "purchase", params: {
      transaction_id: transactionId,
      value: session.amount_total, currency: "JPY", plan: meta.plan,
      items: [{ item_id: meta.plan, item_name: meta.plan, price: session.amount_total, quantity: 1 }],
      fire_department: context.fire_department, building_use: context.building_use,
      session_id: Number(context.session_id), engagement_time_msec: 1,
      page_location: `${new URL(session.success_url || "https://plan.todokede.jp/").origin}/`,
      first_source: context.attribution.utm_source || (context.attribution.referrer ? new URL(context.attribution.referrer).hostname : "(direct)"),
      first_medium: context.attribution.utm_medium || (context.attribution.referrer ? "referral" : "(none)"),
      ...(context.attribution.utm_campaign ? { first_campaign: context.attribution.utm_campaign } : {}),
      ...(process.env.ANALYTICS_DEBUG === "true" ? { debug_mode: true } : {}),
    } }],
  };
}

export async function sendPurchase(stripe: Stripe, session: Stripe.Checkout.Session, completedAt: number): Promise<"sent" | "duplicate" | "skipped"> {
  const payload = purchasePayload(session, completedAt);
  if (!payload) return "skipped";
  const expectedLive = process.env.VERCEL_ENV === "production";
  if (process.env.VERCEL_ENV && session.livemode !== expectedLive) throw new Error("GA4 payment environment mismatch");
  const secret = process.env.GA4_API_SECRET;
  if (!secret || secret === "[SENSITIVE]") throw new Error("GA4_API_SECRET is not available");
  const marker = `ga4_sent_${FUNNEL_MEASUREMENT_ID.replace(/-/g, "_")}`;
  const current = await stripe.checkout.sessions.retrieve(session.id);
  if (current.metadata?.[marker]) return "duplicate";
  const endpoint = new URL("https://www.google-analytics.com/mp/collect");
  endpoint.searchParams.set("measurement_id", FUNNEL_MEASUREMENT_ID);
  endpoint.searchParams.set("api_secret", secret);
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload), signal: AbortSignal.timeout(8000),
    });
  } catch { throw new Error("GA4 purchase transport failed"); }
  if (!response.ok) throw new Error(`GA4 purchase HTTP ${response.status}`);
  // Replays skip after acknowledgement. Concurrent sends / a crash before this
  // marker are reconciled by GA4 using the same client_id + transaction_id.
  await stripe.checkout.sessions.update(session.id, { metadata: { [marker]: String(completedAt) } });
  return "sent";
}
