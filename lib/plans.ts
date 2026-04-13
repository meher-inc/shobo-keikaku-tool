/**
 * Plan definitions — Single Source of Truth for subscription plans.
 *
 * All UI, checkout, and webhook code should reference this module
 * instead of hardcoding plan names, prices, or Stripe price IDs.
 */

export const PLAN_IDS = ["minimum", "standard"] as const;
export type PlanId = (typeof PLAN_IDS)[number];

export const BILLING_CYCLES = ["monthly", "yearly"] as const;
export type BillingCycle = (typeof BILLING_CYCLES)[number];

export interface Plan {
  id: PlanId;
  name: string;
  description: string;
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
