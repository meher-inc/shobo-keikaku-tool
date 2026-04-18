"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

export default function MyPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || status === "sending") return;
    setStatus("sending");

    try {
      const res = await fetch("/api/portal-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.status === 400) {
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch {
      setStatus("sent");
    }
  }

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
            マイページ
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
            ご登録のメールアドレスにログインリンクをお送りします。
          </p>

          {status === "sent" ? (
            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: 10,
                padding: "20px",
                fontSize: 14,
                color: "#166534",
                lineHeight: 1.7,
              }}
            >
              メールをお送りしました。受信箱をご確認ください。
              <br />
              数分経っても届かない場合は迷惑メールフォルダもご確認ください。
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 6,
                  color: "#1a1a1a",
                }}
              >
                メールアドレス
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@company.co.jp"
                disabled={status === "sending"}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #d1d5db",
                  borderRadius: 10,
                  fontSize: 15,
                  marginBottom: 16,
                  boxSizing: "border-box",
                  outline: "none",
                  background: status === "sending" ? "#f9fafb" : "#fff",
                }}
              />
              {status === "error" && (
                <p style={{ color: "#E8332A", fontSize: 13, margin: "0 0 12px" }}>
                  送信に失敗しました。時間をおいて再度お試しください。
                </p>
              )}
              <button
                type="submit"
                disabled={status === "sending"}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "14px 0",
                  background: "#E8332A",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: status === "sending" ? "wait" : "pointer",
                  opacity: status === "sending" ? 0.7 : 1,
                }}
              >
                {status === "sending" ? "送信中..." : "ログインリンクを送る"}
              </button>
            </form>
          )}
        </div>

        <p
          style={{
            textAlign: "center",
            marginTop: 24,
            fontSize: 12,
            color: "#86868b",
            lineHeight: 1.7,
          }}
        >
          ご不明点は{" "}
          <a href="mailto:plan@todokede.jp" style={{ color: "#E8332A", textDecoration: "none" }}>
            plan@todokede.jp
          </a>{" "}
          までご連絡ください。
        </p>
      </div>
    </div>
  );
}
