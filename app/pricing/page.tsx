"use client";
import { useState } from "react";

const PLANS = [
  {
    id: "minimum",
    name: "ミニマム",
    description: "消防計画の自動生成に特化",
    monthly: 980,
    yearly: 9800,
    features: [
      "消防計画書（Word形式）の自動生成",
      "年次更新ドラフト機能",
      "メールサポート",
    ],
    highlighted: false,
  },
  {
    id: "standard",
    name: "スタンダード",
    description: "別表・ガイド・通知をフル装備",
    monthly: 2980,
    yearly: 29800,
    features: [
      "ミニマムの全機能",
      "別表9種の自動生成",
      "提出用ガイドPDF",
      "法改正フラグ通知",
      "点検・訓練リマインド",
    ],
    highlighted: true,
  },
];

export default function PricingPage() {
  const [cycle, setCycle] = useState<"monthly" | "yearly">("yearly");

  return (
    <>
      <style jsx global>{`
        body { font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Noto Sans JP', sans-serif; background: #fff; color: #1d1d1f; margin: 0; }
      `}</style>

      <div style={{ maxWidth: 880, margin: "0 auto", padding: "60px 20px 96px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 8 }}>
            料金プラン
          </h1>
          <p style={{ fontSize: 16, color: "#86868b", marginBottom: 32 }}>
            年に一度の消防計画更新を、自動化しませんか。
          </p>

          {/* Monthly / Yearly toggle */}
          <div style={{
            display: "inline-flex", background: "#f5f5f7", borderRadius: 12, padding: 4,
          }}>
            <button
              onClick={() => setCycle("monthly")}
              style={{
                padding: "8px 20px", borderRadius: 10, border: "none", cursor: "pointer",
                fontSize: 14, fontWeight: 600,
                background: cycle === "monthly" ? "#fff" : "transparent",
                color: cycle === "monthly" ? "#1d1d1f" : "#86868b",
                boxShadow: cycle === "monthly" ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              }}
            >
              月額
            </button>
            <button
              onClick={() => setCycle("yearly")}
              style={{
                padding: "8px 20px", borderRadius: 10, border: "none", cursor: "pointer",
                fontSize: 14, fontWeight: 600,
                background: cycle === "yearly" ? "#fff" : "transparent",
                color: cycle === "yearly" ? "#1d1d1f" : "#86868b",
                boxShadow: cycle === "yearly" ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              }}
            >
              年額
              <span style={{
                marginLeft: 6, fontSize: 11, fontWeight: 700,
                background: "#E8332A", color: "#fff", borderRadius: 6,
                padding: "2px 6px",
              }}>
                2ヶ月分お得
              </span>
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 24,
        }}>
          {PLANS.map((plan) => {
            const price = cycle === "monthly" ? plan.monthly : plan.yearly;
            const unit = cycle === "monthly" ? "/月" : "/年";

            return (
              <div
                key={plan.id}
                style={{
                  border: plan.highlighted ? "2px solid #E8332A" : "1px solid #e5e5e7",
                  borderRadius: 20, padding: "36px 28px",
                  position: "relative",
                  background: "#fff",
                }}
              >
                {plan.highlighted && (
                  <div style={{
                    position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                    background: "#E8332A", color: "#fff", fontSize: 12, fontWeight: 700,
                    padding: "4px 16px", borderRadius: 20,
                  }}>
                    おすすめ
                  </div>
                )}

                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{plan.name}</h2>
                <p style={{ fontSize: 14, color: "#86868b", marginBottom: 20 }}>{plan.description}</p>

                <div style={{ marginBottom: 24 }}>
                  <span style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.02em" }}>
                    {price.toLocaleString()}
                  </span>
                  <span style={{ fontSize: 14, color: "#86868b" }}>円{unit}</span>
                </div>

                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", fontSize: 14, lineHeight: 2 }}>
                  {plan.features.map((f) => (
                    <li key={f}>
                      <span style={{ color: "#34c759", marginRight: 8 }}>&#10003;</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href={`/?plan=${plan.id}&cycle=${cycle}`}
                  style={{
                    display: "block", textAlign: "center", padding: "14px 0",
                    borderRadius: 12, fontWeight: 600, fontSize: 15,
                    textDecoration: "none",
                    background: plan.highlighted ? "#E8332A" : "#1d1d1f",
                    color: "#fff",
                  }}
                >
                  このプランで始める
                </a>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: "center", marginTop: 48, fontSize: 14, color: "#86868b" }}>
          <p>
            単発購入をご希望の方は
            <a href="/" style={{ color: "#E8332A", textDecoration: "none", fontWeight: 600 }}>
              こちら
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
