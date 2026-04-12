import type { Paragraph, Table } from "docx";
import type { RenderData } from "../../../helpers/placeholder";
import { kyotoTable } from "../../shared/table-helpers";

/**
 * 第9章 (防災教育) の実施時期テーブル。
 * v1: lib/generate_kyoto_full.js:436-441
 *
 * 4 columns × 3 rows. Only the 正社員 row takes a placeholder
 * (educationMonths); the other two rows are static.
 */
export function buildCh9EducationTable(data: RenderData): (Paragraph | Table)[] {
  const educationMonths = data.educationMonths ?? "4月・10月";

  return [
    kyotoTable(
      ["対象者", "実施時期", "実施回数", "実施者"],
      [
        ["正社員", educationMonths, "年2回", "防火管理者"],
        ["新入社員", "採用時", "採用時", "防火管理者"],
        ["アルバイト・パート", "採用時等", "必要の都度", "防火管理者"],
      ],
      [2000, 2200, 2200, 2626]
    ),
  ];
}
