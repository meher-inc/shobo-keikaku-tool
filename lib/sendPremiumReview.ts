// @ts-nocheck
// Pure function for sending the two premium-review emails (SHUN + customer).
// Used by both /api/premium-review (client path) and /api/webhook/stripe (server path).
import { Resend } from "resend";
import { FROM_EMAIL } from "./email";

const REVIEW_TO_EMAIL = process.env.REVIEW_TO_EMAIL || "plan@todokede.jp";

// Japanese labels for the main form fields. Anything not in this map is
// rendered generically in an "その他" section.
const FIELD_LABELS: Record<string, string> = {
  building_name: "建物名",
  prefecture: "都道府県",
  city: "市区町村",
  ward: "区・町名",
  address_detail: "番地・ビル名",
  use_category: "用途区分",
  total_area: "延床面積(㎡)",
  num_floors: "階数",
  capacity: "収容人員",
  owner_name: "所有者氏名",
  manager_name: "防火管理者氏名",
  manager_qual: "防火管理者資格",
  manager_date: "選任年月日",
  manager_tel: "防火管理者連絡先",
  has_outsource: "管理委託の有無",
  outsource_company: "委託先",
  equipment: "設置消防用設備",
  inspection_company: "点検業者",
  security_company: "警備会社",
  emergency_name: "緊急連絡先(氏名)",
  emergency_tel: "緊急連絡先(電話)",
  evacuation_site: "広域避難場所",
  assembly_point: "一時集合場所",
  drill_months: "訓練実施月",
  education_months: "教育実施月",
  plan: "プラン",
};

// Primary fields shown at the top of the operator email, in order.
const PRIMARY_ORDER = [
  "plan",
  "building_name",
  "prefecture",
  "city",
  "ward",
  "address_detail",
  "use_category",
  "total_area",
  "num_floors",
  "capacity",
  "owner_name",
  "manager_name",
  "manager_qual",
  "manager_date",
  "manager_tel",
  "has_outsource",
  "outsource_company",
  "equipment",
  "inspection_company",
  "security_company",
  "emergency_name",
  "emergency_tel",
  "evacuation_site",
  "assembly_point",
  "drill_months",
  "education_months",
];

function escapeHtml(s: any): string {
  if (s === null || s === undefined) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatValue(v: any): string {
  if (v === null || v === undefined || v === "") return "(未入力)";
  if (Array.isArray(v)) return v.length === 0 ? "(なし)" : v.join(", ");
  if (typeof v === "boolean") return v ? "あり" : "なし";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function renderFormDataRows(formData: Record<string, any>): string {
  const rows: string[] = [];
  const seen = new Set<string>();

  for (const key of PRIMARY_ORDER) {
    if (!(key in (formData || {}))) continue;
    seen.add(key);
    const label = FIELD_LABELS[key] || key;
    const val = formatValue(formData[key]);
    rows.push(
      `<tr><td style="padding:6px 12px;background:#f5f5f7;font-weight:600;white-space:nowrap;vertical-align:top;">${escapeHtml(
        label
      )}</td><td style="padding:6px 12px;vertical-align:top;">${escapeHtml(val)}</td></tr>`
    );
  }

  // Any extra keys not in PRIMARY_ORDER (e.g. session_id, future fields).
  const extras = Object.keys(formData || {}).filter((k) => !seen.has(k));
  for (const key of extras) {
    const label = FIELD_LABELS[key] || key;
    const val = formatValue((formData as any)[key]);
    rows.push(
      `<tr><td style="padding:6px 12px;background:#fafafa;font-weight:500;white-space:nowrap;vertical-align:top;color:#666;">${escapeHtml(
        label
      )}</td><td style="padding:6px 12px;vertical-align:top;color:#666;">${escapeHtml(val)}</td></tr>`
    );
  }

  return rows.join("");
}

function toBase64(input: any): string {
  if (typeof input === "string") return input; // assume already base64
  if (input instanceof Uint8Array) return Buffer.from(input).toString("base64");
  if (input && typeof input === "object" && "byteLength" in input) {
    // ArrayBuffer
    return Buffer.from(new Uint8Array(input)).toString("base64");
  }
  return Buffer.from(input).toString("base64");
}

export type SendPremiumReviewArgs = {
  customerEmail: string;
  formData: Record<string, any>;
  docxBuffer: any; // Buffer | Uint8Array | ArrayBuffer | base64 string
  fileName?: string;
  sessionId?: string;
};

/**
 * Send the two premium-review emails (operator + customer).
 * Throws on any Resend error so the caller can mark the order appropriately.
 */
export async function sendPremiumReview(args: SendPremiumReviewArgs): Promise<void> {
  const { customerEmail, formData, docxBuffer, fileName, sessionId } = args;
  if (!customerEmail) throw new Error("customerEmail is required");
  if (!docxBuffer) throw new Error("docxBuffer is required");

  const resend = new Resend(process.env.RESEND_API_KEY);
  const attachment = {
    filename: fileName || "shobo_keikaku.docx",
    content: toBase64(docxBuffer),
  };

  const rowsHtml = renderFormDataRows(formData || {});
  const buildingName = (formData && formData.building_name) || "";

  const shunHtml = `
    <div style="font-family:-apple-system,sans-serif;line-height:1.7;color:#1d1d1f;">
      <h2>🔍 プレミアムチェック依頼が届きました</h2>
      <p><strong>顧客メール:</strong> ${escapeHtml(customerEmail)}</p>
      <p><strong>Stripe Session:</strong> ${escapeHtml(sessionId || "(なし)")}</p>
      <hr/>
      <h3>フォーム入力内容</h3>
      <table style="border-collapse:collapse;width:100%;font-size:13px;border:1px solid #e5e5e7;border-radius:8px;overflow:hidden;">
        ${rowsHtml}
      </table>
      <p style="margin-top:24px;">添付Wordを確認し、修正版を <strong>このメールに返信</strong> する形で顧客(${escapeHtml(
        customerEmail
      )})宛に送ってください。</p>
    </div>`;

  const r1 = await resend.emails.send({
    from: FROM_EMAIL,
    to: REVIEW_TO_EMAIL,
    replyTo: customerEmail,
    subject: `【プレミアム依頼】${customerEmail} ${buildingName}`,
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
          <li>ご質問はそのまま返信してください(修正1回まで対応)</li>
          <li>完成した消防計画を所轄消防本部へご提出ください</li>
        </ol>
      </div>
      <p>添付に、ご入力内容をもとに自動生成した消防計画Wordを同封しています。</p>
      <hr style="border:none;border-top:1px solid #e5e5e7;margin:32px 0;"/>
      <p style="color:#888;font-size:13px;">plan.todokede.jp / MeHer株式会社<br/>お問い合わせ: ${escapeHtml(
        REVIEW_TO_EMAIL
      )}</p>
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
}
