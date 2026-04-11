import {
  BorderStyle,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  VerticalAlign,
} from "docx";

/**
 * Shared table styling for Kyoto-city tables.
 *
 * These constants and helpers are lifted from v1's
 * lib/generate_kyoto_full.js (the tbl / row helpers at L37-50) so
 * v2-rendered tables visually match v1 where we care about it.
 * Kept inside builders/kyoto/ for now — if Tokyo (Step 5) turns
 * out to use the same spec we can hoist this up to
 * builders/table-helpers.ts; for Step 4b we stay scoped.
 */

// A4 content width = 11906 - 1440*2 page margins.
const TABLE_WIDTH = 9026;

const BORDER_SPEC = { style: BorderStyle.SINGLE, size: 1, color: "888888" };
const CELL_BORDERS = {
  top: BORDER_SPEC,
  bottom: BORDER_SPEC,
  left: BORDER_SPEC,
  right: BORDER_SPEC,
};
const CELL_MARGINS = { top: 60, bottom: 60, left: 100, right: 100 };
const HEADER_FILL = { fill: "2B4C7E", type: ShadingType.CLEAR };
const ALT_FILL = { fill: "F5F7FA", type: ShadingType.CLEAR };

function cell(text: string, widthDxa: number, opts: { isHeader?: boolean; isFirstColumn?: boolean } = {}): TableCell {
  const { isHeader = false, isFirstColumn = false } = opts;
  return new TableCell({
    borders: CELL_BORDERS,
    margins: CELL_MARGINS,
    verticalAlign: VerticalAlign.CENTER,
    width: { size: widthDxa, type: WidthType.DXA },
    shading: isHeader ? HEADER_FILL : isFirstColumn ? ALT_FILL : undefined,
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            size: isHeader ? 19 : 20,
            font: "游ゴシック",
            bold: isHeader,
            color: isHeader ? "FFFFFF" : "000000",
          }),
        ],
      }),
    ],
  });
}

function row(cells: string[], widths: number[], isHeader = false): TableRow {
  return new TableRow({
    children: cells.map((c, i) =>
      cell(c, widths[i], { isHeader, isFirstColumn: !isHeader && i === 0 })
    ),
  });
}

/**
 * Build a Kyoto-styled Table from a header row and data rows.
 *
 * Widths is an array of DXA values whose length must equal the
 * header row's length. Callers enforce that statically by hand —
 * we don't guard at runtime because these are all internal
 * fixed-column tables.
 */
export function kyotoTable(headers: string[], rows: string[][], widths: number[]): Table {
  return new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    columnWidths: widths,
    rows: [row(headers, widths, true), ...rows.map((r) => row(r, widths))],
  });
}
