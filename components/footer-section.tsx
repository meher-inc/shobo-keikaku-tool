import { Button } from "@/components/ui/button"

export function FooterSection() {
  return (
    <section className="bg-gray-50 px-4 py-20 md:px-8">
      <div className="mx-auto max-w-3xl rounded-2xl bg-blue-50 p-8 text-center">
        <h2 className="mb-3 text-xl font-bold text-gray-900">
          既に単発でご購入済みのお客様へ
        </h2>
        <p className="mb-6 text-sm text-gray-600">
          特別な移行プランをご用意しています。
          <br />
          お問い合わせ先: support@todokede.jp
        </p>
        <Button variant="outline" asChild>
          <a href="mailto:support@todokede.jp?subject=移行プランについて">
            移行について問い合わせる
          </a>
        </Button>
      </div>

      <footer className="mx-auto mt-16 max-w-6xl text-center">
        <div className="mb-4 flex items-center justify-center gap-0.5">
          <span className="text-lg font-bold text-red-600">トドケデ</span>
          <span className="text-lg font-bold text-gray-800">消防計画</span>
        </div>
        <p className="text-sm text-gray-500">
          © 2026 トドケデ消防計画. All rights reserved.
        </p>
      </footer>
    </section>
  )
}
