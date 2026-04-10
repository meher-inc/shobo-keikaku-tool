"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const PLAN_NAMES: Record<string, string> = {
  light: "ライト",
  standard: "スタンダード",
  premium: "プレミアム",
};

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const plan = searchParams.get("plan") || "standard";
  const planName = PLAN_NAMES[plan] || "スタンダード";
  const [status, setStatus] = useState<"loading" | "ready" | "downloading" | "done" | "error">("loading");
  const [reviewStatus, setReviewStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");

  useEffect(() => {
    if (sessionId) setStatus("ready");
    else setStatus("error");
  }, [sessionId]);

  async function sendPremiumReview(blob: Blob) {
    try {
      setReviewStatus("sending");
      const sessionRes = await fetch(`/api/get-session?session_id=${sessionId}`);
      const { customerEmail } = await sessionRes.json();
      if (!customerEmail) throw new Error("顧客メールが取得できません");

      const arrayBuffer = await blob.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
      const docxBase64 = btoa(binary);

      const res = await fetch("/api/premium-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerEmail,
          planId: "premium",
          formData: { session_id: sessionId },
          docxBase64,
          fileName: "shobo_keikaku.docx",
          sessionId,
        }),
      });
      if (!res.ok) throw new Error("送信失敗");
      setReviewStatus("sent");
    } catch (e) {
      console.error(e);
      setReviewStatus("failed");
    }
  }

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

      if (plan === "premium" && reviewStatus === "idle") {
        sendPremiumReview(blob);
      }
    } catch {
      setStatus("error");
    }
  }

  const showGuide = plan === "standard" || plan === "premium";
  const showPremiumInfo = plan === "premium";

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
              <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>お支払い完了</h1>
              <div style={{ display: "inline-block", fontSize: 12, fontWeight: 600, padding: "3px 12px", borderRadius: 20, background: "#FDECEA", color: "#E8332A", marginBottom: 12 }}>
                {planName}プラン
              </div>
              <p style={{ fontSize: 15, color: "#86868b", marginBottom: 24, lineHeight: 1.6 }}>
                ありがとうございます。<br />
                下のボタンから消防計画をダウンロードしてください。
              </p>
              <button onClick={handleDownload} style={{
                width: "100%", padding: 16, borderRadius: 14, border: "none",
                background: "#E8332A", color: "#fff", fontSize: 17, fontWeight: 600,
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
              <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>ダウンロード完了</h1>
              <div style={{ display: "inline-block", fontSize: 12, fontWeight: 600, padding: "3px 12px", borderRadius: 20, background: "#FDECEA", color: "#E8332A", marginBottom: 16 }}>
                {planName}プラン
              </div>
              <p style={{ fontSize: 15, color: "#86868b", marginBottom: 24, lineHeight: 1.6 }}>
                消防計画のWordファイルがダウンロードされました。<br />
                内容をご確認のうえ、所轄の消防署に届け出てください。
              </p>

              {showGuide && (
                <a href="/guide.pdf" download style={{
                  display: "block", width: "100%", padding: 14, borderRadius: 14, background: "#f0faf0", color: "#0d5e0d", fontSize: 15, fontWeight: 600,
                  textDecoration: "none", marginBottom: 12, textAlign: "center",
                  border: "1px solid #b8e6b8",
                }}>
                  📘 記入ガイドPDFをダウンロード
                </a>
              )}

              {showPremiumInfo && (
                <div style={{
                  padding: "20px 24px", borderRadius: 16, marginBottom: 16,
                  background: "#FDECEA", border: "1px solid #b8d4ff", textAlign: "left",
                }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#C8261E", marginBottom: 10 }}>
                    🔍 内容チェック＋修正1回（プレミアム特典）
                  </div>

                  {reviewStatus === "sending" && (
                    <p style={{ fontSize: 13, color: "#1d1d1f", lineHeight: 1.8, margin: 0 }}>
                      ⏳ チェック依頼を送信中...
                    </p>
                  )}

                  {reviewStatus === "sent" && (
                    <>
                      <p style={{ fontSize: 13, color: "#1d1d1f", lineHeight: 1.8, margin: 0, marginBottom: 8 }}>
                        ✅ <strong>チェック依頼を自動で送信しました</strong>
                      </p>
                      <p style={{ fontSize: 13, color: "#1d1d1f", lineHeight: 1.8, margin: 0 }}>
                        ご登録のメール宛に受付確認メールをお送りしました。元消防士の担当者が <strong>3営業日以内</strong> に修正版のWordをご返送いたします。
                      </p>
                    </>
                  )}

                  {reviewStatus === "failed" && (
                    <div style={{
                      padding: "14px 16px", borderRadius: 12, background: "#fff",
                      fontSize: 13, color: "#1d1d1f", lineHeight: 1.8,
                    }}>
                      <div style={{ fontWeight: 600, marginBottom: 6, color: "#c00" }}>⚠️ 自動送信に失敗しました</div>
                      <div>お手数ですが、ダウンロードしたWordを下記まで送付してください。</div>
                      <div style={{
                        margin: "8px 0", padding: "10px 14px", borderRadius: 10,
                        background: "#f5f5f7", fontWeight: 600, fontSize: 14, textAlign: "center",
                      }}>
                        📧 plan@todokede.jp
                      </div>
                      <div>3営業日以内にチェック済みファイルを返送いたします。</div>
                    </div>
                  )}
                </div>
              )}

              <button onClick={handleDownload} style={{
                width: "100%", padding: 14, borderRadius: 14, border: "none",
                background: "#e8e8ed", color: "#1d1d1f", fontSize: 15, fontWeight: 600,
                cursor: "pointer", marginBottom: 12,
              }}>
                もう一度ダウンロード
              </button>
              <a href="/" style={{
                display: "block", padding: 14, borderRadius: 14,
                background: "#f5f5f7", color: "#E8332A", fontSize: 15, fontWeight: 600,
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
                background: "#E8332A", color: "#fff", fontSize: 15, fontWeight: 600,
                textDecoration: "none",
              }}>
                トップに戻る
              </a>
            </>
          )}
        </div>

        <div style={{ marginTop: 32, fontSize: 12, color: "#86868b" }}>
          <p>届出でお困りの場合は代行サービスもご利用いただけます</p>
          <a href="https://todokede.jp" style={{ color: "#E8332A", fontWeight: 600, textDecoration: "none" }}>
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