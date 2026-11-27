// Server-only: premium check request fulfilment shared by the Stripe webhook
// and /api/premium-review. The recipient and the attached plan are always
// decided on the server (Stripe purchaser email + orders.form_data); nothing
// from the browser is trusted here.
import { supabaseAdmin } from "./supabase";
import { sendPremiumReview } from "./sendPremiumReview";
import {
  GENERATE_AUTH_HEADER,
  getGenerateAuthorizationSecret,
} from "./generate-authorization";

export type PremiumOrder = {
  id: string;
  plan_id?: string | null;
  form_data?: Record<string, unknown> | null;
  premium_email_sent_at?: string | null;
};

export type FulfillPremiumReviewArgs = {
  order: PremiumOrder;
  customerEmail: string;
  sessionId: string;
  logPrefix?: string;
};

export type FulfillPremiumReviewResult = "sent" | "already_sent";

/**
 * The internal generate secret is only ever sent to the configured app URL,
 * never to an origin derived from the incoming request (Host header).
 */
function getAppBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

/**
 * Claim the order (premium_email_sent_at: null -> now) atomically, then
 * generate the plan from orders.form_data and send the two premium-review
 * emails. Concurrent callers (webhook / success page / repeated POSTs) that
 * lose the claim get "already_sent" and send nothing.
 * If generation or sending fails the claim is released and the error is
 * rethrown, so a later webhook retry or success-page call can send again.
 */
export async function fulfillPremiumReview(
  args: FulfillPremiumReviewArgs
): Promise<FulfillPremiumReviewResult> {
  const { order, customerEmail, sessionId } = args;
  const logPrefix = args.logPrefix || "[premium-fulfillment]";

  if (order.premium_email_sent_at) return "already_sent";
  if (order.plan_id !== "premium") {
    throw new Error("premium プラン以外の注文です");
  }
  if (!customerEmail) throw new Error("customerEmail is required");

  const claimedAt = new Date().toISOString();
  const { data: claimed, error: claimError } = await supabaseAdmin
    .from("orders")
    .update({ premium_email_sent_at: claimedAt })
    .eq("id", order.id)
    .is("premium_email_sent_at", null)
    .select("id");
  if (claimError) {
    throw new Error(`failed to claim premium order: ${claimError.message || claimError.code || "unknown"}`);
  }
  if (!claimed || claimed.length === 0) return "already_sent";

  try {
    const formData = order.form_data || {};

    const generateRes = await fetch(`${getAppBaseUrl()}/api/generate-plan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [GENERATE_AUTH_HEADER]: getGenerateAuthorizationSecret(),
      },
      body: JSON.stringify(formData),
    });
    if (!generateRes.ok) {
      const errText = await generateRes.text().catch(() => "");
      throw new Error(`generate-plan failed: ${generateRes.status} ${errText.slice(0, 200)}`);
    }
    const docxBuffer = Buffer.from(await generateRes.arrayBuffer());

    await sendPremiumReview({
      customerEmail,
      formData,
      docxBuffer,
      fileName: `消防計画_${String(formData.building_name || "premium")}.docx`,
      sessionId,
    });
  } catch (err) {
    const { error: releaseError } = await supabaseAdmin
      .from("orders")
      .update({ premium_email_sent_at: null })
      .eq("id", order.id)
      .eq("premium_email_sent_at", claimedAt);
    if (releaseError) {
      console.error(`${logPrefix} failed to release premium claim:`, releaseError);
    }
    throw err;
  }

  return "sent";
}
