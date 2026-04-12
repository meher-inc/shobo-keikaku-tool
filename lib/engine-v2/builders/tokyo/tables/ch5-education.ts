import type { Paragraph, Table } from "docx";
import type { RenderData } from "../../../helpers/placeholder";
import { tokyoTable } from "../../shared/table-helpers";

/**
 * 第5章 §1 防火・防災教育 table (4×3).
 * v1: lib/generate_tokyo_full.js:365-371.
 * Structurally similar to kyoto ch9 but row text differs
 * (アルバイト等 / 教育担当者等 vs kyoto's アルバイト・パート /
 * 防火管理者).
 */
export function buildCh5EducationTable(data: RenderData): (Paragraph | Table)[] {
  const educationMonths = data.educationMonths ?? "4月・10月";
  return [
    tokyoTable(
      ["対象者", "実施時期", "実施回数", "実施者"],
      [
        ["正社員", educationMonths, "年2回", "防火管理者"],
        ["新入社員", "採用時", "採用時", "防火管理者"],
        ["アルバイト等", "採用時等", "必要の都度", "教育担当者等"],
      ],
      [2000, 2200, 2200, 2626]
    ),
  ];
}
