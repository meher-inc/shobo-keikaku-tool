/**
 * 更新情報（お知らせ）— Single Source of Truth。
 *
 * LP の「更新情報」セクション（components/marketing-sections.tsx）が
 * この配列を新しい順に表示する。新しいお知らせは配列の先頭に追加する。
 */

export interface UpdateNote {
  /** 公開日（YYYY-MM-DD）。表示と並び順に使用。 */
  date: string;
  /** 区分ラベル（例: 対応拡大 / 機能改善 / メンテナンス）。 */
  tag: string;
  title: string;
  body: string;
}

export const UPDATES: UpdateNote[] = [
  {
    date: "2026-06-16",
    tag: "対応拡大",
    title: "政令指定都市の対応消防本部を拡大しました",
    body:
      "札幌市・川崎市・神戸市・さいたま市・広島市・仙台市・千葉市・北九州市・新潟市・熊本市・相模原市・静岡市の各消防本部の様式に新たに対応しました。これにより対応消防本部は計18本部になりました。該当エリアの建物は、所轄消防本部の様式に準拠した消防計画をそのまま出力できます。",
  },
];

/** 今回の拡大で新たに対応した消防本部（LPで「NEW」表示に使用）。 */
export const NEWLY_ADDED_DEPTS: ReadonlySet<string> = new Set([
  "札幌市消防局",
  "川崎市消防局",
  "神戸市消防局",
  "さいたま市消防局",
  "広島市消防局",
  "仙台市消防局",
  "千葉市消防局",
  "北九州市消防局",
  "新潟市消防局",
  "熊本市消防局",
  "相模原市消防局",
  "静岡市消防局",
]);

/** "2026-06-16" → "2026年6月16日"。 */
export function formatUpdateDate(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return iso;
  return `${m[1]}年${Number(m[2])}月${Number(m[3])}日`;
}
