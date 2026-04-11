// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "../../../../lib/supabase";
import { sendPremiumReview } from "../../../../lib/sendPremiumReview";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  // 1. Signature verification. This is the only path that returns 400:
  //    everything after verification returns 200 to prevent Stripe retries
  //    for downstream errors we should handle ourselves.
  const sig = req.headers.get("stripe-signature") || "";
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch (err) {
    console.error("[webhook] failed to read body:", err);
    return new NextResponse("bad body", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error("[webhook] signature verification failed:", err?.message);
    return new NextResponse(`Webhook Error: ${err?.message || "invalid signature"}`, {
      status: 400,
    });
  }

  // 2. We only care about checkout.session.completed for now.
  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true, ignored: event.type });
  }

  try {
    await handleCheckoutCompleted(event);
  } catch (err: any) {
    // Log and swallow: returning 200 keeps Stripe from retrying for
    // failures that would just loop (e.g. Resend outages).
    console.error("[webhook] handler error:", err?.message || err);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const orderId = session.metadata?.order_id;
  if (!orderId) {
    console.warn("[webhook] checkout.session.completed without order_id metadata", session.id);
    return;
  }

  const { data: order, error: selectError } = await supabaseAdmin
    .from("orders")
    .select("id, status, plan_id, form_data, premium_email_sent_at, customer_email")
    .eq("id", orderId)
    .maybeSingle();

  if (selectError) {
    console.error("[webhook] supabase select error:", selectError);
    return;
  }
  if (!order) {
    console.warn("[webhook] order not found:", orderId);
    return;
  }

  // 3. Idempotency: if already paid, do nothing.
  if (order.status === "paid") {
    console.log("[webhook] order already paid, skipping:", orderId);
    return;
  }

  const customerEmail =
    session.customer_details?.email || session.customer_email || order.customer_email || null;

  // 4. Flip to paid.
  const { error: updateError } = await supabaseAdmin
    .from("orders")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      customer_email: customerEmail,
      stripe_session_id: session.id,
    })
    .eq("id", orderId);

  if (updateError) {
    console.error("[webhook] supabase update error:", updateError);
    return;
  }

  // 5. Premium: generate the docx server-side and send the review emails.
  if (order.plan_id === "premium" && !order.premium_email_sent_at) {
    if (!customerEmail) {
      console.warn("[webhook] premium order has no customer email:", orderId);
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const generateRes = await fetch(`${baseUrl}/api/generate-plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order.form_data || {}),
    });

    if (!generateRes.ok) {
      const errText = await generateRes.text().catch(() => "");
      throw new Error(
        `generate-plan failed: ${generateRes.status} ${errText.slice(0, 200)}`
      );
    }

    const arrayBuffer = await generateRes.arrayBuffer();
    const docxBuffer = Buffer.from(arrayBuffer);

    await sendPremiumReview({
      customerEmail,
      formData: order.form_data || {},
      docxBuffer,
      fileName: `消防計画_${(order.form_data && order.form_data.building_name) || "premium"}.docx`,
      sessionId: session.id,
    });

    const { error: markError } = await supabaseAdmin
      .from("orders")
      .update({ premium_email_sent_at: new Date().toISOString() })
      .eq("id", orderId);
    if (markError) {
      console.error("[webhook] failed to mark premium_email_sent_at:", markError);
    }
  }
}
