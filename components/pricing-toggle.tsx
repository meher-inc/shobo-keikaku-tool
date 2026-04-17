import { cn } from "@/lib/utils"

interface PricingToggleProps {
  isYearly: boolean
  setIsYearly: (value: boolean) => void
}

export function PricingToggle({ isYearly, setIsYearly }: PricingToggleProps) {
  return (
    <div className="flex justify-center bg-white pb-12">
      <div className="inline-flex rounded-full bg-gray-100 p-1">
        <button
          onClick={() => setIsYearly(false)}
          className={cn(
            "rounded-full px-5 py-2 text-sm font-medium transition-all",
            !isYearly
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          )}
        >
          月額
        </button>
        <button
          onClick={() => setIsYearly(true)}
          className={cn(
            "rounded-full px-5 py-2 text-sm font-medium transition-all",
            isYearly
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          )}
        >
          年額 <span className="text-red-600">2ヶ月分お得</span>
        </button>
      </div>
    </div>
  )
}
