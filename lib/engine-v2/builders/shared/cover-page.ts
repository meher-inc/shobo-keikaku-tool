import { AlignmentType, PageBreak, Paragraph, TextRun } from "docx";
import type { RenderData } from "../../helpers/placeholder";

/**
 * Cover page builder — shared across all dept packs.
 *
 * Produces a centered title page with building name, "消防計画"
 * heading, a dept-specific subtitle line, and a creation date,
 * followed by a page break to push the body to page 2.
 *
 * Ported from:
 * - Kyoto: lib/generate_kyoto_full.js L222-233
 * - Tokyo: lib/generate_tokyo_full.js L257-263
 */

const GOTHIC = "游ゴシック";
const MINCHO = "游明朝";

export type CoverPageOpts = {
  /** Line 3: dept-specific subtitle (e.g. "統括防火管理〔非該当〕" or "【中規模用】"). */
  subtitle: string;
  /** Optional colour for the subtitle TextRun (hex without #). */
  subtitleColor?: string;
  /** Font size for the subtitle line (half-points). Default 22. */
  subtitleSize?: number;
};

export function buildCoverPage(data: RenderData, opts: CoverPageOpts): Paragraph[] {
  const buildingName = data.companyName ?? data.buildingName ?? "（建物名未設定）";
  const creationDate = data.creationDate ?? "";

  return [
    // Line 1: building / company name — large, bold, vertically offset
    new Paragraph({
      spacing: { before: 4000 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: buildingName, size: 36, bold: true, font: GOTHIC }),
      ],
    }),
    // Line 2: "消防計画" title
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200 },
      children: [
        new TextRun({ text: "消防計画", size: 56, bold: true, font: GOTHIC }),
      ],
    }),
    // Line 3: dept-specific subtitle
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: opts.subtitleColor ? 300 : 600 },
      children: [
        new TextRun({
          text: opts.subtitle,
          size: opts.subtitleSize ?? 22,
          font: opts.subtitleColor ? GOTHIC : MINCHO,
          ...(opts.subtitleColor ? { color: opts.subtitleColor } : {}),
        }),
      ],
    }),
    // Line 4: creation date
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200 },
      children: [
        new TextRun({ text: `${creationDate}作成`, size: 22, font: MINCHO }),
      ],
    }),
    // Page break to push body to page 2
    new Paragraph({ children: [new PageBreak()] }),
  ];
}
