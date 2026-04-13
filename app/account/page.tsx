"use client";
import { useState } from "react";

export default function AccountPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/portal-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "エラーが発生しました");
      }
      setStatus("sent");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "エラーが発生しました");
      setStatus("error");
    }
  }

  return (
    <>
      <style jsx global>{`
        body { font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Noto Sans JP', sans-serif; background: #f5f5f7; color: #1d1d1f; margin: 0; }
      `}</style>
      <div style={{ maxWidth: 440, margin: "0 auto", padding: "80px 20px" }}>
        <div style={{
          background: "#fff", borderRadius: 24, padding: "40px 32px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.04)",
        }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, textAlign: "center" }}>
            マイページ
          </h1>
          <p style={{ fontSize: 14, color: "#86868b", textAlign: "center", marginBottom: 28, lineHeight: 1.6 }}>
            ご登録のメールアドレスを入力してください。<br />
            契約情報の確認リンクをメールでお送りします。
          </p>

          {status === "sent" ? (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>&#9993;</div>
              <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>
                メールをご確認ください
              </p>
              <p style={{ fontSize: 14, color: "#86868b" }}>
                {email} 宛に契約情報の確認リンクを送信しました。
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="example@company.co.jp"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 10,
                  border: "1px solid #d2d2d7", fontSize: 15, marginBottom: 16,
                  boxSizing: "border-box", outline: "none",
                }}
              />
              {status === "error" && (
                <p style={{ color: "#E8332A", fontSize: 13, margin: "0 0 12px" }}>
                  {errorMsg}
                </p>
              )}
              <button
                type="submit"
                disabled={status === "loading"}
                style={{
                  width: "100%", padding: 14, borderRadius: 12, border: "none",
                  background: "#E8332A", color: "#fff", fontSize: 15, fontWeight: 600,
                  cursor: status === "loading" ? "wait" : "pointer",
                  opacity: status === "loading" ? 0.7 : 1,
                }}
              >
                {status === "loading" ? "送信中..." : "契約情報を確認する"}
              </button>
            </form>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: 32, fontSize: 13, color: "#86868b" }}>
          <a href="/" style={{ color: "#E8332A", textDecoration: "none" }}>
            トップに戻る
          </a>
        </div>
      </div>
    </>
  );
}
