import { PageBreak, Paragraph, TextRun } from "docx";

/**
 * Kyoto-flavoured paragraph builders.
 *
 * These mirror lib/generate_kyoto_full.js's sec / sub / txt / pb /
 * sp helpers (L17-53) one-for-one — same font sizes, same spacing,
 * same family names — so the v2-rendered output visually lines up
 * with v1 for the parts we need to match.
 *
 * Kept under builders/kyoto/ since v1's styling choices are
 * department-driven. Step 5 (Tokyo) will decide whether to share
 * this or fork its own.
 */

const MINCHO = "游明朝";
const GOTHIC = "游ゴシック";

/**
 * Section-level bold heading (v1 sec()) — chapter-level in v1
 * terms, but we reserve HEADING_1 for JSON chapter titles, so
 * this is a standalone non-heading paragraph with the same
 * visual weight.
 */
export function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 480, after: 200 },
    children: [new TextRun({ text, bold: true, size: 28, font: GOTHIC })],
  });
}

/**
 * 別表N heading (v1 appendixHeading()). Same visual weight as
 * sectionHeading; callers usually pair it with a leading pageBreak.
 */
export function appendixHeading(num: string, title: string): Paragraph {
  return new Paragraph({
    spacing: { before: 480, after: 200 },
    children: [
      new TextRun({
        text: `別表${num}　${title}`,
        bold: true,
        size: 28,
        font: GOTHIC,
      }),
    ],
  });
}

/**
 * Plain body paragraph (v1 txt()) — 游明朝 21 half-pt.
 */
export function plainText(text: string): Paragraph {
  return new Paragraph({
    spacing: { after: 60 },
    children: [new TextRun({ text, size: 21, font: MINCHO })],
  });
}

/**
 * Hard page break as its own empty paragraph (v1 pb()).
 */
export function pageBreak(): Paragraph {
  return new Paragraph({ children: [new PageBreak()] });
}

/**
 * Small vertical spacer (v1 sp()).
 */
export function spacerParagraph(): Paragraph {
  return new Paragraph({ spacing: { after: 40 }, children: [] });
}
