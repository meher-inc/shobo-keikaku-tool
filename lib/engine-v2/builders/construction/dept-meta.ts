import type { V2Pack } from "../../adapters/generate-plan";

/**
 * 工事中の消防計画（工事中の防火対象物用）の所轄消防本部メタデータ。
 *
 * 工事中の消防計画は、通常の消防計画と異なり全国で公表様式が揃って
 * いないため、計画本体は共通テンプレート（construction.full.json）を
 * 使い、所轄表示と届出案内のみを都市別に差し替える方式をとる。
 *
 * city-dispatch.ts が返す V2Pack をキーに、表紙・提出案内で使う
 * 所轄名を引く。テンプレート未対応エリア（pack="full"）は所轄名
 * なしの標準表記になる。
 *
 * 注意: 届出様式名・条例の条番号は消防本部ごとに異なり、一次資料で
 * 網羅確認できていないため、生成文書には条番号を記載しない（所轄
 * 確認を促す文言に留める）。
 */

export type ConstructionDeptMeta = {
  /** 表紙・提出案内に表示する所轄消防本部名。 */
  deptName: string;
  /**
   * 工事中の消防計画の届出様式が公表されていることを確認済みの
   * 消防本部のみ true（例: 東京消防庁「工事中の消防計画作成（変更）
   * 届出書」、仙台市）。提出案内の文言を切り替える。
   */
  hasDedicatedForm?: boolean;
};

const DEPT_META: Partial<Record<V2Pack, ConstructionDeptMeta>> = {
  "tokyo-full": { deptName: "東京消防庁", hasDedicatedForm: true },
  full: { deptName: "" }, // 標準様式（所轄未対応エリア）
  "osaka-full": { deptName: "大阪市消防局" },
  "yokohama-full": { deptName: "横浜市消防局" },
  "fukuoka-full": { deptName: "福岡市消防局" },
  "nagoya-full": { deptName: "名古屋市消防局" },
  "sapporo-full": { deptName: "札幌市消防局" },
  "kawasaki-full": { deptName: "川崎市消防局" },
  "kobe-full": { deptName: "神戸市消防局" },
  "saitama-full": { deptName: "さいたま市消防局" },
  "sakai-full": { deptName: "堺市消防局", hasDedicatedForm: true },
  "hiroshima-full": { deptName: "広島市消防局" },
  "sendai-full": { deptName: "仙台市消防局", hasDedicatedForm: true },
  "chiba-full": { deptName: "千葉市消防局" },
  "kitakyushu-full": { deptName: "北九州市消防局" },
  "niigata-full": { deptName: "新潟市消防局" },
  "kumamoto-full": { deptName: "熊本市消防局" },
  "sagamihara-full": { deptName: "相模原市消防局" },
  "shizuoka-full": { deptName: "静岡市消防局" },
  "okayama-full": { deptName: "岡山市消防局" },
};

export function constructionDeptMeta(pack: V2Pack): ConstructionDeptMeta {
  return DEPT_META[pack] ?? { deptName: "" };
}
