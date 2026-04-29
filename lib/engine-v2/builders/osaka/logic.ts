/**
 * Osaka City Fire Bureau (中・小規模 事業所・テナント用) dept-specific
 * pure logic.
 *
 * Phase 2A scope: minimal — only the 該当/非該当 word-swap helper.
 * The adapter handles section-level gating directly via skip-list,
 * so no condition strings need to be derived here for Step 2/3.
 *
 * Phase 2B may add:
 *   - hasOutsourcedManagement-specific phrasings (本文側の委託節
 *     文言バリエーション)
 *   - 南海トラフ臨時情報 3 区分の選択肢ラベル
 */

/**
 * 該当/非該当 word swap — used by 別表等一覧 to label each appendix
 * row with its applicability based on RenderData flags.
 */
export function applicableLabel(flag: boolean): string {
  return flag ? "該当" : "非該当";
}
