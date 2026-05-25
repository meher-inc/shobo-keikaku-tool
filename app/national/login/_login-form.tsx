"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "sending" | "sent" | "error";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || status === "sending") return;
    setStatus("sending");

    try {
      const res = await fetch("/api/national-session", {
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
      // timing-padding 設計上、ネットワーク失敗以外は常に 200 が返るため
      // ここに来るのはほぼネットワーク断のみ
      setStatus("sent");
    }
  }

  if (status === "sent") {
    return (
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
        ご登録のメールアドレスに該当する場合、ログインリンクをお送りしました。
        受信箱をご確認ください（数分経っても届かない場合は迷惑メールフォルダもご確認ください）。
        <br />
        <span style={{ fontSize: 12, color: "#4b5563" }}>
          リンクは発行から約15分間有効です。
        </span>
      </div>
    );
  }

  return (
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
          メールアドレスの形式が正しくないか、送信に失敗しました。
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
  );
}
