/**
 * Yokohama City Fire Bureau (一般用) dept-specific pure logic.
 *
 * Phase 2A scope: minimal — only the 該当/非該当 word-swap helper.
 * The adapter handles section-level gating directly via skip-list,
 * so no condition strings need to be derived here for Step 2/3.
 *
 * Phase 2B may add:
 *   - requiresUnifiedFpm-specific phrasings (e.g. 統括防火管理者 報告
 *     文言の有無)
 *   - hasDisasterCenter-specific defaults for 別表3
 *   - 帰宅困難者対応の文言バリエーション
 */

/**
 * 該当/非該当 word swap — used by 別表等一覧 to label each appendix
 * row with its applicability based on RenderData flags.
 */
export function applicableLabel(flag: boolean): string {
  return flag ? "該当" : "非該当";
}
