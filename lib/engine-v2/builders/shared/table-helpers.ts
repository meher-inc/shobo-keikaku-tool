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
 * Theme-aware table helpers shared across all department packs.
 *
 * The structural layout (borders, margins, font family, font size,
 * bold/non-bold) is identical between kyoto and tokyo v1 generators.
 * Only the header fill colour and the alternating-row tint differ,
 * captured in the TableTheme type.
 *
 * Moved from builders/kyoto/table-helpers.ts in Step 5 Task 2.
 */

// ── theme ─────────────────────────────────────────────────────

export type TableTheme = {
  /** Header row background (hex without #). */
  headerFill: string;
  /** First-column / alternating tint background (hex without #). */
  altFill: string;
};

/** Kyoto City — navy header, light-grey alt row. */
export const kyotoTheme: TableTheme = {
  headerFill: "2B4C7E",
  altFill: "F5F7FA",
};

/** Tokyo TFD — red header, light-pink alt row. */
export const tokyoTheme: TableTheme = {
  headerFill: "C41E3A",
  altFill: "FFF5F5",
};

// ── shared constants (theme-independent) ──────────────────────

const TABLE_WIDTH = 9026; // A4 content width = 11906 - 1440*2
const BORDER_SPEC = { style: BorderStyle.SINGLE, size: 1, color: "888888" };
const CELL_BORDERS = {
  top: BORDER_SPEC,
  bottom: BORDER_SPEC,
  left: BORDER_SPEC,
  right: BORDER_SPEC,
};
const CELL_MARGINS = { top: 60, bottom: 60, left: 100, right: 100 };

// ── internal helpers ──────────────────────────────────────────

function cellNode(
  text: string,
  widthDxa: number,
  theme: TableTheme,
  opts: { isHeader?: boolean; isFirstColumn?: boolean } = {}
): TableCell {
  const { isHeader = false, isFirstColumn = false } = opts;
  const hdrFill = { fill: theme.headerFill, type: ShadingType.CLEAR };
  const altFill = { fill: theme.altFill, type: ShadingType.CLEAR };
  return new TableCell({
    borders: CELL_BORDERS,
    margins: CELL_MARGINS,
    verticalAlign: VerticalAlign.CENTER,
    width: { size: widthDxa, type: WidthType.DXA },
    shading: isHeader ? hdrFill : isFirstColumn ? altFill : undefined,
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

function rowNode(cells: string[], widths: number[], theme: TableTheme, isHeader = false): TableRow {
  return new TableRow({
    children: cells.map((c, i) =>
      cellNode(c, widths[i], theme, { isHeader, isFirstColumn: !isHeader && i === 0 })
    ),
  });
}

// ── public API ────────────────────────────────────────────────

/**
 * Build a themed table. The core primitive — dept-specific
 * convenience wrappers below delegate to this.
 */
export function styledTable(
  headers: string[],
  rows: string[][],
  widths: number[],
  theme: TableTheme
): Table {
  return new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      rowNode(headers, widths, theme, true),
      ...rows.map((r) => rowNode(r, widths, theme)),
    ],
  });
}

/** Kyoto-themed convenience (backward-compat with Step 4b callers). */
export function kyotoTable(headers: string[], rows: string[][], widths: number[]): Table {
  return styledTable(headers, rows, widths, kyotoTheme);
}

/** Tokyo-themed convenience. */
export function tokyoTable(headers: string[], rows: string[][], widths: number[]): Table {
  return styledTable(headers, rows, widths, tokyoTheme);
}
