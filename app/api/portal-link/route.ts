import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase";
import { sendPortalLinkEmail } from "../../../lib/sendPortalLink";

const OK_MESSAGE =
  "登録済みのメールアドレスに該当すれば、ポータルへのリンクをメールでお送りしました。メールボックスをご確認ください。";

export async function POST(request: NextRequest) {
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
        (e) => console.error("[portal-link] send failed:", e)
      );
    }
  } catch (err) {
    // Never surface internal errors — they'd enable email enumeration.
    console.error("[portal-link] error:", err);
  }

  return NextResponse.json({ ok: true, message: OK_MESSAGE });
}
