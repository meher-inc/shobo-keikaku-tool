import { Document, HeadingLevel, Paragraph, TextRun } from "docx";
import type { TemplatePack } from "../types/template-pack";
import type { RenderData } from "../helpers/placeholder";
import { buildParagraphs } from "./paragraph";

/**
 * Build a docx Document from a TemplatePack + render data.
 *
 * Walks chapters -> sections in order, emitting a HEADING_1 paragraph
 * per chapter and delegating each section to buildParagraphs.
 * Appendices are ignored in this Step; that lives in a later Step.
 */
export function buildDocument(pack: TemplatePack, data: RenderData): Document {
  const children: Paragraph[] = [];

  for (const chapter of pack.chapters) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun(chapter.title)],
      })
    );

    for (const section of chapter.sections) {
      children.push(...buildParagraphs(section, data));
    }
  }

  return new Document({
    sections: [{ children }],
  });
}
