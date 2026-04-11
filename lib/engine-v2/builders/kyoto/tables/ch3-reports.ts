import type { Paragraph, Table } from "docx";
import type { RenderData } from "../../../helpers/placeholder";
import { kyotoTable } from "../table-helpers";
import { periodicInspectionReport, reportFrequency } from "../logic";

/**
 * 第3章 Section 1 (消防機関への報告、連絡する事項) table builder.
 *
 * Replaces the Step 4a text-degraded bullet list in
 * kyoto-city.full.json with the real 3-column × 5-row table from
 * v1 (lib/generate_kyoto_full.js:283-290). Resolves the Step 4a
 * TODO(step4b) marker in adapters/generate-plan.ts.
 *
 * Data dependencies:
 * - isSpecificUse   → reportFrequency() for row 4
 * - isSpecificUse + capacity → periodicInspectionReport() for row 5
 *
 * Returns (Paragraph | Table)[] even though it only emits one
 * Table, so the signature matches SectionOverride and future row
 * / caption additions don't require a signature change.
 */
export function buildCh3ReportsTable(data: RenderData): (Paragraph | Table)[] {
  const isSpecific = data.isSpecificUse === "true";
  const capacity = Number(data.capacity ?? "0");

  const rows: string[][] = [
    [
      "防火管理者選任（解任）届出",
      "防火管理者を定めたとき、又はこれを解任したとき",
      "管理権原者",
    ],
    [
      "消防計画作成（変更）届出",
      "消防計画を作成したとき、又は変更事項があったとき",
      "防火管理者",
    ],
    ["訓練実施の通知", "消防訓練を実施する前", "防火管理者"],
    [
      "消防用設備等点検結果報告",
      `${reportFrequency(isSpecific)}に1回（総合点検終了後）`,
      "防火管理者の確認を受けた後",
    ],
    [
      "防火対象物定期点検結果報告",
      periodicInspectionReport(isSpecific, capacity),
      "管理権原者",
    ],
  ];

  return [
    kyotoTable(["種別", "届出等の時期", "届出者等"], rows, [2600, 3800, 2626]),
  ];
}
