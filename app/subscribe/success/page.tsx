"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const PLAN_LABELS: Record<string, string> = {
  minimum: "ミニマム",
  standard: "スタンダード",
};
const CYCLE_LABELS: Record<string, string> = {
  monthly: "月額",
  yearly: "年額",
};

interface SessionInfo {
  customerEmail?: string;
  planId?: string;
  billingCycle?: string;
  currentPeriodEnd?: string;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [info, setInfo] = useState<SessionInfo | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/get-session?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((data) => setInfo(data))
      .catch(() => {});
  }, [sessionId]);

  const planLabel = info?.planId ? PLAN_LABELS[info.planId] ?? info.planId : null;
  const cycleLabel = info?.billingCycle ? CYCLE_LABELS[info.billingCycle] ?? info.billingCycle : null;
  const nextBilling = info?.currentPeriodEnd
    ? new Date(info.currentPeriodEnd).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
      <div style={{
        background: "#fff", borderRadius: 24, padding: "48px 32px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.04)",
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>&#127881;</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
          サブスクリプション登録ありがとうございます
        </h1>

        {/* Plan details */}
        {(planLabel || cycleLabel || nextBilling) && (
          <div style={{
            background: "#f5f5f7", borderRadius: 12, padding: "16px 20px",
            margin: "20px 0", textAlign: "left", fontSize: 14, lineHeight: 2,
          }}>
            {planLabel && cycleLabel && (
              <div><span style={{ color: "#86868b" }}>プラン:</span> <strong>{planLabel}（{cycleLabel}）</strong></div>
            )}
            {nextBilling && (
              <div><span style={{ color: "#86868b" }}>次回請求日:</span> <strong>{nextBilling}</strong></div>
            )}
            {info?.customerEmail && (
              <div><span style={{ color: "#86868b" }}>メール:</span> {info.customerEmail}</div>
            )}
          </div>
        )}

        <p style={{ fontSize: 14, color: "#86868b", lineHeight: 1.7, marginBottom: 16 }}>
          Stripeから決済完了通知メールが届きます。<br />
          契約内容の確認・変更はマイページから行えます。
        </p>

        {/* Release schedule notice */}
        <div style={{
          background: "#FFFBEB", border: "1px solid #f6c244", borderRadius: 12,
          padding: "14px 16px", margin: "20px 0", textAlign: "left",
          fontSize: 13, color: "#92400E", lineHeight: 1.7,
        }}>
          <strong>生成機能のリリースについて</strong><br />
          サブスクプランの消防計画生成機能は2026年5月以降の段階リリースとなります。
          リリース時はご登録メールにてご案内いたします。
        </div>

        {/* LINE registration */}
        <a
          href="https://lin.ee/MvnGLzW"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block", width: "100%", padding: 14, borderRadius: 14,
            background: "#06C755", color: "#fff", fontSize: 15, fontWeight: 600,
            textDecoration: "none", marginBottom: 12, textAlign: "center",
          }}
        >
          LINE公式アカウントも登録する
        </a>

        <a
          href="/account"
          style={{
            display: "block", width: "100%", padding: 14, borderRadius: 14,
            background: "#E8332A", color: "#fff", fontSize: 16, fontWeight: 600,
            textDecoration: "none", marginBottom: 12, textAlign: "center",
          }}
        >
          マイページへ
        </a>
        <a
          href="/"
          style={{
            display: "block", padding: 14, borderRadius: 14,
            background: "#f5f5f7", color: "#E8332A", fontSize: 15, fontWeight: 600,
            textDecoration: "none", textAlign: "center",
          }}
        >
          トップに戻る
        </a>
      </div>
    </div>
  );
}

export default function SubscribeSuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
        <p style={{ color: "#86868b" }}>読み込み中...</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
