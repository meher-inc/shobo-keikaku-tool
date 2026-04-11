import type { Paragraph, Table } from "docx";
import type { RenderData } from "../../../helpers/placeholder";
import { kyotoTable } from "../table-helpers";

/**
 * 第7章 (休日、夜間の防火管理体制) 冒頭の緊急連絡先テーブル。
 * v1: lib/generate_kyoto_full.js:387-391
 *
 * 2 columns × 2 rows key/value table. The value column falls
 * back to "(未設定)" so a missing form value doesn't leave an
 * empty cell.
 */
export function buildCh7EmergencyTable(data: RenderData): (Paragraph | Table)[] {
  const phone = data.emergencyContactPhone ?? "(未設定)";
  const name = data.emergencyContactName ?? "(未設定)";

  return [
    kyotoTable(
      ["項目", "内容"],
      [
        ["緊急連絡先 TEL", phone],
        ["緊急連絡先 氏名", name],
      ],
      [3000, 6026]
    ),
  ];
}
