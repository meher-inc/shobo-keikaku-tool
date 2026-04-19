import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase";
import { sendPortalLinkEmail } from "../../../lib/sendPortalLink";

const OK_MESSAGE =
  "登録済みのメールアドレスに該当すれば、ポータルへのリンクをメールでお送りしました。メールボックスをご確認ください。";

// Timing attack mitigation: every 200 response must complete in at
// least this many ms so an attacker cannot distinguish "registered"
// from "unknown" by wall-clock. Tuned ~500ms above the observed hit
// path p50 (Supabase + Stripe portal create + Resend send ≈ 2.5s)
// to cover p99 latency drift observed at 2.9s. Security-critical —
// do not lower without re-measuring the hit path p99.
const TIMING_PADDING_MS = 3000;

function summarizeError(err: unknown): string {
  if (err instanceof Error) {
    const frame = err.stack?.split("\n")[1]?.trim() ?? "(no stack)";
    return `${err.name}: ${err.message} (${frame})`;
  }
  return String(err);
}

export async function POST(request: NextRequest) {
  const start = Date.now();

  let email: unknown;
  try {
    const body = await request.json();
    email = body?.email;
  } catch {
    return NextResponse.json(
      { ok: false, message: "リクエスト形式が不正です。" },
      { status: 400 }
    );
  }

  if (typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json(
      { ok: false, message: "メールアドレスの形式が正しくありません。" },
      { status: 400 }
    );
  }

  const normalized = email.toLowerCase().trim();

  try {
    const { data } = await supabaseAdmin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("customer_email", normalized)
      .not("stripe_customer_id", "is", null)
      .in("status", ["active", "trialing", "past_due", "unpaid"])
      .limit(1)
      .maybeSingle();

    if (data?.stripe_customer_id) {
      await sendPortalLinkEmail(normalized, data.stripe_customer_id).catch(
        (e) => console.error("[portal-link] send failed:", summarizeError(e))
      );
    }
  } catch (err) {
    // Never surface internal errors — they'd enable email enumeration.
    console.error("[portal-link] error:", summarizeError(err));
  }

  // timing attack mitigation: single unified wait-until at the 200
  // return point ensures all paths (hit/non-hit/Supabase-error/
  // Stripe-error/Resend-error) converge to the same wall-clock band.
  const remaining = TIMING_PADDING_MS - (Date.now() - start);
  if (remaining > 0) {
    await new Promise((r) => setTimeout(r, remaining));
  }

  return NextResponse.json({ ok: true, message: OK_MESSAGE });
}
