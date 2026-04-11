/**
 * Kyoto-city dept-specific pure logic.
 *
 * These helpers encode the Kyoto City fire department's exact
 * phrasing rules — they are NOT generic computed fns and MUST NOT
 * leak into lib/engine-v2/computed/. Each function is a pure
 * string selector keyed off RenderData-derived flags.
 *
 * The adapter calls these during toRenderData post-processing so
 * the resulting strings land in the RenderData map as if they
 * were ordinary placeholders.
 */

/**
 * 消防法の条文 — 統括防火管理の有無で条文番号が変わる。
 * v1: lib/generate_kyoto_full.js:238
 */
export function legalBasis(isUnified: boolean): string {
  return isUnified ? "消防法第８条の２第１項" : "消防法第８条第１項";
}

/**
 * 点検結果報告の頻度(文言) — 特定防火対象物は 1 年、それ以外は 3 年。
 * v1: lib/generate_kyoto_full.js:216 (constant form, used as "${reportFreq}")
 *     L164 (full-phrase form, used as "1年に1回" / "3年に1回")
 */
export function reportFrequency(isSpecific: boolean): string {
  return isSpecific ? "1年" : "3年";
}

/**
 * Full-phrase version of reportFrequency for cells that say
 * "1年に1回" vs "3年に1回". Used in 別表7 後続 txt.
 * v1: lib/generate_kyoto_full.js:164
 */
export function reportFrequencyPhrase(isSpecific: boolean): string {
  return isSpecific ? "1年に1回" : "3年に1回";
}

/**
 * 訓練要件 — 特定防火対象物は年2回以上、それ以外は消防計画に従う。
 * v1: lib/generate_kyoto_full.js:217
 */
export function drillRequirement(isSpecific: boolean): string {
  return isSpecific ? "年2回以上" : "消防計画に定めた回数";
}

/**
 * 防火対象物定期点検結果報告の文言 — 3 値。
 * 特定防火対象物かつ収容人員 300 人以上のみ「1年に1回」、
 * それ以外は「報告対象非該当」。
 * v1: lib/generate_kyoto_full.js:289
 */
export function periodicInspectionReport(
  isSpecific: boolean,
  capacity: number
): string {
  return isSpecific && capacity >= 300 ? "1年に1回" : "報告対象非該当";
}

/**
 * 該当/非該当 word swap ヘルパー — v1 の多数箇所で使われるパターン。
 * v1: L229, L248, L478
 */
export function applicableLabel(flag: boolean): string {
  return flag ? "該当" : "非該当";
}
