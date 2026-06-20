"use server";

import { sendCorporateInquiry } from "../../lib/sendCorporateInquiry";

export type InquiryInput = {
  company: string;
  name: string;
  email: string;
  tel?: string;
  properties?: string;
  message: string;
  // ボット対策のハニーポット（人間は空のまま）。
  website?: string;
};

export type InquiryResult = { ok: true } | { ok: false; error: string };

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function submitInquiry(input: InquiryInput): Promise<InquiryResult> {
  // ハニーポットに値があれば bot とみなし、成功を装って無視（メールは送らない）。
  if (input?.website) return { ok: true };

  const company = (input?.company || "").trim();
  const name = (input?.name || "").trim();
  const email = (input?.email || "").trim();
  const message = (input?.message || "").trim();

  if (!company || !name || !email || !message) {
    return { ok: false, error: "会社名・お名前・メール・ご相談内容は必須です。" };
  }
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "メールアドレスの形式をご確認ください。" };
  }
  if (message.length > 4000) {
    return { ok: false, error: "ご相談内容が長すぎます（4000文字以内）。" };
  }

  try {
    await sendCorporateInquiry({
      company,
      name,
      email,
      tel: (input?.tel || "").trim(),
      properties: (input?.properties || "").trim(),
      message,
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "送信に失敗しました。時間をおいて再度お試しください。" };
  }
}
