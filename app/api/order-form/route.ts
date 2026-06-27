// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "../../../lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

// 購入後に入力を編集できる期間（決済からの日数）。
const EDIT_WINDOW_DAYS = 14;

/**
 * 決済済みセッションに紐づく注文を取得し、編集可否を判定する。
 * 認可は /download と同じ「決済済み session_id を知る者＝購入者」モデル。
 */
async function resolvePaidOrder(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") {
    return { error: "支払いが完了していません", status: 400 as const };
  }
  const createdMs = (session.created || 0) * 1000;
  const ageDays = createdMs > 0 ? (Date.now() - createdMs) / 86_400_000 : Infinity;
  const withinWindow = ageDays <= EDIT_WINDOW_DAYS;

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("id, plan_id, form_data, status")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();
  if (error) {
    console.error("[order-form] supabase lookup error:", error);
    return { error: "注文の取得に失敗しました", status: 500 as const };
  }
  if (!order) {
    return { error: "注文が見つかりません", status: 404 as const };
  }
  return { order, withinWindow, editWindowDays: EDIT_WINDOW_DAYS };
}

// GET ?session_id= : 編集フォームのプリフィル用に form_data を返す。
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "session_id is required" }, { status: 400 });
  }
  try {
    const r = await resolvePaidOrder(sessionId);
    if ("error" in r) return NextResponse.json({ error: r.error }, { status: r.status });
    return NextResponse.json({
      form_data: r.order.form_data || {},
      plan_id: r.order.plan_id,
      editable: r.withinWindow,
      edit_window_days: r.editWindowDays,
    });
  } catch (e) {
    console.error("[order-form GET] error:", e);
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }
}

// POST { session_id, form_data } : 編集内容を保存する。
// 改ざん防止のため form_data.plan は注文時の plan_id に固定し、
// plan_id / amount / status / stripe_session_id は更新しない。
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sessionId = body?.session_id;
    const newForm = body?.form_data;
    if (!sessionId || !newForm || typeof newForm !== "object" || Array.isArray(newForm)) {
      return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
    }

    const r = await resolvePaidOrder(sessionId);
    if ("error" in r) return NextResponse.json({ error: r.error }, { status: r.status });
    if (!r.withinWindow) {
      return NextResponse.json(
        { error: `編集可能期間（${EDIT_WINDOW_DAYS}日）を過ぎています` },
        { status: 403 }
      );
    }

    // プランは注文時のものに固定（料金・出力レベルの不正引き上げを防ぐ）。
    const safeForm = { ...newForm, plan: r.order.plan_id };

    const { error: upErr } = await supabaseAdmin
      .from("orders")
      .update({ form_data: safeForm })
      .eq("id", r.order.id);
    if (upErr) {
      console.error("[order-form POST] update error:", upErr);
      return NextResponse.json({ error: "保存に失敗しました" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[order-form POST] error:", e);
    return NextResponse.json({ error: "保存に失敗しました" }, { status: 500 });
  }
}
