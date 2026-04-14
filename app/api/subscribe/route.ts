import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  getPriceId,
  PLAN_IDS,
  BILLING_CYCLES,
  type PlanId,
  type BillingCycle,
} from "../../../lib/plans";
import { supabaseAdmin } from "../../../lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      planId,
      billingCycle,
      customerEmail,
      formData,
      coupon,
    }: {
      planId: string;
      billingCycle: string;
      customerEmail: string;
      formData?: Record<string, unknown>;
      coupon?: string;
    } = body;

    // ── validation ────────────────────────────────────────────
    if (!PLAN_IDS.includes(planId as PlanId)) {
      return NextResponse.json(
        { error: `Invalid planId: ${planId}` },
        { status: 400 }
      );
    }
    if (!BILLING_CYCLES.includes(billingCycle as BillingCycle)) {
      return NextResponse.json(
        { error: `Invalid billingCycle: ${billingCycle}` },
        { status: 400 }
      );
    }
    if (!customerEmail) {
      return NextResponse.json(
        { error: "customerEmail is required" },
        { status: 400 }
      );
    }

    const priceId = getPriceId(
      planId as PlanId,
      billingCycle as BillingCycle
    );

    // ── find or create Stripe Customer ────────────────────────
    const existingCustomers = await stripe.customers.list({
      email: customerEmail,
      limit: 1,
    });
    let customer: Stripe.Customer;
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0]!;
    } else {
      customer = await stripe.customers.create({ email: customerEmail });
    }

    // ── insert pending row in Supabase ──────────────────────
    const { data: draft, error: insertError } = await supabaseAdmin
      .from("subscriptions")
      .insert({
        status: "incomplete",
        plan_id: planId,
        billing_cycle: billingCycle,
        customer_email: customerEmail,
        stripe_price_id: priceId,
        stripe_customer_id: customer.id,
        stripe_subscription_id: null,
        cancel_at_period_end: false,
        initial_form_data: formData || null,
      })
      .select("id")
      .single();

    if (insertError || !draft) {
      console.error("[subscribe] supabase insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to create subscription draft" },
        { status: 500 }
      );
    }

    const subscriptionDraftId: string = draft.id;

    // ── prepare metadata ──────────────────────────────────────
    // Stripe metadata values must be strings ≤500 chars each.
    const formDataStr = formData ? JSON.stringify(formData) : "";
    const metadata: Record<string, string> = {
      subscription_draft_id: subscriptionDraftId,
      plan_id: planId,
      billing_cycle: billingCycle,
    };
    // If form_data fits in metadata, include it; otherwise the
    // webhook will read it from the request context or the
    // initial_form_data field in Supabase.
    if (formDataStr.length <= 500) {
      metadata.form_data = formDataStr;
    }

    // ── create checkout session ───────────────────────────────
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customer.id,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      metadata,
      subscription_data: { metadata },
      success_url: `${appUrl}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing`,
    };

    if (coupon) {
      sessionParams.discounts = [{ coupon }];
    } else {
      sessionParams.allow_promotion_codes = true;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    // ── save session id back to pending row for traceability ──
    await supabaseAdmin
      .from("subscriptions")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", subscriptionDraftId);

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "unknown error";
    console.error("[subscribe] error:", message);
    return NextResponse.json(
      { error: "サブスクリプションの作成に失敗しました: " + message },
      { status: 500 }
    );
  }
}
