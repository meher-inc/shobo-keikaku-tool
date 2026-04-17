"use client";

import { useState, useCallback } from "react";
import { PLANS, type BillingCycle, type Plan } from "../../lib/plans";

/* ── Feature comparison matrix data ─────────────────────────── */

type Check = true | false | string;

interface FeatureRow {
  label: string;
  minimum: Check;
  standard: Check;
  pro: Check;
}

interface FeatureGroup {
  title: string;
  rows: FeatureRow[];
}

const FEATURE_MATRIX: FeatureGroup[] = [
  {
    title: "基本機能",
    rows: [
      { label: "消防計画の作成", minimum: true, standard: true, pro: true },
      { label: "年次レビュー", minimum: true, standard: true, pro: true },
      { label: "法改正通知", minimum: true, standard: true, pro: true },
      { label: "PDF出力", minimum: true, standard: true, pro: true },
    ],
  },
  {
    title: "訓練・点検管理",
    rows: [
      { label: "訓練計画の生成", minimum: false, standard: true, pro: true },
      { label: "訓練記録の管理", minimum: false, standard: true, pro: true },
      { label: "定期点検リマインド", minimum: false, standard: true, pro: true },
      { label: "点検記録の管理", minimum: false, standard: false, pro: true },
    ],
  },
  {
    title: "書類出力・変更届",
    rows: [
      { label: "変更届の自動生成", minimum: false, standard: true, pro: true },
      { label: "提出書類セット化", minimum: false, standard: true, pro: true },
    ],
  },
  {
    title: "高度な機能",
    rows: [
      { label: "複数事業所管理", minimum: false, standard: false, pro: "10件" },
      { label: "AI自動生成機能", minimum: false, standard: false, pro: true },
      { label: "ボウテンナビ連携", minimum: false, standard: false, pro: true },
      { label: "専用サポート窓口", minimum: false, standard: false, pro: true },
    ],
  },
];

/* ── FAQ data ───────────────────────────────────────────────── */

const FAQ_ITEMS = [
  {
    q: "月額プランはいつでも解約できますか？",
    a: "はい、マイページからいつでも解約可能です。解約した月の月末までサービスをご利用いただけます。",
  },
  {
    q: "プランの途中変更はできますか？",
    a: "可能です。マイページからアップグレード・ダウングレードができます。料金の日割り計算も自動で行われます。",
  },
  {
    q: "年額プランの方がどれくらいお得ですか？",
    a: "月額プランを1年間利用する場合と比較して、2ヶ月分（約17%）お得になります。",
  },
  {
    q: "支払い方法は何がありますか？",
    a: "クレジットカード決済（Visa/Master/JCB/Amex）、Apple Pay、Google Payに対応しています。法人向けの請求書払いは2026年後半より対応予定です。",
  },
  {
    q: "無料トライアルはありますか？",
    a: "新規のお客様向けの無料トライアルはございませんが、月額プランであればいつでも解約可能です。",
  },
  {
    q: "管轄消防署が対応地域外の場合は？",
    a: "現在、京都・東京を優先対応しております。他地域は順次対応予定です。事前にお問い合わせいただければ、対応時期の目安をお伝えします。",
  },
  {
    q: "消費税は別途必要ですか？",
    a: "表示価格はすべて税込みです。",
  },
  {
    q: "法人での複数アカウント利用は？",
    a: "プロプランなら、最大10事業所を1契約で管理できます。10を超える場合は個別にご相談ください。",
  },
  {
    q: "データのバックアップ・エクスポートは？",
    a: "いつでもPDF形式で書類をダウンロードいただけます。解約後も3ヶ月間はデータを保持しておりますので、その間にエクスポートいただけます。",
  },
  {
    q: "既に単発で購入済みですが、どうなりますか？",
    a: "既存のお客様向けの移行プランをご用意しています。ご不明な点は support@todokede.jp までお問い合わせください。",
  },
];

/* ── Page component ─────────────────────────────────────────── */

export default function PricingPage() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubscribe = useCallback(
    async (planId: string) => {
      setLoadingPlan(planId);
      try {
        const res = await fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId, billingCycle: cycle }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "エラーが発生しました");
        window.location.href = data.url;
      } catch (err) {
        alert(err instanceof Error ? err.message : "エラーが発生しました");
        setLoadingPlan(null);
      }
    },
    [cycle]
  );

  // Mobile: show recommended (standard) first
  const sortedPlans = [...PLANS].sort((a, b) => {
    if (a.recommended && !b.recommended) return -1;
    if (!a.recommended && b.recommended) return 1;
    return 0;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      {/* ── Section Title ────────────────────────────────── */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-3">
          月額プランで、継続的に消防安全を管理
        </h1>
        <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto">
          消防計画の作成から、年次更新・訓練記録・法改正追従まで。
          <br className="hidden md:block" />
          一度作って終わりではなく、ずっと使える仕組みに。
        </p>
      </div>

      {/* ── Billing Toggle ───────────────────────────────── */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setCycle("monthly")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              cycle === "monthly"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500"
            }`}
          >
            月額
          </button>
          <button
            onClick={() => setCycle("yearly")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              cycle === "yearly"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500"
            }`}
          >
            年額
            <span className="ml-1.5 text-[11px] font-bold bg-red-500 text-white rounded-md px-1.5 py-0.5">
              2ヶ月分お得
            </span>
          </button>
        </div>
      </div>

      {/* ── Plan Cards ───────────────────────────────────── */}
      {/* Mobile: sorted (standard first), Desktop: original order */}
      <div className="grid grid-cols-1 md:hidden gap-6 mb-16">
        {sortedPlans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            cycle={cycle}
            loading={loadingPlan === plan.id}
            disabled={loadingPlan !== null}
            onSubscribe={handleSubscribe}
          />
        ))}
      </div>
      <div className="hidden md:grid md:grid-cols-3 gap-6 mb-16">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            cycle={cycle}
            loading={loadingPlan === plan.id}
            disabled={loadingPlan !== null}
            onSubscribe={handleSubscribe}
          />
        ))}
      </div>

      {/* ── Feature Comparison Matrix ────────────────────── */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">機能比較</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-normal text-gray-500 w-1/3"></th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">ミニマム</th>
                <th className="text-center py-3 px-4 font-semibold text-red-600">スタンダード</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">プロ</th>
              </tr>
            </thead>
              {FEATURE_MATRIX.map((group) => (
                <tbody key={group.title}>
                  <tr>
                    <td
                      colSpan={4}
                      className="bg-gray-50 py-2 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider"
                    >
                      {group.title}
                    </td>
                  </tr>
                  {group.rows.map((row) => (
                    <tr key={row.label} className="border-b border-gray-100">
                      <td className="py-2.5 px-4 text-gray-700">{row.label}</td>
                      <td className="text-center py-2.5 px-4">
                        <CellValue value={row.minimum} />
                      </td>
                      <td className="text-center py-2.5 px-4">
                        <CellValue value={row.standard} />
                      </td>
                      <td className="text-center py-2.5 px-4">
                        <CellValue value={row.pro} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              ))}
          </table>
        </div>
      </div>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">よくあるご質問</h2>
        <div className="divide-y divide-gray-200 border-t border-b border-gray-200">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex justify-between items-center py-4 px-2 text-left text-[15px] font-medium text-gray-800 hover:text-red-600 transition-colors"
              >
                <span>{item.q}</span>
                <span className="ml-4 text-gray-400 text-lg flex-shrink-0">
                  {openFaq === i ? "\u2212" : "+"}
                </span>
              </button>
              {openFaq === i && (
                <div className="pb-4 px-2 text-sm text-gray-600 leading-relaxed">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Legacy single-purchase migration ─────────────── */}
      <div className="bg-blue-50 p-6 rounded-lg max-w-3xl mx-auto">
        <h3 className="text-lg font-bold mb-2">既に単発でご購入済みのお客様へ</h3>
        <p className="text-sm text-gray-700 mb-4">
          特別な移行プランをご用意しています。
          お問い合わせ先: support@todokede.jp
        </p>
        <a
          href="mailto:support@todokede.jp?subject=単発購入からサブスク移行について"
          className="inline-block px-4 py-2 border border-blue-600 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors"
        >
          移行について問い合わせる
        </a>
      </div>
    </div>
  );
}

/* ── PlanCard component ─────────────────────────────────────── */

function PlanCard({
  plan,
  cycle,
  loading,
  disabled,
  onSubscribe,
}: {
  plan: Plan;
  cycle: BillingCycle;
  loading: boolean;
  disabled: boolean;
  onSubscribe: (planId: string) => void;
}) {
  const price = cycle === "monthly" ? plan.prices.monthly : plan.prices.yearly;
  const unit = cycle === "monthly" ? "/月" : "/年";
  const isRecommended = plan.recommended === true;

  return (
    <div
      className={`relative rounded-2xl p-7 flex flex-col ${
        isRecommended
          ? "border-2 border-red-500 shadow-lg"
          : "border border-gray-200"
      }`}
    >
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
          ★ 最も選ばれているプラン
        </div>
      )}

      <div className="mb-1">
        <h3 className="text-xl font-bold">{plan.name}</h3>
      </div>
      <p className="text-sm text-gray-500 mb-4">{plan.target}</p>

      <div className="mb-5">
        <span className="text-4xl font-extrabold tracking-tight">
          {price.toLocaleString()}
        </span>
        <span className="text-sm text-gray-500 ml-1">円{unit}</span>
      </div>

      <button
        onClick={() => onSubscribe(plan.id)}
        disabled={disabled}
        className={`w-full py-3 rounded-xl font-semibold text-[15px] transition-colors mb-5 ${
          isRecommended
            ? "bg-red-500 text-white hover:bg-red-600"
            : "bg-gray-900 text-white hover:bg-gray-800"
        } ${disabled ? "opacity-60 cursor-wait" : "cursor-pointer"}`}
      >
        {loading ? "処理中..." : `${plan.name}で始める`}
      </button>

      <ul className="space-y-2 text-sm flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5 flex-shrink-0">&#10003;</span>
            <span>
              {f}
              {f.includes("AI自動生成") && (
                <span className="ml-1.5 text-[10px] font-bold bg-orange-500 text-white rounded px-1.5 py-0.5">
                  NEW
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── CellValue for comparison matrix ────────────────────────── */

function CellValue({ value }: { value: Check }) {
  if (value === true) {
    return <span className="text-red-500 font-bold">&#10003;</span>;
  }
  if (value === false) {
    return <span className="text-gray-300">&ndash;</span>;
  }
  return <span className="text-red-500 font-semibold text-xs">{value}</span>;
}
