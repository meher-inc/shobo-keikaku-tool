import type { Metadata } from "next";
import { normalizeInternalReturnTo } from "@/lib/internal-return-to";
import { InternalLoginForm } from "./_login-form";

export const metadata: Metadata = {
  title: "運営者専用ログイン ｜ トドケデ消防計画",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function InternalLoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const errorReason =
    typeof params.error === "string" ? params.error : null;
  const returnTo = normalizeInternalReturnTo(params.return_to);

  const errorMessage =
    errorReason === "expired"
      ? "ログインリンクの有効期限が切れています。もう一度送信してください。"
      : errorReason === "bad_signature" ||
          errorReason === "malformed" ||
          errorReason === "wrong_purpose"
        ? "ログインリンクが無効です。もう一度送信してください。"
        : errorReason === "not_allowed"
          ? "このメールアドレスは運営者無料利用の対象ではありません。"
          : null;

  return (
    <div
      style={{
        background: "#f5f5f7",
        minHeight: "calc(100vh - 200px)",
        padding: "64px 20px",
      }}
    >
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
            運営者専用ログイン
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
            `INTERNAL_FREE_ACCESS_EMAILS` に登録したメールだけが
            無料利用できます。
            <br />
            認証後は消防計画フォームへ戻ります。
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

          <InternalLoginForm returnTo={returnTo} />
        </div>
      </div>
    </div>
  );
}
