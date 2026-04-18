export function HeroSection() {
  return (
    <section className="bg-white px-4 py-20 md:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-6 inline-flex items-center rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-[#E8332A]">
          先行予約受付中・2026年5月サービス開始予定
        </div>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
          月額プランで、継続的に消防安全を管理
        </h1>
        <p className="mt-6 text-pretty text-base leading-relaxed text-gray-600 md:text-lg">
          消防計画の作成から、年次更新・訓練記録・法改正追従まで。
          <br className="hidden md:block" />
          一度作って終わりではなく、ずっと使える仕組みに。
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-gray-600">
          本サービスは2026年5月の正式提供開始を予定しております。サービス開始日より前にご解約のお申し出をいただいた場合、決済済み料金を全額返金いたします。
        </p>
      </div>
    </section>
  )
}
