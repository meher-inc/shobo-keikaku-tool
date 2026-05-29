/**
 * 別記様式第1号の2の2（第3条の2、第51条の9関係） — 防火・防災管理者選任（解任）届出書 —
 * の docx テンプレを docx-js で生成し lib/engine-v2/national/templates-official/fire-manager-appointment.docx に出力する。
 *
 * 既存 12 公式テンプレと同様、docxtemplater で {{key}} を差し込む形式。
 * 再生成手順: `npx tsx scripts/build-fire-manager-appointment-docx.ts`
 *
 * プレースホルダキーは lib/engine-v2/national/templates/fire-manager-appointment.json の
 * field key、および row-table の `${row.key}${column.key}` 合成キーに準拠。
 */

import fs from "node:fs";
import path from "node:path";
import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx";

const FONT = "MS Mincho";
const TABLE_WIDTH = 9026;
const BORDER = { style: BorderStyle.SINGLE, size: 4, color: "000000" } as const;
const CELL_BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER } as const;
const CELL_MARGINS = { top: 80, bottom: 80, left: 120, right: 120 } as const;

function p(text: string, opts?: { bold?: boolean; size?: number; align?: (typeof AlignmentType)[keyof typeof AlignmentType] }): Paragraph {
  return new Paragraph({
    alignment: opts?.align,
    children: [new TextRun({ text, bold: opts?.bold, size: opts?.size ?? 22, font: FONT })],
  });
}

function cell(
  text: string,
  opts?: { width?: number; shading?: string; bold?: boolean; columnSpan?: number }
): TableCell {
  return new TableCell({
    width: opts?.width !== undefined ? { size: opts.width, type: WidthType.DXA } : undefined,
    columnSpan: opts?.columnSpan,
    borders: CELL_BORDERS,
    margins: CELL_MARGINS,
    verticalAlign: VerticalAlign.CENTER,
    shading: opts?.shading ? { type: "clear", color: "auto", fill: opts.shading } : undefined,
    children: [p(text, { bold: opts?.bold, size: 20 })],
  });
}

function headerRow(label: string, totalWidth: number): TableRow {
  return new TableRow({
    tableHeader: true,
    children: [cell(label, { width: totalWidth, shading: "E8E8E8", bold: true, columnSpan: 2 })],
  });
}

function kvRow(label: string, valueKey: string, labelWidth: number, valueWidth: number): TableRow {
  return new TableRow({
    children: [
      cell(label, { width: labelWidth, shading: "F2F2F2", bold: true }),
      cell(`{{${valueKey}}}`, { width: valueWidth }),
    ],
  });
}

function kvTable(headingLabel: string, pairs: Array<[string, string]>): Table {
  const labelWidth = Math.floor(TABLE_WIDTH * 0.32);
  const valueWidth = TABLE_WIDTH - labelWidth;
  return new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    columnWidths: [labelWidth, valueWidth],
    rows: [
      headerRow(headingLabel, TABLE_WIDTH),
      ...pairs.map(([label, key]) => kvRow(label, key, labelWidth, valueWidth)),
    ],
  });
}

function rowTableMulti(
  headingLabel: string,
  rowLabelHeader: string,
  columns: Array<{ key: string; label: string }>,
  rows: Array<{ key: string; label: string }>
): Table {
  const rowLabelWidth = Math.floor(TABLE_WIDTH * 0.32);
  const dataColWidth = Math.floor((TABLE_WIDTH - rowLabelWidth) / columns.length);
  const totalSpan = 1 + columns.length;

  const heading = new TableRow({
    tableHeader: true,
    children: [cell(headingLabel, { width: TABLE_WIDTH, shading: "E8E8E8", bold: true, columnSpan: totalSpan })],
  });
  const colHeader = new TableRow({
    tableHeader: true,
    children: [
      cell(rowLabelHeader, { width: rowLabelWidth, shading: "E8E8E8", bold: true }),
      ...columns.map((c) => cell(c.label, { width: dataColWidth, shading: "E8E8E8", bold: true })),
    ],
  });
  const dataRows = rows.map(
    (r) =>
      new TableRow({
        children: [
          cell(r.label, { width: rowLabelWidth, shading: "F2F2F2", bold: true }),
          ...columns.map((c) => cell(`{{${r.key}${c.key}}}`, { width: dataColWidth })),
        ],
      })
  );

  return new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    columnWidths: [rowLabelWidth, ...columns.map(() => dataColWidth)],
    rows: [heading, colHeader, ...dataRows],
  });
}

function buildDocument(): Document {
  return new Document({
    creator: "todokede",
    title: "防火・防災管理者選任（解任）届出書",
    description: "別記様式第1号の2の2（第3条の2、第51条の9関係）",
    styles: {
      default: {
        document: { run: { font: FONT, size: 22 } },
      },
    },
    sections: [
      {
        properties: {},
        children: [
          // タイトル
          p("防火・防災管理者選任（解任）届出書", {
            bold: true,
            size: 28,
            align: AlignmentType.CENTER,
          }),
          p("（別記様式第1号の2の2）", { size: 18, align: AlignmentType.CENTER }),
          p(""),

          // 提出日 (右寄せ)
          p("提出日: {{submitDate}}", { align: AlignmentType.RIGHT }),
          p(""),

          // 宛先
          p("{{municipality}} {{fireDeptName}}消防署長　殿"),
          p(""),

          // 届出者ブロック (管理権原者)
          kvTable("管理権原者（届出者）", [
            ["住所", "submitterAddress"],
            ["氏名（法人の場合は名称及び代表者氏名）", "submitterName"],
            ["電話番号", "submitterPhone"],
          ]),
          p(""),

          // 本文 (Preamble)
          p("下記のとおり、{{kind}}管理者を{{operationType}}したので届け出ます。"),
          p(""),

          // 防火対象物
          kvTable("防火対象物（建築物その他の工作物）", [
            ["所在地", "buildingAddress"],
            ["電話番号", "buildingPhone"],
            ["名称", "buildingName"],
            ["管理権原", "managementAuthority"],
            ["複数権原の場合に管理権原に属する部分の名称", "multipleAuthorityPart"],
            ["用途", "mainUse"],
            ["令別表第1の項番", "buildingCategory"],
            ["収容人員", "capacity"],
            ["種別（甲種／乙種）", "managerKind"],
          ]),
          p(""),

          // 令第2条 / 令第3条第3項 適用区分 (row-table)
          rowTableMulti(
            "令第2条 / 令第3条第3項 適用区分（該当時のみ）",
            "区分",
            [
              { key: "Name", label: "名称" },
              { key: "Category", label: "令別表第1" },
              { key: "Capacity", label: "収容人員" },
            ],
            [
              { key: "rule2Building1", label: "令第2条を適用するもの 1" },
              { key: "rule2Building2", label: "令第2条を適用するもの 2" },
              { key: "rule3p3Part1", label: "令第3条第3項を適用するもの 1" },
              { key: "rule3p3Part2", label: "令第3条第3項を適用するもの 2" },
            ]
          ),
          p(""),

          // 選任の場合
          kvTable("選任の場合", [
            ["氏名", "managerName"],
            ["フリガナ", "managerNameKana"],
            ["住所", "managerAddress"],
            ["選任年月日", "appointmentDate"],
            ["職務上の地位", "positionTitle"],
            ["資格区分", "qualificationKind"],
            ["講習機関", "qualificationInstitution"],
            ["修了年月日", "qualificationCompletionDate"],
            ["その他資格根拠条文", "otherQualification"],
          ]),
          p(""),

          // 解任の場合
          kvTable("解任の場合", [
            ["氏名", "dismissedManagerName"],
            ["解任年月日", "dismissalDate"],
            ["解任理由", "dismissalReason"],
          ]),
          p(""),

          // その他必要事項
          kvTable("その他必要事項", [["備考・特記事項", "remarks"]]),
          p(""),

          // 注釈
          p("（注）", { bold: true }),
          p("1. この用紙の大きさは、日本産業規格Ａ４とすること。", { size: 18 }),
          p("2. 該当欄については、選択した値（甲種／乙種・選任／解任・防火／防災・単一権原／複数権原）が転記される。", { size: 18 }),
          p("3. 複数権原の場合は管理権原に属する部分の情報を記入すること。", { size: 18 }),
          p("4. 防火・防災管理者の資格を証する書面を別途添付すること。", { size: 18 }),
        ],
      },
    ],
  });
}

async function main() {
  const outDir = path.join(process.cwd(), "lib/engine-v2/national/templates-official");
  const outPath = path.join(outDir, "fire-manager-appointment.docx");
  if (!fs.existsSync(outDir)) {
    throw new Error(`Output dir not found: ${outDir}`);
  }
  const doc = buildDocument();
  const buf = await Packer.toBuffer(doc);
  fs.writeFileSync(outPath, buf);
  console.log(`Wrote ${outPath} (${buf.length} bytes)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
