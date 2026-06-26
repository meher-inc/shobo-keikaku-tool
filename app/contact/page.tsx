"use client";

import { useState } from "react";
import { submitInquiry } from "./actions";

const BRAND = "#2E5F9E";

const labelStyle: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, color: "#1d1d1f", marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: "100%", padding: "12px 16px", fontSize: 16, border: "1px solid #d2d2d7", borderRadius: 12, outline: "none", background: "#fbfbfd", boxSizing: "border-box" };

export default function ContactPage() {
  const [f, setF] = useState({ company: "", name: "", email: "", tel: "", properties: "", message: "", website: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrMsg("");
    const res = await submitInquiry(f);
    if (res.ok) {
      setStatus("done");
    } else {
      setStatus("error");
      setErrMsg(res.error);
    }
  }

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "clamp(40px,8vw,72px) 16px 64px" }}>
      <a href="/" style={{ fontSize: 13, color: BRAND, textDecoration: "none", fontWeight: 600 }}>← トドケデ消防計画にもどる</a>

      <h1 style={{ fontSize: "clamp(24px,5vw,32px)", fontWeight: 800, letterSpacing: "-0.01em", margin: "16px 0 8px" }}>法人・複数物件のご相談</h1>
      <p style={{ fontSize: 15, color: "#6e6e73", lineHeight: 1.8, marginBottom: 32 }}>
        管理会社・フランチャイズ本部・複数物件をお持ちの法人さま向けの相談窓口です。まとめての消防計画作成・運用、見積りのご相談を承ります。1件ごとの作成は<a href="/#form" style={{ color: BRAND }}>こちらのフォーム</a>からそのままご利用いただけます。
      </p>

      {status === "done" ? (
        <div style={{ padding: "24px 24px", background: "#f0faf0", border: "1px solid #b8e6b8", borderRadius: 16 }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: "#0d5e0d", margin: "0 0 8px" }}>送信しました</p>
          <p style={{ fontSize: 14, color: "#1a7a1a", lineHeight: 1.8, margin: 0 }}>
            ご相談ありがとうございます。担当より折り返しご連絡いたします。お急ぎの場合は plan@todokede.jp までご連絡ください。
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} style={{ background: "#fff", borderRadius: 20, padding: "28px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          {/* ハニーポット（人間には非表示） */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={f.website}
            onChange={(e) => set("website", e.target.value)}
            style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
            aria-hidden="true"
          />

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>会社・団体名<span style={{ color: "#ff3b30" }}> *</span></label>
            <input style={inputStyle} autoComplete="organization" value={f.company} onChange={(e) => set("company", e.target.value)} placeholder="株式会社○○" required />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>お名前<span style={{ color: "#ff3b30" }}> *</span></label>
              <input style={inputStyle} autoComplete="name" value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="山田 太郎" required />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>対象物件数</label>
              <input style={inputStyle} value={f.properties} onChange={(e) => set("properties", e.target.value)} placeholder="例：5棟" />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>メールアドレス<span style={{ color: "#ff3b30" }}> *</span></label>
              <input style={inputStyle} type="email" autoComplete="email" inputMode="email" value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="taro@example.com" required />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>電話番号</label>
              <input style={inputStyle} type="tel" autoComplete="tel" inputMode="tel" value={f.tel} onChange={(e) => set("tel", e.target.value)} placeholder="06-1234-5678" />
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>ご相談内容<span style={{ color: "#ff3b30" }}> *</span></label>
            <textarea
              style={{ ...inputStyle, minHeight: 140, resize: "vertical", lineHeight: 1.7 }}
              value={f.message}
              onChange={(e) => set("message", e.target.value)}
              placeholder="物件の用途・規模、ご希望の進め方などをご記入ください。"
              required
            />
          </div>

          {status === "error" && (
            <p style={{ fontSize: 13, color: "#ff3b30", margin: "0 0 16px" }}>{errMsg}</p>
          )}

          <button
            type="submit"
            disabled={status === "sending"}
            style={{ width: "100%", padding: "15px", fontSize: 16, fontWeight: 700, color: "#fff", background: BRAND, border: "none", borderRadius: 12, cursor: "pointer", opacity: status === "sending" ? 0.6 : 1 }}
          >
            {status === "sending" ? "送信中…" : "相談を送信する"}
          </button>
          <p style={{ fontSize: 12, color: "#6e6e73", marginTop: 12, lineHeight: 1.7 }}>
            送信内容は折り返しのご連絡のみに利用します。詳しくは<a href="/legal/privacy" style={{ color: BRAND }}>プライバシーポリシー</a>をご確認ください。
          </p>
        </form>
      )}
    </main>
  );
}
