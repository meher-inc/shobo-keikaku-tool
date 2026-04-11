import { HeadingLevel, Paragraph, TextRun } from "docx";
import type { Section } from "../types/template-pack";
import { resolveBody, type RenderData } from "../helpers/placeholder";

/**
 * Build the heading paragraph for a section (HEADING_2 style).
 * Always emitted, even when a SectionOverride is in play — the
 * override only replaces the body, not the heading.
 */
export function buildSectionHeading(section: Section): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun(section.heading)],
  });
}

/**
 * Build the body paragraphs for a section from its JSON body.
 *
 * The resolved body string is split on "\n" so a section that
 * needs multiple paragraphs (e.g. a numbered item list) can put
 * them in a single text node separated by newlines. An empty
 * body produces an empty array so section ordering stays stable
 * even when a SectionOverride will supply the body instead.
 */
export function buildSectionBody(section: Section, data: RenderData): Paragraph[] {
  const out: Paragraph[] = [];
  const bodyText = resolveBody(section.body, data);
  if (bodyText === "") return out;
  for (const line of bodyText.split("\n")) {
    if (line === "") continue;
    out.push(
      new Paragraph({
        children: [new TextRun(line)],
      })
    );
  }
  return out;
}

/**
 * Convenience: build heading + body in one call. Kept for callers
 * that don't need to split the two phases (e.g. the Step 2 sample
 * path).
 */
export function buildParagraphs(section: Section, data: RenderData): Paragraph[] {
  return [buildSectionHeading(section), ...buildSectionBody(section, data)];
}
