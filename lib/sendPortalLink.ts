// Sends a one-off Stripe Customer Portal link to a customer's email.
// Kept separate from sendPremiumReview to avoid coupling unrelated flows.
import Stripe from "stripe";
import { Resend } from "resend";

const FROM_EMAIL = "トドケデ消防計画 <plan@todokede.jp>";

export async function sendPortalLinkEmail(
  email: string,
  stripeCustomerId: string
): Promise<void> {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const resend = new Resend(process.env.RESEND_API_KEY);
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://plan.todokede.jp";

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${appUrl}/mypage`,
  });

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "【トドケデ消防計画】マイページへのログインリンク",
    html: `
      <div style="font-family:-apple-system,sans-serif;line-height:1.7;color:#1d1d1f;">
        <p>マイページ(プラン管理・解約・支払い方法変更・請求履歴)へのログインリンクです。</p>
        <p style="margin:24px 0;">
          <a href="${portalSession.url}" style="display:inline-block;padding:14px 28px;background:#E8332A;color:#fff;border-radius:10px;text-decoration:none;font-weight:600;">ログインする</a>
        </p>
        <p style="color:#666;font-size:12px;">このリンクは発行から約1時間有効です。期限切れの場合はもう一度 <a href="${appUrl}/mypage">マイページ</a> からリンクを請求してください。</p>
        <hr style="border:none;border-top:1px solid #e5e5e7;margin:32px 0;"/>
        <p style="color:#999;font-size:11px;">このメールに心当たりがない場合は破棄してください。</p>
        <p style="color:#888;font-size:13px;">plan.todokede.jp / MeHer株式会社</p>
      </div>`,
  });

  if (error) {
    throw new Error("portal link mail failed: " + JSON.stringify(error));
  }
}
