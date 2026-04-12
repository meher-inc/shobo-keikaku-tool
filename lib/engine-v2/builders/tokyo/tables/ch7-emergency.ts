import type { Paragraph, Table } from "docx";
import type { RenderData } from "../../../helpers/placeholder";
import { tokyoTable } from "../../shared/table-helpers";

/**
 * 第7章 §5 営業時間外等の自衛消防活動体制 table (2×2).
 * v1: lib/generate_tokyo_full.js:409-413.
 * Identical structure to kyoto ch7 emergency but uses tokyoTheme.
 */
export function buildCh7EmergencyTable(data: RenderData): (Paragraph | Table)[] {
  const phone = data.emergencyContactPhone ?? "(未設定)";
  const name = data.emergencyContactName ?? "(未設定)";
  return [
    tokyoTable(
      ["項目", "内容"],
      [
        ["緊急連絡先 TEL", phone],
        ["緊急連絡先 氏名", name],
      ],
      [3000, 6026]
    ),
  ];
}
