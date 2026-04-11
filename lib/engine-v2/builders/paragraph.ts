import { HeadingLevel, Paragraph, TextRun } from "docx";
import type { Section } from "../types/template-pack";
import { resolveBody, type RenderData } from "../helpers/placeholder";

/**
 * Build the docx paragraphs for a single section: one heading
 * paragraph, plus one body paragraph if the resolved body text is
 * non-empty. An empty body omits the body paragraph but still emits
 * the heading so section ordering stays stable.
 */
export function buildParagraphs(section: Section, data: RenderData): Paragraph[] {
  const out: Paragraph[] = [
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun(section.heading)],
    }),
  ];

  const bodyText = resolveBody(section.body, data);
  if (bodyText !== "") {
    out.push(
      new Paragraph({
        children: [new TextRun(bodyText)],
      })
    );
  }

  return out;
}
