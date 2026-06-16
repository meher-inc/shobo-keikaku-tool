import { Button } from "@/components/ui/button"

export function FooterSection() {
  return (
    <section className="bg-gray-50 px-4 py-20 md:px-8">
      <div className="mx-auto max-w-3xl rounded-2xl bg-[#EEF4FA] p-8 text-center">
        <h2 className="mb-3 text-xl font-bold text-gray-900">
          まずは消防計画を作成してみる
        </h2>
        <p className="mb-6 text-sm text-gray-600">
          建物情報を入力するだけ。料金は1件ごとの都度払い（買い切り）です。
          <br />
          ご不明な点は plan@todokede.jp までお問い合わせください。
        </p>
        <Button asChild className="bg-[#2E5F9E] text-white hover:bg-[#234B7D]">
          <a href="/">消防計画を作成する</a>
        </Button>
      </div>

      <footer className="mx-auto mt-16 max-w-6xl text-center">
        <div className="mb-4 flex items-center justify-center gap-0.5">
          <span className="text-lg font-bold text-[#2E5F9E]">トドケデ</span>
          <span className="text-lg font-bold text-gray-800">消防計画</span>
        </div>
        <p className="text-sm text-gray-500">
          © 2026 トドケデ消防計画. All rights reserved.
        </p>
      </footer>
    </section>
  )
}
