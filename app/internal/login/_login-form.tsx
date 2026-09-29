"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "sending" | "sent" | "error";

export function InternalLoginForm({ returnTo }: { returnTo: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || status === "sending") return;
    setStatus("sending");

    try {
      const response = await fetch("/api/internal-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, returnTo }),
      });

      if (response.status === 400) {
        setStatus("error");
        return;
      }

      setStatus("sent");
    } catch {
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
          padding: 20,
          fontSize: 14,
          color: "#166534",
          lineHeight: 1.7,
        }}
      >
        登録済みの運営者メールに該当する場合、ログインリンクを送信しました。
        受信箱をご確認ください。
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
        運営者メールアドレス
      </label>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
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
        <p style={{ color: "#991b1b", fontSize: 13, margin: "0 0 12px" }}>
          メールアドレスの形式をご確認ください。
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        style={{
          display: "block",
          width: "100%",
          padding: "14px 0",
          background: "#2E5F9E",
          color: "#fff",
          border: "none",
          borderRadius: 12,
          fontWeight: 600,
          fontSize: 15,
          cursor: status === "sending" ? "wait" : "pointer",
          opacity: status === "sending" ? 0.7 : 1,
        }}
      >
        {status === "sending" ? "送信中..." : "運営者ログインリンクを送る"}
      </button>
    </form>
  );
}
