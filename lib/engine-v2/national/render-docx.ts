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
  NationalFormData,
  NationalFormPack,
} from "../types/national-form-pack";

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

function renderFieldValue(field: FormField, data: NationalFormData): string {
  const raw = data[field.key];
  if (raw === undefined || raw === "") return "";
  if (Array.isArray(raw)) {
    if (field.type === "checkbox-group") {
      return raw.length === 0 ? "" : raw.map((v) => `☑ ${v}`).join("　");
    }
    return raw.join("、");
  }
  if (field.type === "radio" || field.type === "select") {
    return `☑ ${raw}`;
  }
  return raw;
}

function buildSectionTable(section: FormSection, data: NationalFormData): Table {
  const labelWidth = Math.floor(TABLE_WIDTH * 0.32);
  const valueWidth = TABLE_WIDTH - labelWidth;

  const rows: TableRow[] = section.fields.map((field) => {
    const value = renderFieldValue(field, data);
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
        cell(renderFieldValue(field, data), { width: valueWidth }),
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

  const submitDate = (data.submitDate as string | undefined) ?? "    年    月    日";
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
    children.push(buildSectionTable(section, data));
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
