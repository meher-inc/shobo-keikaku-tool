/**
 * Plan definitions — Single Source of Truth for subscription plans.
 *
 * All UI, checkout, and webhook code should reference this module
 * instead of hardcoding plan names, prices, or Stripe price IDs.
 */

export const PLAN_IDS = ["minimum", "standard", "pro"] as const;
export type PlanId = (typeof PLAN_IDS)[number];

/** Alias kept in sync with PlanId for clarity in subscription-specific code. */
export type SubscriptionPlanId = PlanId;

export type SubscriptionStatus =
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'paused';

export const BILLING_CYCLES = ["monthly", "yearly"] as const;
export type BillingCycle = (typeof BILLING_CYCLES)[number];

export interface Plan {
  id: PlanId;
  name: string;
  description: string;
  target: string;
  recommended?: boolean;
  prices: {
    monthly: number;
    yearly: number;
  };
  priceIds: {
    monthly: string;
    yearly: string;
  };
  features: string[];
}

export const PLANS: Plan[] = [
  {
    id: "minimum",
    name: "ミニマム",
    description: "消防計画の自動生成に特化したエントリープラン",
    target: "単一事業所・個人事業主の方に",
    prices: {
      monthly: 4980,
      yearly: 49800,
    },
    priceIds: {
      monthly: process.env.STRIPE_PRICE_MINIMUM_MONTHLY ?? "",
      yearly: process.env.STRIPE_PRICE_MINIMUM_YEARLY ?? "",
    },
    features: [
      "消防計画書（Word形式）の自動生成",
      "年次更新ドラフト機能",
      "メールサポート",
    ],
  },
  {
    id: "standard",
    name: "スタンダード",
    description: "別表・ガイド・通知機能をフル装備した推奨プラン",
    target: "中規模事業所・介護施設・保育園の方に",
    recommended: true,
    prices: {
      monthly: 9800,
      yearly: 98000,
    },
    priceIds: {
      monthly: process.env.STRIPE_PRICE_STANDARD_MONTHLY ?? "",
      yearly: process.env.STRIPE_PRICE_STANDARD_YEARLY ?? "",
    },
    features: [
      "ミニマムの全機能",
      "別表9種の自動生成",
      "提出用ガイドPDF",
      "法改正フラグ通知",
      "点検・訓練リマインド",
    ],
  },
  {
    id: "pro",
    name: "プロ",
    description: "複数事業所・チェーン店・管理会社向けの上位プラン",
    target: "複数事業所・チェーン店・管理会社の方に",
    prices: {
      monthly: 19800,
      yearly: 198000,
    },
    priceIds: {
      monthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? "",
      yearly: process.env.STRIPE_PRICE_PRO_YEARLY ?? "",
    },
    features: [
      "スタンダードの全機能",
      "複数事業所の一元管理（最大10事業所）",
      "防火点検記録の管理",
      "AI自動生成機能",
      "ボウテンナビ連携（点検業者マッチング優先枠）",
      "専用サポート窓口",
    ],
  },
];

/**
 * Look up the Stripe Price ID for a given plan + billing cycle.
 * Throws if the plan ID is not found.
 */
export function getPriceId(planId: PlanId, cycle: BillingCycle): string {
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) throw new Error(`Unknown plan: ${planId}`);
  const priceId = plan.priceIds[cycle];
  if (!priceId) throw new Error(`No price ID for ${planId}/${cycle}`);
  return priceId;
}

/**
 * Reverse-lookup: find the plan + billing cycle for a Stripe Price ID.
 * Used by the webhook to resolve subscription metadata.
 * Returns null if the price ID doesn't match any known plan.
 */
export function getPlanByPriceId(
  priceId: string
): { plan: Plan; cycle: BillingCycle } | null {
  for (const plan of PLANS) {
    if (plan.priceIds.monthly === priceId) {
      return { plan, cycle: "monthly" };
    }
    if (plan.priceIds.yearly === priceId) {
      return { plan, cycle: "yearly" };
    }
  }
  return null;
}

/**
 * Reverse-lookup returning planId string + cycle (lighter than getPlanByPriceId).
 * Used by lib/subscriptions.ts for DB upsert.
 */
export function getPlanFromPriceId(
  priceId: string
): { planId: PlanId; cycle: BillingCycle } | null {
  const result = getPlanByPriceId(priceId);
  if (!result) return null;
  return { planId: result.plan.id, cycle: result.cycle };
}
