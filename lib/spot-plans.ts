/**
 * Spot (one-time purchase) plans — Single Source of Truth.
 *
 * plan.todokede.jp は都度払い（買い切り）モデル。
 * 主フォーム（app/page.tsx）と料金ページ（components/pricing-cards.tsx）は
 * この定義を参照する。決済の価格は app/api/checkout/route.ts の PLAN_CONFIG と
 * 一致させること（金額・id を変える場合は両方を更新）。
 */

export const SPOT_PLAN_IDS = ["light", "standard", "premium"] as const;
export type SpotPlanId = (typeof SPOT_PLAN_IDS)[number];

export interface SpotPlan {
  id: SpotPlanId;
  name: string;
  /** 税込・円。checkout route の PLAN_CONFIG と一致させる。 */
  price: number;
  priceLabel: string;
  description: string;
  /** 料金ページ・主フォームで「おすすめ」として強調表示する。 */
  recommended?: boolean;
  features: string[];
  /** 上位プランに含まれ、このプランには含まれない項目。 */
  missing: string[];
}

export const SPOT_PLANS: SpotPlan[] = [
  {
    id: "light",
    name: "ライト",
    price: 4980,
    priceLabel: "¥4,980",
    description: "消防計画のみ",
    features: ["消防計画Word出力", "所轄消防本部の様式に準拠"],
    missing: ["別表", "記入ガイド", "内容チェック"],
  },
  {
    id: "standard",
    name: "スタンダード",
    price: 9800,
    priceLabel: "¥9,800",
    description: "計画＋別表＋ガイド",
    recommended: true,
    features: [
      "消防計画Word出力",
      "所轄消防本部の様式に準拠",
      "別表すべて出力",
      "記入ガイドPDF付き",
    ],
    missing: ["内容チェック"],
  },
  {
    id: "premium",
    name: "プレミアム",
    price: 29800,
    priceLabel: "¥29,800",
    description: "チェック＋修正付き",
    features: [
      "消防計画Word出力",
      "所轄消防本部の様式に準拠",
      "別表すべて出力",
      "記入ガイドPDF付き",
      "元消防士による内容チェック",
      "修正1回対応",
    ],
    missing: [],
  },
];

export function getSpotPlan(id: string): SpotPlan | undefined {
  return SPOT_PLANS.find((p) => p.id === id);
}

export function isSpotPlanId(id: string): id is SpotPlanId {
  return (SPOT_PLAN_IDS as readonly string[]).includes(id);
}
