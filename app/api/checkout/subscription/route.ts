import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "../../../../lib/supabase";
import {
  getPriceId,
  type SubscriptionPlanId,
  type BillingCycle,
} from "../../../../lib/stripe-plans";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const VALID_PLAN_IDS: SubscriptionPlanId[] = ["minimum", "standard"];
const VALID_CYCLES: BillingCycle[] = ["monthly", "yearly"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan_id, billing_cycle, customer_email, form_data } = body as {
      plan_id: string;
      billing_cycle: string;
      customer_email: string;
      form_data?: Record<string, unknown>;
    };

    // ── validation ────────────────────────────────────────────
    if (!VALID_PLAN_IDS.includes(plan_id as SubscriptionPlanId)) {
      return NextResponse.json(
        { error: `Invalid plan_id: ${plan_id}` },
        { status: 400 }
      );
    }
    if (!VALID_CYCLES.includes(billing_cycle as BillingCycle)) {
      return NextResponse.json(
        { error: `Invalid billing_cycle: ${billing_cycle}` },
        { status: 400 }
      );
    }
    if (
      !customer_email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer_email)
    ) {
      return NextResponse.json(
        { error: "Valid customer_email is required" },
        { status: 400 }
      );
    }
    if (!form_data || typeof form_data !== "object") {
      return NextResponse.json(
        { error: "form_data is required" },
        { status: 400 }
      );
    }

    const priceId = getPriceId(
      plan_id as SubscriptionPlanId,
      billing_cycle as BillingCycle
    );

    // ── insert pending row in Supabase ───────────────────────
    const { data: draft, error: insertError } = await supabaseAdmin
      .from("subscriptions")
      .insert({
        status: "incomplete",
        plan_id,
        billing_cycle,
        customer_email,
        stripe_price_id: priceId,
        stripe_customer_id: null,
        stripe_subscription_id: null,
        cancel_at_period_end: false,
        initial_form_data: form_data,
      })
      .select("id")
      .single();

    if (insertError || !draft) {
      console.error("[checkout/subscription] insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to create subscription draft" },
        { status: 500 }
      );
    }

    const subscriptionDraftId = draft.id;

    // ── create Stripe Checkout Session ───────────────────────
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const metadata: Record<string, string> = {
      subscription_draft_id: subscriptionDraftId,
      plan_id,
      billing_cycle,
    };

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email,
      success_url: `${appUrl}/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing`,
      metadata,
      subscription_data: {
        metadata,
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "unknown error";
    console.error("[checkout/subscription] error:", message);
    return NextResponse.json(
      { error: "サブスクリプションの作成に失敗しました: " + message },
      { status: 500 }
    );
  }
}
