"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "ready" | "downloading" | "done" | "error">("loading");

  useEffect(() => {
    if (sessionId) setStatus("ready");
    else setStatus("error");
  }, [sessionId]);

  async function handleDownload() {
    setStatus("downloading");
    try {
      const res = await fetch(`/api/download?session_id=${sessionId}`);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "消防計画.docx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <style jsx global>{`
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Noto Sans JP', sans-serif;
          background: #f5f5f7; color: #1d1d1f; margin: 0;
        }
      `}</style>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "60px 20px", textAlign: "center" }}>
        <div style={{
          background: "#fff", borderRadius: 24, padding: "48px 32px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.04)",
        }}>
          {status === "loading" && (
            <>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
              <h1 style={{ fontSize: 24, fontWeight: 700 }}>確認中...</h1>
            </>
          )}

          {status === "ready" && (
            <>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>お支払い完了</h1>
              <p style={{ fontSize: 15, color: "#86868b", marginBottom: 32, lineHeight: 1.6 }}>
                ありがとうございます。<br />
                下のボタンから消防計画をダウンロードしてください。
              </p>
              <button onClick={handleDownload} style={{
                width: "100%", padding: 16, borderRadius: 14, border: "none",
                background: "#0071e3", color: "#fff", fontSize: 17, fontWeight: 600,
                cursor: "pointer", boxShadow: "0 4px 16px rgba(0,113,227,0.25)",
              }}>
                📄 消防計画をダウンロード
              </button>
            </>
          )}

          {status === "downloading" && (
            <>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
              <h1 style={{ fontSize: 24, fontWeight: 700 }}>生成中...</h1>
              <p style={{ fontSize: 15, color: "#86868b" }}>消防計画を作成しています。しばらくお待ちください。</p>
            </>
          )}

          {status === "done" && (
            <>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
              <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>ダウンロード完了</h1>
              <p style={{ fontSize: 15, color: "#86868b", marginBottom: 32, lineHeight: 1.6 }}>
                消防計画のWordファイルがダウンロードされました。<br />
                内容をご確認のうえ、所轄の消防署に届け出てください。
              </p>
              <button onClick={handleDownload} style={{
                width: "100%", padding: 14, borderRadius: 14, border: "none",
                background: "#e8e8ed", color: "#1d1d1f", fontSize: 15, fontWeight: 600,
                cursor: "pointer", marginBottom: 12,
              }}>
                もう一度ダウンロード
              </button>
              <a href="/" style={{
                display: "block", padding: 14, borderRadius: 14,
                background: "#f5f5f7", color: "#0071e3", fontSize: 15, fontWeight: 600,
                textDecoration: "none",
              }}>
                トップに戻る
              </a>
            </>
          )}

          {status === "error" && (
            <>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
              <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>エラーが発生しました</h1>
              <p style={{ fontSize: 15, color: "#86868b", marginBottom: 32 }}>
                お手数ですが、もう一度お試しいただくか、<br />
                info@todokede.jp までご連絡ください。
              </p>
              <a href="/" style={{
                display: "block", padding: 14, borderRadius: 14,
                background: "#0071e3", color: "#fff", fontSize: 15, fontWeight: 600,
                textDecoration: "none",
              }}>
                トップに戻る
              </a>
            </>
          )}
        </div>

        <div style={{ marginTop: 32, fontSize: 12, color: "#86868b" }}>
          <p>届出でお困りの場合は代行サービスもご利用いただけます</p>
          <a href="https://todokede.jp" style={{ color: "#0071e3", fontWeight: 600, textDecoration: "none" }}>
            トドケデ代行サービス →
          </a>
        </div>
      </div>
    </>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: 60 }}>読み込み中...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
