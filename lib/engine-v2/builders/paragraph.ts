import { HeadingLevel, Paragraph, TextRun } from "docx";
import type { Section } from "../types/template-pack";
import { resolveBody, type RenderData } from "../helpers/placeholder";

/**
 * Build the docx paragraphs for a single section.
 *
 * Emits a HEADING_2 paragraph for the section heading, then one or
 * more body paragraphs. The resolved body string is split on "\n"
 * so a section that needs multiple paragraphs (e.g. a numbered item
 * list) can put them in a single text node separated by newlines.
 * Bodies without any newline produce a single paragraph, which
 * keeps the Step 1 sample pack behaviour backward-compatible.
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
    for (const line of bodyText.split("\n")) {
      if (line === "") continue;
      out.push(
        new Paragraph({
          children: [new TextRun(line)],
        })
      );
    }
  }

  return out;
}
