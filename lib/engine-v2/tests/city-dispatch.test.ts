import { describe, it, expect } from "vitest";
import { selectPackByLocation, type AutoPack } from "../city-dispatch";

/**
 * 都道府県×市 → pack の自動選択ルーティング回帰テスト。
 *
 * 目的:
 *   1. 各対応都市がそれぞれ正しい専用 pack を引くこと。
 *   2. 未対応の市（浜松など）が標準様式 "full" にフォールバックし、
 *      その県の代表都市の様式に誤って吸われないこと。
 *   3. app/page.tsx の deptName（所轄ラベル）と矛盾しないこと。
 */

describe("selectPackByLocation — 対応都市は専用packを引く", () => {
  const cases: Array<[string, string, AutoPack]> = [
    ["東京都", "千代田区", "tokyo-full"], // 東京は都道府県で判定
    ["東京都", "八王子市", "tokyo-full"],
    ["大阪府", "大阪市", "osaka-full"],
    ["大阪府", "堺市", "sakai-full"], // 同県に大阪市があるが市で判定
    ["神奈川県", "横浜市", "yokohama-full"],
    ["神奈川県", "川崎市", "kawasaki-full"],
    ["神奈川県", "相模原市", "sagamihara-full"],
    ["愛知県", "名古屋市", "nagoya-full"],
    ["福岡県", "福岡市", "fukuoka-full"],
    ["福岡県", "北九州市", "kitakyushu-full"],
    ["北海道", "札幌市", "sapporo-full"],
    ["兵庫県", "神戸市", "kobe-full"],
    ["埼玉県", "さいたま市", "saitama-full"],
    ["広島県", "広島市", "hiroshima-full"],
    ["宮城県", "仙台市", "sendai-full"],
    ["千葉県", "千葉市", "chiba-full"],
    ["新潟県", "新潟市", "niigata-full"],
    ["熊本県", "熊本市", "kumamoto-full"],
    ["静岡県", "静岡市", "shizuoka-full"],
    ["岡山県", "岡山市", "okayama-full"],
  ];
  it.each(cases)("%s %s → %s", (pref, city, expected) => {
    expect(selectPackByLocation(pref, city)).toBe(expected);
  });
});

describe("selectPackByLocation — 未対応都市は標準様式へフォールバック", () => {
  // 同一県に対応市がある政令市が、その代表都市の様式に誤って吸われないこと。
  const fallbacks: Array<[string, string]> = [
    ["大阪府", "東大阪市"], // 大阪市以外の大阪府
    ["静岡県", "浜松市"], // 専用様式なし（所轄ラベルは別途 浜松市消防局 を表示）
    ["神奈川県", "横須賀市"], // 横浜以外の神奈川
    ["神奈川県", "藤沢市"],
    ["福岡県", "久留米市"], // 福岡市・北九州市以外の福岡
    ["愛知県", "豊田市"], // 名古屋以外の愛知
    ["京都府", "京都市"], // 京都は標準（"full"）が京都ベース
    ["奈良県", "奈良市"],
  ];
  it.each(fallbacks)("%s %s → full", (pref, city) => {
    expect(selectPackByLocation(pref, city)).toBe("full");
  });
});

describe("selectPackByLocation — 入力欠落でも例外を投げない", () => {
  it("空文字 → full", () => {
    expect(selectPackByLocation("", "")).toBe("full");
  });
  it("県のみ・市未入力（大阪府） → full（市が特定できなければ標準）", () => {
    // 旧ロジックは大阪府だけで osaka-full を引いたが、市未確定なら標準が安全。
    expect(selectPackByLocation("大阪府", "")).toBe("full");
  });
  it("県のみ・市未入力（東京都） → tokyo-full（東京は都で確定）", () => {
    expect(selectPackByLocation("東京都", "")).toBe("tokyo-full");
  });
});
