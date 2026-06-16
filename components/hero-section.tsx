export function HeroSection() {
  return (
    <section className="bg-white px-4 py-20 md:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-6 inline-flex items-center rounded-full bg-[#EEF4FA] px-4 py-2 text-sm font-semibold text-[#2E5F9E]">
          政令指定都市の様式に順次対応
        </div>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
          消防計画を、必要なときだけ買い切りで
        </h1>
        <p className="mt-6 text-pretty text-base leading-relaxed text-gray-600 md:text-lg">
          建物情報を入力するだけ。所轄消防本部の様式に準拠した消防計画をWordで生成します。
          <br className="hidden md:block" />
          月額・更新料はかかりません。必要な分だけ、その都度お支払いいただけます。
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-gray-600">
          料金は1件ごとの都度払い（買い切り）です。生成内容に不備があった場合は、内容を確認のうえ返金または再発行で対応いたします。
        </p>
      </div>
    </section>
  )
}
