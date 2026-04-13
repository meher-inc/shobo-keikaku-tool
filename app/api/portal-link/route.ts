import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = "plan.todokede.jp <noreply@todokede.jp>";

// Simple in-memory rate limiter: 1 request per email per 5 minutes.
const lastSent = new Map<string, number>();
const RATE_LIMIT_MS = 5 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const { email }: { email?: string } = await request.json();
    if (!email) {
      return NextResponse.json(
        { error: "email is required" },
        { status: 400 }
      );
    }

    // Rate limit
    const now = Date.now();
    const last = lastSent.get(email);
    if (last && now - last < RATE_LIMIT_MS) {
      return NextResponse.json(
        { error: "リクエストが多すぎます。5分後に再度お試しください。" },
        { status: 429 }
      );
    }

    // Find Stripe Customer by email
    const customers = await stripe.customers.list({
      email,
      limit: 10,
    });
    if (customers.data.length === 0) {
      return NextResponse.json(
        { error: "この Email に紐づくアカウントが見つかりません。" },
        { status: 404 }
      );
    }

    // Use the most recently created customer
    const customer = customers.data[0]!;
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://plan.todokede.jp";

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${appUrl}/account`,
    });

    // Send the portal link via email instead of returning the URL
    // directly — prevents URL leakage in browser history / logs.
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "【トドケデ消防計画】契約情報の確認リンク",
      html: `
        <div style="font-family:-apple-system,sans-serif;line-height:1.7;color:#1d1d1f;">
          <h2>契約情報の確認</h2>
          <p>以下のリンクから契約内容の確認・変更が行えます。</p>
          <a href="${portalSession.url}" style="display:inline-block;padding:14px 28px;background:#E8332A;color:#fff;border-radius:10px;text-decoration:none;font-weight:600;">契約情報を確認する</a>
          <p style="margin-top:16px;color:#888;font-size:13px;">このリンクは一度のみ有効です。</p>
          <hr style="border:none;border-top:1px solid #e5e5e7;margin:32px 0;"/>
          <p style="color:#888;font-size:13px;">plan.todokede.jp / MeHer株式会社</p>
        </div>`,
    });

    lastSent.set(email, now);
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "unknown error";
    console.error("[portal-link] error:", message);
    return NextResponse.json(
      { error: "処理に失敗しました: " + message },
      { status: 500 }
    );
  }
}
