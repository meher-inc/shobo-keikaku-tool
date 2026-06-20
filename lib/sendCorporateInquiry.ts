// 法人・複数物件向け「ご相談」フォームの内容をチームへメール送信する。
// 送信パターンは lib/sendPortalLink.ts と同じ（Resend・検証済みFROM）。
import { Resend } from "resend";
import { FROM_EMAIL } from "./email";

export type CorporateInquiry = {
  company: string;
  name: string;
  email: string;
  tel?: string;
  properties?: string;
  message: string;
};

function esc(v: unknown): string {
  return String(v ?? "").replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c] as string));
}

export async function sendCorporateInquiry(data: CorporateInquiry): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const to = process.env.REVIEW_TO_EMAIL || "plan@todokede.jp";

  const rows: Array<[string, string]> = [
    ["会社・団体名", data.company],
    ["お名前", data.name],
    ["メール", data.email],
    ["電話", data.tel || "—"],
    ["対象物件数", data.properties || "—"],
  ];
  const table = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px;color:#666;white-space:nowrap;">${esc(k)}</td><td style="padding:6px 12px;color:#1d1d1f;font-weight:600;">${esc(v)}</td></tr>`
    )
    .join("");

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    replyTo: data.email,
    subject: `【法人相談】${data.company || "（会社名未入力）"}`,
    html: `
      <div style="font-family:-apple-system,sans-serif;line-height:1.7;color:#1d1d1f;">
        <p>法人・複数物件のご相談フォームから問い合わせがありました。</p>
        <table style="border-collapse:collapse;margin:16px 0;font-size:14px;">${table}</table>
        <p style="color:#666;font-size:13px;margin:8px 0 4px;">ご相談内容:</p>
        <div style="white-space:pre-wrap;padding:12px 14px;background:#f5f5f7;border-radius:8px;font-size:14px;">${esc(data.message)}</div>
        <hr style="border:none;border-top:1px solid #e5e5e7;margin:24px 0;"/>
        <p style="color:#888;font-size:13px;">トドケデ消防計画 / MeHer株式会社（このメールに返信すると相談者へ直接届きます）</p>
      </div>`,
  });

  if (error) {
    throw new Error("corporate inquiry mail failed: " + JSON.stringify(error));
  }
}
