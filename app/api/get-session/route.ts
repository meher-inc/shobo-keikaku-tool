import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "no session_id" }, { status: 400 });
  }
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  const result: Record<string, unknown> = {
    customerEmail: session.customer_details?.email || session.customer_email,
    mode: session.mode,
  };

  // For subscription sessions, include plan details from the subscription object.
  if (session.mode === "subscription" && session.subscription) {
    try {
      const subId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription.id;
      const sub = await stripe.subscriptions.retrieve(subId);
      const meta = sub.metadata || {};
      result.planId = meta.plan_id || null;
      result.billingCycle = meta.billing_cycle || null;
      const periodEnd = sub.items.data[0]?.current_period_end;
      result.currentPeriodEnd = periodEnd
        ? new Date(periodEnd * 1000).toISOString()
        : null;
    } catch {
      // Non-fatal: success page still renders without these fields.
    }
  }

  return NextResponse.json(result);
}