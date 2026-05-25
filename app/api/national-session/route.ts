import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { FROM_EMAIL } from "@/lib/email";
import { checkAccess, normalizeEmail } from "@/lib/national-access";
import { signToken, LOGIN_TOKEN_TTL_SEC } from "@/lib/session-token";

export const runtime = "nodejs";

const OK_MESSAGE =
  "ご登録のメールアドレスにログインリンクをお送りしました。受信箱をご確認ください。";

// portal-link と同じく timing-attack mitigation。
// hit path p99 (Supabase + Resend ≈ 2.5s) + 余裕で 3000ms。
const TIMING_PADDING_MS = 3000;

function summarizeError(err: unknown): string {
  if (err instanceof Error) return `${err.name}: ${err.message}`;
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

  const normalized = normalizeEmail(email);

  try {
    const decision = await checkAccess(normalized);
    // 契約がある場合のみメールを送る。
    // 未契約/解約済み/DBエラー時はサイレントスキップ (列挙攻撃対策)。
    if (decision.allowed) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://plan.todokede.jp";
      const token = await signToken({
        email: normalized,
        purpose: "login",
        ttlSec: LOGIN_TOKEN_TTL_SEC,
      });
      const url = `${appUrl}/api/national-session/verify?token=${encodeURIComponent(token)}`;

      const resend = new Resend(process.env.RESEND_API_KEY);
      const { error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: normalized,
        subject: "【トドケデ消防計画】届出書セクションへのログインリンク",
        html: `
          <div style="font-family:-apple-system,sans-serif;line-height:1.7;color:#1d1d1f;">
            <p>全国統一様式 届出書セクションへのログインリンクです。</p>
            <p style="margin:24px 0;">
              <a href="${url}" style="display:inline-block;padding:14px 28px;background:#E8332A;color:#fff;border-radius:10px;text-decoration:none;font-weight:600;">届出書セクションへログイン</a>
            </p>
            <p style="color:#666;font-size:12px;">このリンクは発行から約15分有効です。期限切れの場合は <a href="${appUrl}/national/login">こちら</a> からもう一度リンクを請求してください。</p>
            <hr style="border:none;border-top:1px solid #e5e5e7;margin:32px 0;"/>
            <p style="color:#999;font-size:11px;">このメールに心当たりがない場合は破棄してください。リンクをクリックしない限り、ログイン状態にはなりません。</p>
            <p style="color:#888;font-size:13px;">トドケデ / MeHer株式会社</p>
          </div>`,
      });
      if (error) {
        console.error("[national-session] resend error:", summarizeError(error));
      }
    } else {
      // 列挙攻撃対策のためログのみ残し、レスポンスは hit と同じ
      console.log(
        `[national-session] non-hit decision=${decision.reason} email_hash=${normalized.length}c`
      );
    }
  } catch (err) {
    console.error("[national-session] error:", summarizeError(err));
  }

  const remaining = TIMING_PADDING_MS - (Date.now() - start);
  if (remaining > 0) {
    await new Promise((r) => setTimeout(r, remaining));
  }

  return NextResponse.json({ ok: true, message: OK_MESSAGE });
}
