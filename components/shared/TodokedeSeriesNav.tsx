/* ============================================================================
 * トドケデシリーズ 接続コンポーネント（全プロダクト共通フッターバンド）
 *
 * 目的：各プロダクト（plan / care / koushin …）から、トドケデOS全体へ接続する。
 *   - シリーズ回遊：サービス一覧＋全サービスへのリンク
 *   - ハブ集約：更新管理（全プロダクトの期限を建物単位でまとめる）
 *   - エスカレーション：個別案件はトドケデコンサルティングへ
 *
 * 配布方法：このファイルを各プロダクトのリポジトリ（components/ 等）にコピーし、
 *   フッター直前に <TodokedeSeriesNav source="plan" currentId="shobo-keikaku" /> のように設置する。
 *   - source     : UTM の utm_source（流入元プロダクトの識別子。例 "plan"）
 *   - currentId  : 表示中プロダクトのid（シリーズ一覧から自分を除外。任意）
 *
 * 依存ゼロ（このrepoの data.ts / lib / テーマトークンに依存しない）。
 *   配色は明示HEX＋標準Tailwindのみ。URLは絶対パス。どのプロダクトでもそのまま動く。
 *   ※ 一部サブドメインは公開準備中（DNS反映後に有効）。
 * ========================================================================== */

const SERVICES_LIST_URL = "https://services.todokede.jp/";
const KOSHIN_URL = "https://koushin.todokede.jp/"; // 更新管理ハブ
const CONSULT_CONTACT_URL = "https://services.todokede.jp/#contact"; // 個別相談（コンサルティング）

const SERVICES: { id: string; name: string; url: string }[] = [
  { id: "shobo-keikaku", name: "消防計画", url: "https://plan.todokede.jp/" },
  { id: "shobo-shorui", name: "消防書類作成", url: "https://docs.todokede.jp/" },
  { id: "shobo-daiko", name: "消防書類代行", url: "https://daikou.todokede.jp/" },
  { id: "bouka-kanri", name: "防火管理", url: "https://bouka.todokede.jp/" },
  { id: "kunren", name: "訓練支援", url: "https://kunren.todokede.jp/" },
  { id: "setsubi-tenken", name: "消防設備点検", url: "https://tenken.todokede.jp/" },
  { id: "koshin-kanri", name: "更新管理", url: "https://koushin.todokede.jp/" },
  { id: "kaigo", name: "トドケデ介護", url: "https://care.todokede.jp/" },
  { id: "kikenbutsu", name: "危険物", url: "https://kikenbutsu.todokede.jp/" },
  { id: "bcp", name: "BCP", url: "https://bcp.todokede.jp/" },
];

function withUtm(url: string, source: string, campaign: string) {
  const [path, hash] = url.split("#");
  const sep = path.includes("?") ? "&" : "?";
  const q = `utm_source=${encodeURIComponent(source)}&utm_medium=series-nav&utm_campaign=${campaign}`;
  return `${path}${sep}${q}${hash ? `#${hash}` : ""}`;
}

function Mark() {
  return (
    <svg viewBox="0 0 40 40" width="26" height="26" aria-hidden>
      <rect x="16" y="6" width="16" height="23" rx="2" fill="#8FB3DC" />
      <rect x="9" y="11" width="16" height="23" rx="2" fill="#2E5F9E" />
    </svg>
  );
}

function ArrowUR() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden>
      <path d="M5 11L11 5M6.5 5H11V9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function TodokedeSeriesNav({
  source = "todokede-product",
  currentId,
}: {
  source?: string;
  currentId?: string;
}) {
  const cards = [
    {
      title: "サービスを探す",
      body: "消防・防災の10サービスから、必要なものを無料診断で。",
      href: withUtm(SERVICES_LIST_URL, source, "series-list"),
    },
    {
      title: "期限をまとめて管理",
      body: "点検・届出・更新を、建物単位でひとつに（更新管理）。",
      href: withUtm(KOSHIN_URL, source, "series-hub"),
    },
    {
      title: "個別案件を相談",
      body: "自動化で難しいケースは、トドケデコンサルティングが対応。",
      href: withUtm(CONSULT_CONTACT_URL, source, "series-consulting"),
    },
  ];

  const others = SERVICES.filter((s) => s.id !== currentId);

  return (
    <section className="bg-[#152632] px-5 py-14 text-white sm:px-8 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex items-center gap-2.5">
          <Mark />
          <span className="text-[13px] font-bold tracking-[0.14em] text-white/80">トドケデシリーズ</span>
        </div>
        <h2 className="mt-5 max-w-[760px] text-[24px] font-bold leading-[1.45] sm:text-[32px]">
          消防・防災の手続きを、ひとつに。
        </h2>
        <p className="mt-4 max-w-[640px] text-[14px] font-bold leading-[1.95] text-white/70">
          トドケデは、新設から運用・点検・更新まで一気通貫で支えるサービス群です。必要なサービスへ、ここから。
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {cards.map((c) => (
            <a
              key={c.title}
              href={c.href}
              className="group flex flex-col rounded-2xl border border-white/14 bg-white/[0.06] p-6 transition-colors hover:bg-white/10"
            >
              <span className="flex items-center gap-1.5 text-[15px] font-bold">
                {c.title}
                <ArrowUR />
              </span>
              <span className="mt-2.5 text-[13px] font-bold leading-[1.85] text-white/70">{c.body}</span>
            </a>
          ))}
        </div>

        <div className="mt-10 border-t border-white/12 pt-6">
          <p className="text-[12px] font-bold text-white/50">サービス一覧</p>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2.5">
            {others.map((s) => (
              <li key={s.id}>
                <a
                  href={withUtm(s.url, source, "series-item")}
                  className="text-[13px] font-bold text-white/82 hover:text-white"
                >
                  {s.name}
                </a>
              </li>
            ))}
            <li>
              <a
                href={withUtm(SERVICES_LIST_URL, source, "series-all")}
                className="inline-flex items-center gap-1 text-[13px] font-bold text-white/82 hover:text-white"
              >
                すべて見る
                <ArrowUR />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
