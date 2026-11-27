import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "../../../lib/supabase";
import { fulfillPremiumReview, type PremiumOrder } from "../../../lib/premium-fulfillment";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // @ts-expect-error -- Pin the same API version as /api/download and the webhook; the SDK type only accepts its latest version.
  apiVersion: "2024-12-18.acacia",
});

const SESSION_ID_PATTERN = /^cs_(test|live)_[A-Za-z0-9]+$/;
const ORDER_COLUMNS = "id, plan_id, form_data, premium_email_sent_at, customer_email";

type OrderRow = PremiumOrder & { customer_email?: string | null };

/**
 * Fallback path for the premium check request, called from /success after
 * the customer downloads the plan. The Stripe webhook normally sends it first.
 *
 * Only `sessionId` is read from the request. Payment is confirmed with Stripe,
 * the order is matched in Supabase, the recipient is the Stripe purchaser and
 * the attached plan is generated on the server from orders.form_data.
 */
export async function POST(req: NextRequest) {
  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    // handled below as a missing sessionId
  }
  const rawSessionId = (body as { sessionId?: unknown } | null)?.sessionId;
  const sessionId = typeof rawSessionId === "string" ? rawSessionId.trim() : "";
  if (!SESSION_ID_PATTERN.test(sessionId)) {
    return NextResponse.json({ error: "sessionId が不正です" }, { status: 400 });
  }

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (err) {
    if ((err as { type?: string } | null)?.type === "StripeInvalidRequestError") {
      return NextResponse.json({ error: "決済が見つかりません" }, { status: 404 });
    }
    console.error("[premium-review] stripe session retrieve failed:", (err as Error)?.message || err);
    return NextResponse.json({ error: "決済の確認に失敗しました" }, { status: 502 });
  }
  if (session.mode !== "payment" || session.payment_status !== "paid") {
    return NextResponse.json({ error: "支払いが完了していません" }, { status: 403 });
  }

  try {
    const order = await findOrder(session);
    if (!order) {
      return NextResponse.json({ error: "注文が見つかりません" }, { status: 404 });
    }
    if (order.plan_id !== "premium") {
      return NextResponse.json({ error: "premium プラン以外では使用できません" }, { status: 403 });
    }
    if (order.premium_email_sent_at) {
      return NextResponse.json({ ok: true, skipped: "already_sent" });
    }

    const customerEmail =
      session.customer_details?.email || session.customer_email || order.customer_email || "";
    if (!customerEmail) {
      return NextResponse.json({ error: "購入者のメールアドレスが取得できません" }, { status: 422 });
    }

    const result = await fulfillPremiumReview({
      order,
      customerEmail,
      sessionId: session.id,
      logPrefix: "[premium-review]",
    });
    return NextResponse.json(result === "sent" ? { ok: true } : { ok: true, skipped: result });
  } catch (err) {
    console.error("[premium-review] error:", err);
    return NextResponse.json({ error: "送信に失敗しました" }, { status: 500 });
  }
}

/** Match the order the same way as the webhook (metadata.order_id), then by session id. */
async function findOrder(session: Stripe.Checkout.Session): Promise<OrderRow | null> {
  const orderId = session.metadata?.order_id;
  if (orderId) {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select(ORDER_COLUMNS)
      .eq("id", orderId)
      .maybeSingle();
    if (error) throw error;
    if (data) return data;
  }
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(ORDER_COLUMNS)
    .eq("stripe_session_id", session.id)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}
