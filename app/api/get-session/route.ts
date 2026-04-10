import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "no session_id" }, { status: 400 });
  }
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return NextResponse.json({
    customerEmail: session.customer_details?.email || session.customer_email,
  });
}