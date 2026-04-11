// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { sendPremiumReview } from "../../../lib/sendPremiumReview";
import { supabaseAdmin } from "../../../lib/supabase";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { customerEmail, planId, formData, docxBase64, fileName, sessionId } = await req.json();

    if (planId !== "premium") {
      return NextResponse.json({ error: "premium プラン以外では使用できません" }, { status: 400 });
    }
    if (!customerEmail || !docxBase64) {
      return NextResponse.json({ error: "customerEmail と docxBase64 は必須です" }, { status: 400 });
    }

    // Idempotency: if the Stripe webhook already sent this email, skip.
    // Also prefer the richer form_data from Supabase over whatever the
    // client sent (the client currently only sends { session_id }).
    let orderRow: any = null;
    if (sessionId) {
      const { data, error } = await supabaseAdmin
        .from("orders")
        .select("id, premium_email_sent_at, form_data")
        .eq("stripe_session_id", sessionId)
        .maybeSingle();
      if (error) {
        console.error("[premium-review] supabase lookup error:", error);
      } else {
        orderRow = data;
      }
    }

    if (orderRow?.premium_email_sent_at) {
      return NextResponse.json({ ok: true, skipped: "already_sent" });
    }

    const effectiveFormData =
      orderRow?.form_data && Object.keys(orderRow.form_data).length > 0
        ? orderRow.form_data
        : formData || {};

    await sendPremiumReview({
      customerEmail,
      formData: effectiveFormData,
      docxBuffer: docxBase64, // lib accepts base64 strings directly
      fileName,
      sessionId,
    });

    // Mark as sent so the webhook path doesn't double-send.
    if (orderRow?.id) {
      const { error: updateError } = await supabaseAdmin
        .from("orders")
        .update({ premium_email_sent_at: new Date().toISOString() })
        .eq("id", orderRow.id);
      if (updateError) {
        console.error("[premium-review] failed to mark premium_email_sent_at:", updateError);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[premium-review] error:", err);
    return NextResponse.json({ error: err?.message || "送信に失敗しました" }, { status: 500 });
  }
}
