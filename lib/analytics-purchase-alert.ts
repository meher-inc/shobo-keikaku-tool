import { createHash } from "node:crypto";
import type Stripe from "stripe";
import { FUNNEL_MEASUREMENT_ID } from "./analytics-schema";
import { FROM_EMAIL } from "./email";

const ALERT_TO = "info@meher-inc.co.jp";
const ALERT_MARKER = `ga4_alert_${FUNNEL_MEASUREMENT_ID.replace(/-/g, "_")}`;
const STRIPE_OPTIONS = { timeout: 2000, maxNetworkRetries: 0 };

export function purchaseAlertReference(checkoutSessionId: string): string | undefined {
  if (!/^cs_[a-zA-Z0-9_]{1,250}$/.test(checkoutSessionId)) return undefined;
  return createHash("sha256").update(`${FUNNEL_MEASUREMENT_ID}:${checkoutSessionId}`).digest("hex").slice(0,24);
}

export async function notifyPurchaseFailure(stripe: Stripe, checkoutSessionId: string, livemode: boolean) {
  if (process.env.VERCEL_ENV !== "production" || !livemode) return;
  const reference = purchaseAlertReference(checkoutSessionId);
  if (!reference) return;
  let stage = "configuration";
  const log = (outcome: string, httpStatus?: number) => {
    const entry = JSON.stringify({ event: "ga4_purchase_alert", alert_reference: reference, outcome, stage, http_status: httpStatus });
    if (outcome === "failed") console.error(`[ga4.alert] ${entry}`);
    else console.info(`[ga4.alert] ${entry}`);
  };
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey === "[SENSITIVE]") throw new Error("Notification configuration unavailable");
    stage = "marker_read";
    try {
      const current = await stripe.checkout.sessions.retrieve(checkoutSessionId, {}, STRIPE_OPTIONS);
      if (current.metadata?.[ALERT_MARKER]) {
        log("duplicate");
        return;
      }
    } catch {
      // A Stripe outage must not prevent the alert. Resend also deduplicates it.
      log("marker_unavailable");
    }
    stage = "email";
    // Keep the body identical across retries so the idempotency key stays valid.
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json",
        "Idempotency-Key": `ga4-purchase-failure/${reference}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [ALERT_TO],
        subject: "【トドケデ】GA4 purchase送信処理のエラー",
        text: [
          "plan.todokede.jp の本番環境で、GA4 purchaseの送信処理中にエラーが発生しました。",
          "決済そのものの失敗を示す通知ではありません。StripeのWebhook再配信で計測処理を再試行します。",
          "",
          `照合用参照ID: ${reference}`,
          "VercelのProductionログで、この参照IDと [ga4.purchase] を検索してください。",
          "失敗段階とHTTPステータスはログで確認できます。",
          "送信が回復しても、GA4でのpurchase計上は別途照合してください。",
        ].join("\n"),
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      log("failed", response.status);
      return;
    }
    const result = await response.json();
    if (typeof result.id !== "string" || !result.id) throw new Error("Notification acknowledgement unavailable");
    stage = "marker_write";
    await stripe.checkout.sessions.update(checkoutSessionId, { metadata: { [ALERT_MARKER]: "sent" } }, STRIPE_OPTIONS);
    log("accepted");
  } catch {
    // Raw provider errors may contain credentials or customer data.
    log("failed");
  }
}
