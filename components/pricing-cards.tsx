"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { PLANS } from "@/lib/plans"

interface PricingCardsProps {
  isYearly: boolean
}

// Feature lists per plan (richer descriptions for the pricing page)
const featureLists: Record<string, { text: string; isNew: boolean }[]> = {
  minimum: [
    { text: "消防計画の作成・出力（1事業所）", isNew: false },
    { text: "年次レビュー機能", isNew: false },
    { text: "法改正通知", isNew: false },
    { text: "基本テンプレート", isNew: false },
  ],
  standard: [
    { text: "ミニマムの全機能", isNew: false },
    { text: "訓練計画・記録管理", isNew: false },
    { text: "定期点検・訓練リマインド", isNew: false },
    { text: "変更届の自動生成", isNew: false },
    { text: "PDF一括出力", isNew: false },
  ],
  pro: [
    { text: "スタンダードの全機能", isNew: false },
    { text: "複数事業所の一元管理（最大10事業所）", isNew: false },
    { text: "防火点検記録の管理", isNew: false },
    { text: "AI自動生成機能", isNew: true },
    { text: "ボウテンナビ連携", isNew: false },
    { text: "専用サポート窓口", isNew: false },
  ],
}

function formatPrice(price: number): string {
  return `¥${price.toLocaleString()}`
}

export function PricingCards({ isYearly }: PricingCardsProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const handleSubscribe = async (planId: string) => {
    setLoadingPlan(planId)
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          billingCycle: isYearly ? "yearly" : "monthly",
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        console.error("No URL returned", data)
        alert("決済ページへの遷移に失敗しました。サポートにご連絡ください。")
      }
    } catch (err) {
      console.error(err)
      alert("エラーが発生しました。")
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <section className="bg-white px-4 pb-20 md:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
        {PLANS.map((plan) => {
          const price = isYearly ? plan.prices.yearly : plan.prices.monthly
          const features = featureLists[plan.id] || []
          const isRecommended = plan.recommended === true
          const isLoading = loadingPlan === plan.id

          return (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-white p-6",
                isRecommended
                  ? "border-red-500 pt-10 shadow-lg md:scale-105"
                  : "border-gray-200"
              )}
            >
              {isRecommended && (
                <div className="absolute -top-3.5 left-1/2 z-10 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-red-600 px-4 py-1.5 text-sm font-medium text-white">
                    ★ 最も選ばれているプラン
                  </span>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{plan.target}</p>
              </div>

              <div className="mb-6">
                <span
                  className={cn(
                    "text-3xl font-bold",
                    isRecommended ? "text-red-600" : "text-gray-900"
                  )}
                >
                  {formatPrice(price)}
                </span>
                <span className="text-sm text-gray-500">
                  /{isYearly ? "年" : "月"} (税込)
                </span>
                {isYearly && (
                  <p className="mt-1 text-xs text-gray-500">
                    月あたり {formatPrice(Math.round(plan.prices.yearly / 12))}
                  </p>
                )}
              </div>

              <Button
                variant={isRecommended ? "default" : "outline"}
                className={cn(
                  "mb-6 w-full",
                  isRecommended && "bg-red-600 hover:bg-red-700"
                )}
                disabled={loadingPlan !== null}
                onClick={() => handleSubscribe(plan.id)}
              >
                {isLoading ? "処理中..." : `${plan.name}で始める`}
              </Button>

              <ul className="flex-1 space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                    <span className="text-sm text-gray-600">
                      {feature.text}
                      {feature.isNew && (
                        <span className="ml-1.5 inline-flex rounded bg-orange-100 px-1.5 py-0.5 text-xs font-medium text-orange-700">
                          NEW
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </section>
  )
}
