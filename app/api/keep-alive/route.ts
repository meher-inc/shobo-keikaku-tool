import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase";
import { pingHealthcheck } from "../../../lib/healthcheck";

/**
 * Supabase 無料プランの自動一時停止（約7日間 DB アクセスが無いと pause）を
 * 防ぐためのキープアライブ。Vercel Cron（vercel.json の crons）から日次で
 * 叩かれ、軽量クエリで DB アクティビティを登録する。
 *
 * - 決済ロジックには一切関与しない（orders を 1 行 select するのみ）。
 * - CRON_SECRET が設定されていれば Authorization: Bearer で保護する
 *   （Vercel Cron は CRON_SECRET 設定時に自動でこのヘッダを送る）。
 *   未設定でも動作する（公開エンドポイントだが select limit 1 のみで実害なし）。
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return new NextResponse("unauthorized", { status: 401 });
    }
  }

  try {
    const { error } = await supabaseAdmin
      .from("orders")
      .select("id")
      .limit(1);

    if (error) {
      console.error("[keep-alive] supabase error:", error.message);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    await pingHealthcheck();
    return NextResponse.json({ ok: true, at: new Date().toISOString() });
  } catch (err: any) {
    console.error("[keep-alive] error:", err?.message || err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
