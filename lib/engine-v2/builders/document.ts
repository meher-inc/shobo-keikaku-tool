import { Document, HeadingLevel, Paragraph, Table, TextRun } from "docx";
import type { TemplatePack } from "../types/template-pack";
import type { RenderData } from "../helpers/placeholder";
import { buildParagraphs } from "./paragraph";

/**
 * A section-level override: given the current RenderData, return
 * the docx children (paragraphs and/or tables) to emit in place of
 * the section's JSON body. Used by dept-specific adapters to swap
 * in TS-built tables (e.g. kyoto ch3-reports) while keeping the
 * surrounding chapter structure in the JSON pack.
 */
export type SectionOverride = (data: RenderData) => (Paragraph | Table)[];

/**
 * Build just the docx children for a TemplatePack, without wrapping
 * them in a Document. Exposed so adapters can mix pack-sourced
 * content with additional TS-built content (e.g. appendices) before
 * finalising the Document.
 *
 * Section-level overrides let an adapter substitute a TS builder
 * for a specific JSON section, keyed by section.id. Sections not in
 * the override map fall through to the normal buildParagraphs path.
 * Unknown override keys are silently ignored — they simply never
 * match a section and so have no effect.
 */
export function buildChildrenFromPack(
  pack: TemplatePack,
  data: RenderData,
  overrides?: Record<string, SectionOverride>
): (Paragraph | Table)[] {
  const out: (Paragraph | Table)[] = [];

  for (const chapter of pack.chapters) {
    out.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun(chapter.title)],
      })
    );

    for (const section of chapter.sections) {
      const override = overrides?.[section.id];
      if (override) {
        out.push(...override(data));
        continue;
      }
      out.push(...buildParagraphs(section, data));
    }
  }

  return out;
}

/**
 * Build a docx Document from a TemplatePack + render data.
 *
 * This is the Step 2 public API and remains signature-compatible:
 * callers that only need pack-based rendering (sample pack, tests)
 * can keep calling buildDocument() directly. Adapters that need
 * to interleave TS-built content should use buildChildrenFromPack()
 * and wrap the result themselves.
 */
export function buildDocument(pack: TemplatePack, data: RenderData): Document {
  return new Document({
    sections: [{ children: buildChildrenFromPack(pack, data) }],
  });
}
