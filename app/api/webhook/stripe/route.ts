// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { supabaseAdmin } from "../../../../lib/supabase";
import { sendPremiumReview } from "../../../../lib/sendPremiumReview";
import { upsertSubscriptionFromStripe } from "../../../../lib/subscriptions";
import { PLANS } from "../../../../lib/plans";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = "plan.todokede.jp <noreply@todokede.jp>";
const REVIEW_TO_EMAIL = process.env.REVIEW_TO_EMAIL || "plan@todokede.jp";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature") || "";
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch (err) {
    console.error("[webhook] failed to read body:", err);
    return new NextResponse("bad body", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error("[webhook] signature verification failed:", err?.message);
    return new NextResponse(
      `Webhook Error: ${err?.message || "invalid signature"}`,
      { status: 400 }
    );
  }

  // Route to handler by event type. Every handler is wrapped in
  // try-catch and always returns 200 to prevent Stripe retries.
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "payment") {
          await handleOneTimePayment(session);
        } else if (session.mode === "subscription") {
          await handleSubscriptionCheckoutCompleted(session);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpsert(event);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event);
        break;
      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event);
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event);
        break;
      default:
        break;
    }
  } catch (err: any) {
    console.error(`[webhook] ${event.type} handler error:`, err?.message || err);
  }

  return NextResponse.json({ received: true });
}

// ── checkout.session.completed — single-purchase (existing) ──────

async function handleOneTimePayment(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.order_id;
  if (!orderId) {
    console.warn("[webhook] checkout.session.completed without order_id metadata", session.id);
    return;
  }

  const { data: order, error: selectError } = await supabaseAdmin
    .from("orders")
    .select("id, status, plan_id, form_data, premium_email_sent_at, customer_email")
    .eq("id", orderId)
    .maybeSingle();

  if (selectError) {
    console.error("[webhook] supabase select error:", selectError);
    return;
  }
  if (!order) {
    console.warn("[webhook] order not found:", orderId);
    return;
  }
  if (order.status === "paid") {
    console.log("[webhook] order already paid, skipping:", orderId);
    return;
  }

  const customerEmail =
    session.customer_details?.email || session.customer_email || order.customer_email || null;

  const { error: updateError } = await supabaseAdmin
    .from("orders")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      customer_email: customerEmail,
      stripe_session_id: session.id,
    })
    .eq("id", orderId);

  if (updateError) {
    console.error("[webhook] supabase update error:", updateError);
    return;
  }

  if (order.plan_id === "premium" && !order.premium_email_sent_at) {
    if (!customerEmail) {
      console.warn("[webhook] premium order has no customer email:", orderId);
      return;
    }
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const generateRes = await fetch(`${baseUrl}/api/generate-plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order.form_data || {}),
    });
    if (!generateRes.ok) {
      const errText = await generateRes.text().catch(() => "");
      throw new Error(`generate-plan failed: ${generateRes.status} ${errText.slice(0, 200)}`);
    }
    const arrayBuffer = await generateRes.arrayBuffer();
    const docxBuffer = Buffer.from(arrayBuffer);
    await sendPremiumReview({
      customerEmail,
      formData: order.form_data || {},
      docxBuffer,
      fileName: `消防計画_${(order.form_data && order.form_data.building_name) || "premium"}.docx`,
      sessionId: session.id,
    });
    const { error: markError } = await supabaseAdmin
      .from("orders")
      .update({ premium_email_sent_at: new Date().toISOString() })
      .eq("id", orderId);
    if (markError) {
      console.error("[webhook] failed to mark premium_email_sent_at:", markError);
    }
  }
}

// ── checkout.session.completed — subscription checkout ───────────

async function handleSubscriptionCheckoutCompleted(
  session: Stripe.Checkout.Session
) {
  const subscriptionDraftId = session.metadata?.subscription_draft_id;
  const stripeSubscriptionId = session.subscription as string | null;
  const stripeCustomerId = session.customer as string | null;

  if (!subscriptionDraftId) {
    console.warn("[webhook] subscription checkout without subscription_draft_id", session.id);
    return;
  }

  if (!stripeSubscriptionId) {
    console.warn("[webhook] subscription checkout without subscription id", session.id);
    return;
  }

  // Check if another row already owns this stripe_subscription_id
  // (e.g. customer.subscription.created arrived first via upsert).
  const { data: existing } = await supabaseAdmin
    .from("subscriptions")
    .select("id")
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .maybeSingle();

  if (existing) {
    // The canonical row already exists. Delete the draft to avoid duplicates.
    if (existing.id !== subscriptionDraftId) {
      console.log(
        "[webhook] draft row superseded by existing row, deleting draft:",
        subscriptionDraftId
      );
      await supabaseAdmin
        .from("subscriptions")
        .delete()
        .eq("id", subscriptionDraftId)
        .is("stripe_subscription_id", null);
    }
    // Either way, the subscription is already tracked. Nothing more to do.
    console.log("[webhook] subscription checkout completed (existing row):", stripeSubscriptionId);
    return;
  }

  // Resolve customer email from Stripe session (collected at checkout).
  const checkoutEmail =
    session.customer_details?.email || session.customer_email || null;

  // No existing row — fill in the draft row with Stripe IDs + real email.
  const draftUpdate: Record<string, unknown> = {
    stripe_subscription_id: stripeSubscriptionId,
    stripe_customer_id: stripeCustomerId,
  };
  if (checkoutEmail) {
    draftUpdate.customer_email = checkoutEmail;
  }

  const { error } = await supabaseAdmin
    .from("subscriptions")
    .update(draftUpdate)
    .eq("id", subscriptionDraftId)
    .is("stripe_subscription_id", null);

  if (error) {
    // UNIQUE violation means another event just beat us — clean up the draft.
    if (error.code === "23505") {
      console.log("[webhook] UNIQUE race on draft, deleting draft:", subscriptionDraftId);
      await supabaseAdmin
        .from("subscriptions")
        .delete()
        .eq("id", subscriptionDraftId)
        .is("stripe_subscription_id", null);
    } else {
      console.error("[webhook] subscription draft update error:", error);
    }
  }

  console.log(
    "[webhook] subscription checkout completed:",
    session.id,
    "draft:", subscriptionDraftId,
    "sub:", stripeSubscriptionId
  );
}

// ── customer.subscription.created / updated ──────────────────────

async function handleSubscriptionUpsert(event: Stripe.Event) {
  const sub = event.data.object as Stripe.Subscription;
  await upsertSubscriptionFromStripe(sub);

  // Send welcome email on creation
  if (event.type === "customer.subscription.created") {
    const customerId =
      typeof sub.customer === "string" ? sub.customer : sub.customer.id;
    let customerEmail = "";
    try {
      const customer = await stripe.customers.retrieve(customerId);
      if (!customer.deleted) customerEmail = customer.email || "";
    } catch { /* ignore */ }

    const meta = sub.metadata || {};
    const planId = meta.plan_id || "unknown";
    const billingCycle = meta.billing_cycle || "monthly";

    if (customerEmail) {
      const plan = PLANS.find((p) => p.id === planId);
      const planLabel =
        plan?.name ??
        (planId === "standard"
          ? "スタンダード"
          : planId === "minimum"
            ? "ミニマム"
            : "ご契約");
      const cycleLabel = billingCycle === "yearly" ? "年額" : "月額";
      const amount =
        plan && (billingCycle === "monthly" || billingCycle === "yearly")
          ? plan.prices[billingCycle]
          : undefined;
      const amountLabel = amount
        ? `¥${amount.toLocaleString("ja-JP")}`
        : "—";
      const periodEnd = sub.items?.data?.[0]?.current_period_end;
      const nextBillingLabel = periodEnd
        ? new Date(periodEnd * 1000).toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "—";

      await resend.emails.send({
        from: FROM_EMAIL,
        to: customerEmail,
        subject: "【トドケデ消防計画】お申し込みありがとうございます",
        html: `
          <div style="font-family:-apple-system,sans-serif;line-height:1.7;color:#1d1d1f;">
            <h2 style="color:#E8332A;">お申し込みありがとうございます</h2>
            <p>この度はトドケデ消防計画のサブスクリプションにお申し込みいただき、誠にありがとうございます。お支払いが正常に完了しました。</p>

            <div style="background:#f5f5f7;padding:16px 20px;border-radius:12px;margin:20px 0;font-size:14px;line-height:1.9;">
              <div><strong>プラン:</strong> ${planLabel}（${cycleLabel}）</div>
              <div><strong>金額:</strong> ${amountLabel}（税込）</div>
              <div><strong>次回請求日:</strong> ${nextBillingLabel}</div>
            </div>

            <h3 style="margin-top:28px;font-size:16px;">ご利用方法について</h3>
            <p><a href="https://plan.todokede.jp/mypage">マイページ</a>からフォームに情報を入力し、消防計画 Word ファイルを生成いただけます。</p>

            <h3 style="margin-top:28px;font-size:16px;">ご契約管理</h3>
            <p>プラン変更・解約・支払い方法変更等は <a href="https://plan.todokede.jp/mypage">マイページ</a> からいつでも可能です。</p>

            <h3 style="margin-top:28px;font-size:16px;">お問い合わせ</h3>
            <p>ご不明な点がありましたら、このメールにご返信ください。</p>

            <hr style="border:none;border-top:1px solid #e5e5e7;margin:32px 0;"/>
            <p style="color:#888;font-size:13px;">トドケデ消防計画 / MeHer株式会社</p>
          </div>`,
      });
    }

    console.log("[webhook] subscription created:", sub.id, planId, billingCycle);
  }
}

// ── customer.subscription.deleted ────────────────────────────────

async function handleSubscriptionDeleted(event: Stripe.Event) {
  const sub = event.data.object as Stripe.Subscription;

  // upsert will set status=canceled and canceled_at
  await upsertSubscriptionFromStripe(sub);

  // Cancellation confirmation email
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  let email = "";
  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (!customer.deleted) email = customer.email || "";
  } catch { /* ignore */ }

  if (email) {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "【トドケデ消防計画】サブスクリプション解約完了",
      html: `
        <div style="font-family:-apple-system,sans-serif;line-height:1.7;color:#1d1d1f;">
          <h2>解約が完了しました</h2>
          <p>ご利用いただきありがとうございました。</p>
          <p>再度ご契約いただく場合は <a href="https://plan.todokede.jp/pricing">こちら</a> からお手続きください。</p>
          <hr style="border:none;border-top:1px solid #e5e5e7;margin:32px 0;"/>
          <p style="color:#888;font-size:13px;">plan.todokede.jp / MeHer株式会社</p>
        </div>`,
    });
  }

  console.log("[webhook] subscription deleted:", sub.id);
}

// ── invoice.payment_succeeded ────────────────────────────────────

async function handleInvoicePaymentSucceeded(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;

  if (invoice.subscription) {
    // Retrieve the up-to-date Subscription and upsert to DB
    const sub = await stripe.subscriptions.retrieve(
      invoice.subscription as string
    );
    await upsertSubscriptionFromStripe(sub);
  }

  // Only send renewal notification for recurring cycles (not initial).
  if (invoice.billing_reason !== "subscription_cycle") return;

  const email = invoice.customer_email;
  if (email) {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "【トドケデ消防計画】お支払いが完了しました",
      html: `
        <div style="font-family:-apple-system,sans-serif;line-height:1.7;color:#1d1d1f;">
          <h2>更新お支払い完了</h2>
          <p>今月分のお支払いが正常に処理されました。</p>
          <p>契約内容の確認・変更は <a href="https://plan.todokede.jp/mypage">マイページ</a> から行えます。</p>
          <hr style="border:none;border-top:1px solid #e5e5e7;margin:32px 0;"/>
          <p style="color:#888;font-size:13px;">plan.todokede.jp / MeHer株式会社</p>
        </div>`,
    });
  }
}

// ── invoice.payment_failed ───────────────────────────────────────

async function handleInvoicePaymentFailed(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;

  if (invoice.subscription) {
    // Retrieve the up-to-date Subscription and upsert (status=past_due)
    const sub = await stripe.subscriptions.retrieve(
      invoice.subscription as string
    );
    await upsertSubscriptionFromStripe(sub);
  }

  const email = invoice.customer_email;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://plan.todokede.jp";

  // Notify customer
  if (email) {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "【トドケデ消防計画】お支払いに失敗しました",
      html: `
        <div style="font-family:-apple-system,sans-serif;line-height:1.7;color:#1d1d1f;">
          <h2 style="color:#E8332A;">お支払いに失敗しました</h2>
          <p>クレジットカードの決済が完了できませんでした。</p>
          <p>以下のリンクからカード情報を更新してください。</p>
          <a href="${appUrl}/mypage" style="display:inline-block;padding:12px 24px;background:#E8332A;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">カード情報を更新する</a>
          <hr style="border:none;border-top:1px solid #e5e5e7;margin:32px 0;"/>
          <p style="color:#888;font-size:13px;">plan.todokede.jp / MeHer株式会社</p>
        </div>`,
    });
  }

  // Notify SHUN
  await resend.emails.send({
    from: FROM_EMAIL,
    to: REVIEW_TO_EMAIL,
    subject: `【管理】決済失敗: ${email || "(unknown)"}`,
    html: `<p>Invoice ${invoice.id} の決済が失敗しました。顧客: ${email || "(unknown)"}</p>`,
  });
}
