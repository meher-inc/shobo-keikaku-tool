/**
 * Nagoya City Fire Bureau (その他用《中規模》) dept-specific
 * pure logic.
 *
 * Phase 2A scope: minimal — only the 該当/非該当 word-swap helper.
 * The adapter handles section-level gating directly via skip-list,
 * so no condition strings need to be derived here for Step 2/3.
 *
 * Phase 2B may add:
 *   - hasOutsourcedManagement-specific phrasings (本文側の委託節
 *     文言バリエーション)
 *   - tokaiQuakeApplicable=false 時の第9-10条 inline references
 *     文言制御 (現状は無条件 emit、推進/強化地域外向け動的 gating
 *     拡張余地)
 *   - 第3/4/6/8/11 条 のインラインテーブル emit (備蓄品 / 救助救出
 *     資機材 / 教育時期 / 訓練種別 等の specific row generators)
 */

/**
 * 該当/非該当 word swap — used by 別表等一覧 to label each appendix
 * row with its applicability based on RenderData flags.
 */
export function applicableLabel(flag: boolean): string {
  return flag ? "該当" : "非該当";
}
