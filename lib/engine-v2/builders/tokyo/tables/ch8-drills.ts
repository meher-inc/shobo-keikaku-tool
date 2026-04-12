import { Paragraph, Table, TextRun } from "docx";
import type { RenderData } from "../../../helpers/placeholder";
import { tokyoTable } from "../../shared/table-helpers";

/**
 * 第8章 §1 訓練の実施時期等 table (3×2) + post-table items ⑴⑵.
 * v1: lib/generate_tokyo_full.js:417-424.
 *
 * Unlike kyoto (where post-table items live in a separate JSON
 * section "ch10-preamble-items"), Tokyo's items ⑴⑵ are included
 * in this SectionOverride return so the JSON doesn't need an
 * extra section between §1 and §2.
 */
export function buildCh8DrillsTable(data: RenderData): (Paragraph | Table)[] {
  const isSpecific = data.isSpecificUse === "true";
  const drillReq = isSpecific ? "年2回以上" : "消防計画に定めた回数";
  const drillMonths = data.drillMonths ?? "5月・11月";

  const txt = (t: string) =>
    new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: t, size: 21, font: "游明朝" })] });

  return [
    tokyoTable(
      ["訓練の種別", "実施時期", "備考"],
      [
        ["部分訓練（消火、通報、避難訓練等）", `おおむね${drillMonths}`, drillReq],
        ["総合訓練", `おおむね${drillMonths}`, ""],
      ],
      [3000, 3026, 3000]
    ),
    new Paragraph({ spacing: { after: 40 }, children: [] }), // spacer
    txt("⑴　防火管理者は、訓練指導者を指定して訓練を実施させる。"),
    txt("⑵　訓練を実施するときは、あらかじめ消防機関へ通報する。"),
  ];
}
