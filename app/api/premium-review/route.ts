import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = "plan.todokede.jp <noreply@todokede.jp>";
const REVIEW_TO_EMAIL = process.env.REVIEW_TO_EMAIL || "plan@todokede.jp";

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

    const formText = Object.entries(formData || {})
      .map(([k, v]) => `・${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`)
      .join("\n");

    const attachment = { filename: fileName || "shobo_keikaku.docx", content: docxBase64 };

    const shunHtml = `
      <div style="font-family:-apple-system,sans-serif;line-height:1.7;">
        <h2>🔍 プレミアムチェック依頼が届きました</h2>
        <p><strong>顧客メール:</strong> ${customerEmail}</p>
        <p><strong>Stripe Session:</strong> ${sessionId || "(なし)"}</p>
        <hr/>
        <h3>フォーム入力内容</h3>
        <pre style="background:#f5f5f7;padding:16px;border-radius:8px;white-space:pre-wrap;font-size:13px;">${formText}</pre>
        <p style="margin-top:24px;">添付Wordを確認し、修正版を <strong>このメールに返信</strong> する形で顧客（${customerEmail}）宛に送ってください。</p>
      </div>`;

    const r1 = await resend.emails.send({
      from: FROM_EMAIL,
      to: REVIEW_TO_EMAIL,
      replyTo: customerEmail,
      subject: `【プレミアム依頼】${customerEmail} ${formData?.building_name || ""}`,
      html: shunHtml,
      attachments: [attachment],
    });
    if (r1.error) throw new Error("SHUN送信失敗: " + JSON.stringify(r1.error));

    const customerHtml = `
      <div style="font-family:-apple-system,sans-serif;line-height:1.7;color:#1d1d1f;">
        <h2 style="color:#E8332A;">チェック依頼を受け付けました</h2>
        <p>この度はプレミアムプランをご購入いただきありがとうございます。</p>
        <p>元京都市消防局・10年勤務の担当者が、消防計画の内容をチェックいたします。</p>
        <div style="background:#f5f5f7;padding:20px;border-radius:12px;margin:24px 0;">
          <h3 style="margin-top:0;">📋 今後の流れ</h3>
          <ol>
            <li><strong>3営業日以内</strong>に修正版Wordを返送します</li>
            <li>ご質問はそのまま返信してください（修正1回まで対応）</li>
            <li>完成した消防計画を所轄消防本部へご提出ください</li>
          </ol>
        </div>
        <p>添付に、ご入力内容をもとに自動生成した消防計画Wordを同封しています。</p>
        <hr style="border:none;border-top:1px solid #e5e5e7;margin:32px 0;"/>
        <p style="color:#888;font-size:13px;">plan.todokede.jp / MeHer株式会社<br/>お問い合わせ: ${REVIEW_TO_EMAIL}</p>
      </div>`;

    const r2 = await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      replyTo: REVIEW_TO_EMAIL,
      subject: "【plan.todokede.jp】プレミアムチェック依頼を受付けました",
      html: customerHtml,
      attachments: [attachment],
    });
    if (r2.error) throw new Error("顧客送信失敗: " + JSON.stringify(r2.error));

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[premium-review] error:", err);
    return NextResponse.json({ error: err?.message || "送信に失敗しました" }, { status: 500 });
  }
}