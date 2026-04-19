"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PLANS, type BillingCycle } from "../../../lib/plans";

const GOOGLE_ADS_CONVERSION_ID = "AW-18069681696";
const GOOGLE_ADS_CONVERSION_LABEL = "QAlqCP2rjZ4cEKDspahD";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

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

  const [convFired, setConvFired] = useState(false);
  useEffect(() => {
    if (convFired) return;
    if (!info?.planId || !info?.billingCycle) return;
    if (typeof window === "undefined" || !window.gtag) return;

    const plan = PLANS.find((p) => p.id === info.planId);
    if (!plan) return;
    const cycle = info.billingCycle as BillingCycle;
    const amount = plan.prices[cycle];
    if (!amount) return;

    window.gtag("event", "conversion", {
      send_to: `${GOOGLE_ADS_CONVERSION_ID}/${GOOGLE_ADS_CONVERSION_LABEL}`,
      value: amount,
      currency: "JPY",
      transaction_id: sessionId || "",
    });

    window.gtag("event", "purchase", {
      transaction_id: sessionId || "",
      value: amount,
      currency: "JPY",
      items: [
        {
          item_id: info.planId,
          item_name: `${plan.name}（${CYCLE_LABELS[cycle] ?? cycle}）`,
          price: amount,
          quantity: 1,
          item_category: cycle,
        },
      ],
    });

    setConvFired(true);
  }, [info, sessionId, convFired]);

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

          <a href="https://lin.ee/MvnGLzW"
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

        
          <a href="/mypage"
          style={{
            display: "block", width: "100%", padding: 14, borderRadius: 14,
            background: "#E8332A", color: "#fff", fontSize: 16, fontWeight: 600,
            textDecoration: "none", marginBottom: 12, textAlign: "center",
          }}
        >
          マイページへ
        </a>

        
          <a href="/"
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
