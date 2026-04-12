import type { Paragraph, Table } from "docx";
import type { RenderData } from "../../../helpers/placeholder";
import { tokyoTable } from "../../shared/table-helpers";

/**
 * 第6章 §1 消防機関へ連絡等する事項 table (3×4).
 * v1: lib/generate_tokyo_full.js:377-384.
 * Similar to kyoto ch3 reports but 4 rows (no 防火対象物定期点検
 * row) and simplified column text.
 */
export function buildCh6ReportsTable(data: RenderData): (Paragraph | Table)[] {
  const isSpecific = data.isSpecificUse === "true";
  const reportFreq = isSpecific ? "1年" : "3年";

  return [
    tokyoTable(
      ["種別", "届出等の時期", "届出者等"],
      [
        ["防火管理者選任（解任）届出", "防火管理者を定め又は解任したとき", "管理権原者"],
        ["消防計画作成（変更）届出", "消防計画を作成又は変更したとき", "防火管理者"],
        ["訓練実施の通知", "消防訓練を実施する前", "防火管理者"],
        ["消防用設備等点検結果報告", `${reportFreq}に1回`, "防火管理者の確認後"],
      ],
      [2600, 3800, 2626]
    ),
  ];
}
