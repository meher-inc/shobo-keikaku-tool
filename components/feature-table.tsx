import { Check, Minus } from "lucide-react"

const featureGroups = [
  {
    name: "基本機能",
    features: [
      { name: "消防計画の作成・出力", minimum: true, standard: true, pro: true },
      { name: "年次レビュー機能", minimum: true, standard: true, pro: true },
      { name: "法改正通知", minimum: true, standard: true, pro: true },
      { name: "基本テンプレート", minimum: true, standard: true, pro: true },
    ],
  },
  {
    name: "訓練・点検管理",
    features: [
      { name: "訓練計画・記録管理", minimum: false, standard: true, pro: true },
      { name: "定期点検リマインド", minimum: false, standard: true, pro: true },
      { name: "訓練リマインド", minimum: false, standard: true, pro: true },
      { name: "防火点検記録の管理", minimum: false, standard: false, pro: true },
    ],
  },
  {
    name: "書類出力・変更届",
    features: [
      { name: "PDF出力", minimum: true, standard: true, pro: true },
      { name: "PDF一括出力", minimum: false, standard: true, pro: true },
      { name: "変更届の自動生成", minimum: false, standard: true, pro: true },
    ],
  },
  {
    name: "高度な機能",
    features: [
      { name: "複数事業所の一元管理", minimum: false, standard: false, pro: true },
      { name: "AI自動生成機能", minimum: false, standard: false, pro: true },
      { name: "ボウテンナビ連携", minimum: false, standard: false, pro: true },
      { name: "専用サポート窓口", minimum: false, standard: false, pro: true },
    ],
  },
]

function FeatureCheck({ included }: { included: boolean }) {
  if (included) {
    return <Check className="mx-auto h-5 w-5 text-red-600" />
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
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  機能
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                  ミニマム
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-red-600">
                  スタンダード
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                  プロ
                </th>
              </tr>
            </thead>
            <tbody>
              {featureGroups.map((group) => (
                <>
                  <tr key={group.name} className="bg-gray-50">
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
                        <FeatureCheck included={feature.minimum} />
                      </td>
                      <td className="bg-red-50/50 px-6 py-3">
                        <FeatureCheck included={feature.standard} />
                      </td>
                      <td className="px-6 py-3">
                        <FeatureCheck included={feature.pro} />
                      </td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
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
                      <div className="flex items-center gap-1">
                        {feature.minimum ? (
                          <Check className="h-4 w-4 text-red-600" />
                        ) : (
                          <Minus className="h-4 w-4 text-gray-300" />
                        )}
                        <span className="text-gray-500">ミニマム</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {feature.standard ? (
                          <Check className="h-4 w-4 text-red-600" />
                        ) : (
                          <Minus className="h-4 w-4 text-gray-300" />
                        )}
                        <span className="text-gray-500">スタンダード</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {feature.pro ? (
                          <Check className="h-4 w-4 text-red-600" />
                        ) : (
                          <Minus className="h-4 w-4 text-gray-300" />
                        )}
                        <span className="text-gray-500">プロ</span>
                      </div>
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
