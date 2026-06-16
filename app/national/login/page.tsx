import type { Metadata } from "next";
import { LoginForm } from "./_login-form";

export const metadata: Metadata = {
  title: "届出書セクション ログイン ｜ トドケデ消防計画",
  description: "サブスクリプション契約者向け 全国統一様式 届出書セクションへのログイン。",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function NationalLoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const errorReason = typeof sp.error === "string" ? sp.error : null;

  const errorMessage =
    errorReason === "expired"
      ? "ログインリンクの有効期限が切れています。もう一度メール送信してください。"
      : errorReason === "bad_signature" || errorReason === "malformed"
        ? "ログインリンクが不正です。もう一度メール送信してください。"
        : errorReason === "wrong_purpose"
          ? "リンクの形式が不正です。もう一度メール送信してください。"
          : null;

  return (
    <div style={{ background: "#f5f5f7", minHeight: "calc(100vh - 200px)", padding: "64px 20px" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: "40px 32px",
            border: "1px solid #e5e5e7",
          }}
        >
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              margin: "0 0 8px",
              color: "#1a1a1a",
              textAlign: "center",
            }}
          >
            届出書セクション ログイン
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "#666",
              margin: "0 0 28px",
              lineHeight: 1.7,
              textAlign: "center",
            }}
          >
            ご契約中のメールアドレスにログインリンクをお送りします。
            <br />
            <span style={{ fontSize: 12, color: "#888" }}>
              （未契約の方は <a href="/pricing" style={{ color: "#2E5F9E" }}>料金プラン</a> をご確認ください）
            </span>
          </p>

          {errorMessage && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 10,
                padding: "12px 16px",
                fontSize: 13,
                color: "#991b1b",
                lineHeight: 1.7,
                marginBottom: 20,
              }}
            >
              {errorMessage}
            </div>
          )}

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
