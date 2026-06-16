import { Check, Minus } from "lucide-react"

type PlanKey = "light" | "standard" | "premium"

const planLabels: { key: PlanKey; label: string; highlight?: boolean }[] = [
  { key: "light", label: "ライト" },
  { key: "standard", label: "スタンダード", highlight: true },
  { key: "premium", label: "プレミアム" },
]

const featureGroups: {
  name: string
  features: { name: string; light: boolean; standard: boolean; premium: boolean }[]
}[] = [
  {
    name: "消防計画の作成",
    features: [
      { name: "消防計画Word出力", light: true, standard: true, premium: true },
      { name: "所轄消防本部の様式に準拠", light: true, standard: true, premium: true },
    ],
  },
  {
    name: "別表・ガイド",
    features: [
      { name: "別表すべて出力", light: false, standard: true, premium: true },
      { name: "記入ガイドPDF付き", light: false, standard: true, premium: true },
    ],
  },
  {
    name: "内容チェック",
    features: [
      { name: "元消防士による内容チェック", light: false, standard: false, premium: true },
      { name: "修正1回対応", light: false, standard: false, premium: true },
    ],
  },
]

function FeatureCheck({ included }: { included: boolean }) {
  if (included) {
    return <Check className="mx-auto h-5 w-5 text-[#2E5F9E]" />
  }
  return <Minus className="mx-auto h-5 w-5 text-gray-300" />
}

export function FeatureTable() {
  return (
    <section className="bg-gray-50 px-4 py-20 md:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-12 text-center text-2xl font-bold text-gray-900">
          プラン比較
        </h2>

        {/* Desktop Table */}
        <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white md:block">
          <table className="w-full" style={{ tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: "40%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "20%" }} />
            </colgroup>
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  機能
                </th>
                {planLabels.map((p) => (
                  <th
                    key={p.key}
                    className={`px-6 py-4 text-center text-sm font-semibold ${
                      p.highlight ? "text-[#2E5F9E]" : "text-gray-900"
                    }`}
                  >
                    {p.label}
                  </th>
                ))}
              </tr>
            </thead>
            {featureGroups.map((group) => (
              <tbody key={group.name}>
                <tr className="bg-gray-50">
                  <td
                    colSpan={4}
                    className="px-6 py-3 text-sm font-semibold text-gray-700"
                  >
                    {group.name}
                  </td>
                </tr>
                {group.features.map((feature) => (
                  <tr key={feature.name} className="border-t border-gray-100">
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {feature.name}
                    </td>
                    <td className="px-6 py-3">
                      <FeatureCheck included={feature.light} />
                    </td>
                    <td className="bg-[#EEF4FA]/50 px-6 py-3">
                      <FeatureCheck included={feature.standard} />
                    </td>
                    <td className="px-6 py-3">
                      <FeatureCheck included={feature.premium} />
                    </td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="space-y-6 md:hidden">
          {featureGroups.map((group) => (
            <div
              key={group.name}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white"
            >
              <div className="bg-gray-50 px-4 py-3">
                <h3 className="font-semibold text-gray-900">{group.name}</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {group.features.map((feature) => (
                  <div key={feature.name} className="px-4 py-3">
                    <p className="mb-2 text-sm font-medium text-gray-900">
                      {feature.name}
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {planLabels.map((p) => (
                        <div key={p.key} className="flex items-center gap-1">
                          {feature[p.key] ? (
                            <Check className="h-4 w-4 text-[#2E5F9E]" />
                          ) : (
                            <Minus className="h-4 w-4 text-gray-300" />
                          )}
                          <span className="text-gray-500">{p.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
