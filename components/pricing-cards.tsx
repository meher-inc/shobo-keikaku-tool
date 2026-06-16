"use client"

import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SPOT_PLANS } from "@/lib/spot-plans"

export function PricingCards() {
  return (
    <section className="bg-white px-4 pb-20 md:px-8">
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
        {SPOT_PLANS.map((plan) => {
          const isRecommended = plan.recommended === true

          return (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-white p-6",
                isRecommended
                  ? "border-[#2E5F9E] pt-10 shadow-lg"
                  : "border-gray-200"
              )}
            >
              {isRecommended && (
                <div className="absolute -top-3.5 left-1/2 z-10 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-[#2E5F9E] px-4 py-1.5 text-sm font-medium text-white">
                    ★ 最も選ばれているプラン
                  </span>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span
                  className={cn(
                    "text-3xl font-bold",
                    isRecommended ? "text-[#2E5F9E]" : "text-gray-900"
                  )}
                >
                  {plan.priceLabel}
                </span>
                <span className="text-sm text-gray-500"> /件 (税込)</span>
                <p className="mt-1 text-xs text-gray-500">
                  都度払い・買い切り（月額・更新料なし）
                </p>
              </div>

              <Button
                variant={isRecommended ? "default" : "outline"}
                className={cn(
                  "mb-6 w-full",
                  isRecommended && "bg-[#2E5F9E] text-white hover:bg-[#234B7D]"
                )}
                asChild
              >
                <a href={`/?plan=${plan.id}`}>{plan.name}で作成する</a>
              </Button>

              <ul className="flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#2E5F9E]" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
                {plan.missing.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-gray-300" />
                    <span className="text-sm text-gray-400 line-through">{item}</span>
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
