import type { V2Pack } from "./adapters/generate-plan";

/**
 * フォーム入力（都道府県・市区町村）から、自動選択する TemplatePack を決める。
 *
 * 以前は app/api/generate-plan/route.ts 内のインライン三項演算（旧 route docstring の
 * `TODO(Phase 2B): selectPackByPrefecture() 関数の抽出`）にロジックが埋まっており、
 * 都市追加のたびに肥大化していた。ここへ集約してテスト可能にした。
 *
 * 判定方針:
 *   - 政令指定都市は「市」単位で判定する。app/page.tsx の deptName（所轄表示ラベル）
 *     および FAQ の「正式対応」リストと一致させ、生成物と画面表示の食い違いを防ぐ。
 *   - 東京都のみ都道府県単位（東京消防庁が都内をほぼ一円管轄するため）。
 *   - 対応リスト外（浜松市など未対応の市を含む）は "full"（京都ベースの標準様式）へ
 *     フォールバックする。これは画面ラベル「標準様式」と一致する。
 *
 * 同一県に複数の対応市がある場合（大阪＝大阪市/堺、神奈川＝横浜/川崎/相模原、
 * 福岡＝福岡市/北九州）は、すべて「市」で判定しているため評価順に依存しない。
 *
 * 注意: ここを変更したら lib/engine-v2/tests/city-dispatch.test.ts と
 *       app/page.tsx の deptName を必ず同期させること。
 */

/** auto-select で返しうる pack（"sample" は dev 専用なので除外）。 */
export type AutoPack = Exclude<V2Pack, "sample">;

export function selectPackByLocation(prefecture: string, city: string): AutoPack {
  const pref = prefecture || "";
  const c = city || "";

  // 東京都は東京消防庁が一円管轄のため都道府県で判定。
  if (pref === "東京都") return "tokyo-full";

  // 以下は政令市を「市」単位で判定（画面の所轄ラベルと一致）。
  if (pref === "大阪府" && c === "堺市") return "sakai-full";
  if (c === "大阪市") return "osaka-full";
  if (c === "横浜市") return "yokohama-full";
  if (pref === "神奈川県" && c === "川崎市") return "kawasaki-full";
  if (pref === "神奈川県" && c === "相模原市") return "sagamihara-full";
  if (c === "名古屋市") return "nagoya-full";
  if (c === "福岡市") return "fukuoka-full";
  if (pref === "福岡県" && c === "北九州市") return "kitakyushu-full";
  if (pref === "北海道" && c === "札幌市") return "sapporo-full";
  if (pref === "兵庫県" && c === "神戸市") return "kobe-full";
  if (pref === "埼玉県" && c === "さいたま市") return "saitama-full";
  if (pref === "広島県" && c === "広島市") return "hiroshima-full";
  if (pref === "宮城県" && c === "仙台市") return "sendai-full";
  if (pref === "千葉県" && c === "千葉市") return "chiba-full";
  if (pref === "新潟県" && c === "新潟市") return "niigata-full";
  if (pref === "熊本県" && c === "熊本市") return "kumamoto-full";
  if (pref === "静岡県" && c === "静岡市") return "shizuoka-full";
  if (pref === "岡山県" && c === "岡山市") return "okayama-full";

  // 京都市・対応エリア外は標準様式（京都ベース）。
  return "full";
}
