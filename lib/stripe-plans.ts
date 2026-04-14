export type SubscriptionPlanId = 'minimum' | 'standard';
export type BillingCycle = 'monthly' | 'yearly';
export type SubscriptionStatus =
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'paused';

export interface PlanDefinition {
  id: SubscriptionPlanId;
  name: string;
  priceIds: {
    monthly: string;
    yearly: string;
  };
  amount: {
    monthly: number;
    yearly: number;
  };
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlanId, PlanDefinition> = {
  minimum: {
    id: 'minimum',
    name: 'ミニマム',
    priceIds: {
      monthly: process.env.STRIPE_PRICE_MINIMUM_MONTHLY!,
      yearly: process.env.STRIPE_PRICE_MINIMUM_YEARLY!,
    },
    amount: { monthly: 4980, yearly: 49800 },
  },
  standard: {
    id: 'standard',
    name: 'スタンダード',
    priceIds: {
      monthly: process.env.STRIPE_PRICE_STANDARD_MONTHLY!,
      yearly: process.env.STRIPE_PRICE_STANDARD_YEARLY!,
    },
    amount: { monthly: 9800, yearly: 98000 },
  },
};

export function getPriceId(planId: SubscriptionPlanId, cycle: BillingCycle): string {
  const priceId = SUBSCRIPTION_PLANS[planId]?.priceIds[cycle];
  if (!priceId) {
    throw new Error(`Invalid plan/cycle combo: ${planId}/${cycle}`);
  }
  return priceId;
}

export function getPlanFromPriceId(priceId: string): { planId: SubscriptionPlanId; cycle: BillingCycle } | null {
  for (const plan of Object.values(SUBSCRIPTION_PLANS)) {
    if (plan.priceIds.monthly === priceId) return { planId: plan.id, cycle: 'monthly' };
    if (plan.priceIds.yearly === priceId) return { planId: plan.id, cycle: 'yearly' };
  }
  return null;
}
