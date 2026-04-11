import type { Paragraph, Table } from "docx";
import type { RenderData } from "../../../helpers/placeholder";
import { kyotoTable } from "../table-helpers";
import { drillRequirement } from "../logic";

/**
 * 第10章 (訓練) の実施時期テーブル。
 * v1: lib/generate_kyoto_full.js:453-457
 *
 * 3 columns × 2 rows. row1 備考列 is the drillRequirement word
 * swap (年2回以上 / 消防計画に定めた回数).
 */
export function buildCh10DrillsTable(data: RenderData): (Paragraph | Table)[] {
  const isSpecific = data.isSpecificUse === "true";
  const drillMonths = data.drillMonths ?? "4月・10月";

  return [
    kyotoTable(
      ["訓練の種別", "実施時期", "備考"],
      [
        [
          "部分訓練（消火、通報、避難訓練等）",
          `おおむね${drillMonths}`,
          drillRequirement(isSpecific),
        ],
        ["総合訓練", `おおむね${drillMonths}`, ""],
      ],
      [3000, 3026, 3000]
    ),
  ];
}
