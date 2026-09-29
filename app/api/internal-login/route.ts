import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { FROM_EMAIL } from "@/lib/email";
import {
  isInternalFreeAccessEmail,
  normalizeAccessEmail,
} from "@/lib/internal-access";
import { normalizeInternalReturnTo } from "@/lib/internal-return-to";
import { signToken, LOGIN_TOKEN_TTL_SEC } from "@/lib/session-token";

export const runtime = "nodejs";

const OK_MESSAGE =
  "対象のメールアドレスにログインリンクをお送りしました。受信箱をご確認ください。";
const TIMING_PADDING_MS = 3000;

function summarizeError(err: unknown): string {
  if (err instanceof Error) return `${err.name}: ${err.message}`;
  return String(err);
}

export async function POST(request: NextRequest) {
  const start = Date.now();

  let email: unknown;
  let returnTo: unknown;
  try {
    const body = await request.json();
    email = body?.email;
    returnTo = body?.returnTo;
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

  const normalized = normalizeAccessEmail(email);
  const safeReturnTo = normalizeInternalReturnTo(returnTo);

  try {
    if (isInternalFreeAccessEmail(normalized)) {
      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL || "https://plan.todokede.jp";
      const token = await signToken({
        email: normalized,
        purpose: "login",
        ttlSec: LOGIN_TOKEN_TTL_SEC,
      });
      const url =
        `${appUrl}/api/internal-login/verify?token=${encodeURIComponent(token)}` +
        `&return_to=${encodeURIComponent(safeReturnTo)}`;

      const resend = new Resend(process.env.RESEND_API_KEY);
      const { error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: normalized,
        subject: "【トドケデ消防計画】運営者専用ログインリンク",
        html: `
          <div style="font-family:-apple-system,sans-serif;line-height:1.7;color:#1d1d1f;">
            <p>トドケデ消防計画の運営者専用ログインリンクです。</p>
            <p style="margin:24px 0;">
              <a href="${url}" style="display:inline-block;padding:14px 28px;background:#2E5F9E;color:#fff;border-radius:10px;text-decoration:none;font-weight:600;">消防計画フォームへログイン</a>
            </p>
            <p style="color:#666;font-size:12px;">このリンクは発行から約15分有効です。</p>
            <hr style="border:none;border-top:1px solid #e5e5e7;margin:32px 0;"/>
            <p style="color:#999;font-size:11px;">このメールに心当たりがない場合は破棄してください。</p>
            <p style="color:#888;font-size:13px;">トドケデ / MeHer株式会社</p>
          </div>`,
      });
      if (error) {
        console.error("[internal-login] resend error:", summarizeError(error));
      }
    } else {
      // Keep the response indistinguishable to avoid revealing the allowlist.
      console.log(
        `[internal-login] non-hit email_hash=${normalized.length}c`
      );
    }
  } catch (err) {
    console.error("[internal-login] error:", summarizeError(err));
  }

  const remaining = TIMING_PADDING_MS - (Date.now() - start);
  if (remaining > 0) {
    await new Promise((resolve) => setTimeout(resolve, remaining));
  }

  return NextResponse.json({ ok: true, message: OK_MESSAGE });
}
