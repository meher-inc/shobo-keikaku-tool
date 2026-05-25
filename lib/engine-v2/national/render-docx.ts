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
  WidthType,
  VerticalAlign,
} from "docx";
import type {
  FormField,
  FormSection,
  KeyValueSection,
  NationalFormData,
  NationalFormPack,
  RowTableSection,
} from "../types/national-form-pack";
import { isRowTableSection } from "../types/national-form-pack";
import { formatDate } from "./date-format";

const FONT = "MS Mincho";
const TABLE_WIDTH = 9026;
const BORDER = { style: BorderStyle.SINGLE, size: 4, color: "000000" };
const CELL_BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };
const CELL_MARGINS = { top: 80, bottom: 80, left: 120, right: 120 };

type Alignment = (typeof AlignmentType)[keyof typeof AlignmentType];

function p(text: string, opts?: { bold?: boolean; size?: number; align?: Alignment }): Paragraph {
  return new Paragraph({
    alignment: opts?.align,
    children: [
      new TextRun({
        text,
        bold: opts?.bold,
        size: opts?.size ?? 22,
        font: FONT,
      }),
    ],
  });
}

function cell(text: string, opts?: { width?: number; shading?: string; bold?: boolean }): TableCell {
  return new TableCell({
    width: opts?.width !== undefined
      ? { size: opts.width, type: WidthType.DXA }
      : undefined,
    borders: CELL_BORDERS,
    margins: CELL_MARGINS,
    verticalAlign: VerticalAlign.CENTER,
    shading: opts?.shading
      ? { type: "clear", color: "auto", fill: opts.shading }
      : undefined,
    children: [p(text, { bold: opts?.bold, size: 20 })],
  });
}

function applyTemplate(template: string, data: NationalFormData): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
    const v = data[key];
    if (v === undefined || v === "") return "";
    return Array.isArray(v) ? v.join("・") : v;
  });
}

function renderFieldValue(
  field: FormField,
  data: NationalFormData,
  pack: NationalFormPack
): string {
  const raw = data[field.key];
  if (raw === undefined || raw === "") return "";
  if (Array.isArray(raw)) {
    if (field.type === "checkbox-group") {
      return raw.length === 0 ? "" : raw.map((v) => `☑ ${v}`).join("　");
    }
    return raw.join("、");
  }
  if (field.type === "date") {
    return formatDate(raw, pack.dateFormat ?? "wareki");
  }
  if (field.type === "radio" || field.type === "select") {
    return `☑ ${raw}`;
  }
  return raw;
}

function buildKeyValueTable(
  section: KeyValueSection,
  data: NationalFormData,
  pack: NationalFormPack
): Table {
  const labelWidth = Math.floor(TABLE_WIDTH * 0.32);
  const valueWidth = TABLE_WIDTH - labelWidth;

  const rows: TableRow[] = section.fields.map((field) => {
    const value = renderFieldValue(field, data, pack);
    return new TableRow({
      children: [
        cell(field.label, { width: labelWidth, shading: "F2F2F2", bold: true }),
        cell(value, { width: valueWidth }),
      ],
    });
  });

  return new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    rows,
  });
}

/**
 * row-table セクション: 行ベース複数列テーブル。
 *
 * 出力構造:
 *               | columns[0].label | columns[1].label | ...
 *   rows[0].label| <value>          | <value>          | ...
 *   rows[1].label| <value>          | <value>          | ...
 *
 * データキーは `${row.key}${column.key}` で組み立てる。
 */
function buildRowTable(section: RowTableSection, data: NationalFormData): Table {
  const rowLabelWidth = Math.floor(TABLE_WIDTH * 0.28);
  const dataColWidth = Math.floor((TABLE_WIDTH - rowLabelWidth) / section.columns.length);

  // ヘッダ行 (左上は空欄 or rowHeaderLabel)
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      cell(section.rowHeaderLabel ?? "", {
        width: rowLabelWidth,
        shading: "E8E8E8",
        bold: true,
      }),
      ...section.columns.map((col) =>
        cell(col.label, { width: dataColWidth, shading: "E8E8E8", bold: true })
      ),
    ],
  });

  // データ行
  const dataRows: TableRow[] = section.rows.map((row) => {
    return new TableRow({
      children: [
        cell(row.label, { width: rowLabelWidth, shading: "F2F2F2", bold: true }),
        ...section.columns.map((col) => {
          const dataKey = `${row.key}${col.key}`;
          const raw = data[dataKey];
          const value =
            raw === undefined || raw === ""
              ? ""
              : Array.isArray(raw)
                ? raw.join("、")
                : raw;
          return cell(value, { width: dataColWidth });
        }),
      ],
    });
  });

  return new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    columnWidths: [rowLabelWidth, ...section.columns.map(() => dataColWidth)],
    rows: [headerRow, ...dataRows],
  });
}

function buildSectionTable(
  section: FormSection,
  data: NationalFormData,
  pack: NationalFormPack
): Table {
  if (isRowTableSection(section)) {
    return buildRowTable(section, data);
  }
  return buildKeyValueTable(section, data, pack);
}

function buildSubmitterTable(pack: NationalFormPack, data: NationalFormData): Table {
  const labelWidth = Math.floor(TABLE_WIDTH * 0.32);
  const valueWidth = TABLE_WIDTH - labelWidth;

  const headerRow = new TableRow({
    children: [
      new TableCell({
        width: { size: TABLE_WIDTH, type: WidthType.DXA },
        columnSpan: 2,
        borders: CELL_BORDERS,
        margins: CELL_MARGINS,
        shading: { type: "clear", color: "auto", fill: "E8E8E8" },
        children: [p(pack.submitterTitle, { bold: true, size: 22 })],
      }),
    ],
  });

  const fieldRows: TableRow[] = pack.submitterFields.map((field) => {
    return new TableRow({
      children: [
        cell(field.label, { width: labelWidth, shading: "F2F2F2", bold: true }),
        cell(renderFieldValue(field, data, pack), { width: valueWidth }),
      ],
    });
  });

  return new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    rows: [headerRow, ...fieldRows],
  });
}

export function buildNationalDocument(
  pack: NationalFormPack,
  data: NationalFormData
): Document {
  const children: (Paragraph | Table)[] = [];

  children.push(p(pack.legalRef, { size: 18 }));
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: pack.title, bold: true, size: 32, font: FONT })],
    })
  );
  children.push(p(""));

  const submitDateRaw = (data.submitDate as string | undefined) ?? "";
  const submitDate = submitDateRaw
    ? formatDate(submitDateRaw, pack.dateFormat ?? "wareki")
    : "    年    月    日";
  children.push(p(submitDate, { align: AlignmentType.RIGHT }));
  children.push(p(applyTemplate(pack.submitToTemplate, data)));
  children.push(p(""));

  children.push(buildSubmitterTable(pack, data));
  children.push(p(""));

  children.push(p(applyTemplate(pack.preamble, data)));
  children.push(p("記", { align: AlignmentType.CENTER, bold: true }));

  for (const section of pack.sections) {
    if (section.heading) {
      children.push(p(""));
      children.push(p(section.heading, { bold: true, size: 24 }));
    }
    if (section.description) {
      children.push(p(section.description, { size: 18 }));
    }
    children.push(buildSectionTable(section, data, pack));
  }

  if (pack.footnotes.length > 0) {
    children.push(p(""));
    children.push(p("備考", { bold: true }));
    pack.footnotes.forEach((note, i) => {
      children.push(p(`${i + 1}　${note}`, { size: 18 }));
    });
  }

  return new Document({
    sections: [{ children }],
  });
}

export async function renderNationalDocx(
  pack: NationalFormPack,
  data: NationalFormData
): Promise<Buffer> {
  const doc = buildNationalDocument(pack, data);
  return Packer.toBuffer(doc);
}
