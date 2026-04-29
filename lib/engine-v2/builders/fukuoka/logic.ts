/**
 * Fukuoka City Fire Bureau (中規模防火対象物用) dept-specific
 * pure logic.
 *
 * Phase 2A scope: minimal — only the 該当/非該当 word-swap helper.
 * The adapter handles section-level gating directly via skip-list,
 * so no condition strings need to be derived here for Step 2/3.
 *
 * Phase 2B may add:
 *   - hasOutsourcedManagement-specific phrasings (本文側の委託節
 *     文言バリエーション)
 *   - requiresUnifiedFpm-specific 統括 inline references の文言制御
 *     (第5条(11) / 第25条 inline)
 *   - 第33条 備蓄品テーブル / 第36条 防災教育表 / 第40条 訓練表 の
 *     条件付き emit
 */

/**
 * 該当/非該当 word swap — used by 別表等一覧 to label each appendix
 * row with its applicability based on RenderData flags.
 */
export function applicableLabel(flag: boolean): string {
  return flag ? "該当" : "非該当";
}
