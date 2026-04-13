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

// ── indent heuristic ─────────────────────────────────────────

/**
 * Stateful indent heuristic matching v1's subitem() / si()
 * indent pattern (left: 420 DXA ≈ 7.4mm).
 *
 * Rules (evaluated per line, state carried forward within a body):
 *
 * 0. Numbered item header (⑴⑵⑶…):
 *    indent = 0, nextState = 420
 *    → the item itself is flush-left; its continuation children
 *      should be indented.
 *
 * 1. Marker subitem (ア/イ/ウ, (ア)/(イ), ①/②… after optional
 *    leading full-width spaces):
 *    indent = 420, nextState = 420
 *
 * 2. Continuation (starts with full-width space 「　」 but no
 *    marker after stripping leading spaces):
 *    indent = inherit lastIndentLevel, nextState unchanged
 *
 * 3. Default (anything else):
 *    indent = 0, nextState = 0
 */

// Parenthesized numbers ⑴-⑿ (U+2474–U+247F).
const NUMBERED_ITEM_RE = /^[\u2474-\u247F]/;

// Subitem markers: katakana ア-ン + fullwidth space, or
// parenthesized katakana/number, or circled numbers ①-⑳.
const SUBITEM_MARKER_RE = /^[ア-ン]\u3000|^\([ア-ン0-9]+\)|^[①-⑳]/;

const FULLWIDTH_SPACE = "\u3000";
const SUBITEM_INDENT = 420; // DXA

interface IndentResult {
  indent: number;
  nextState: number;
}

export function determineIndent(line: string, lastIndentLevel: number): IndentResult {
  // Rule 0: numbered item header ⑴⑵⑶…
  if (NUMBERED_ITEM_RE.test(line)) {
    return { indent: 0, nextState: SUBITEM_INDENT };
  }

  // Strip leading full-width spaces for marker detection.
  const stripped = line.replace(/^\u3000+/, "");

  // Rule 1: marker subitem
  if (SUBITEM_MARKER_RE.test(stripped)) {
    return { indent: SUBITEM_INDENT, nextState: SUBITEM_INDENT };
  }

  // Rule 2: continuation — starts with 「　」 but no marker
  if (line.startsWith(FULLWIDTH_SPACE)) {
    return { indent: lastIndentLevel, nextState: lastIndentLevel };
  }

  // Rule 3: default
  return { indent: 0, nextState: 0 };
}

// ── body builder ─────────────────────────────────────────────

/**
 * Build the body paragraphs for a section from its JSON body.
 *
 * The resolved body string is split on "\n" so a section that
 * needs multiple paragraphs (e.g. a numbered item list) can put
 * them in a single text node separated by newlines.
 *
 * Each line is passed through the indent heuristic to reproduce
 * v1's subitem indent (left: 420 DXA) on ア/イ/ウ markers,
 * circled numbers, and continuation lines under numbered items.
 */
export function buildSectionBody(section: Section, data: RenderData): Paragraph[] {
  const out: Paragraph[] = [];
  const bodyText = resolveBody(section.body, data);
  if (bodyText === "") return out;

  let lastIndentLevel = 0;

  for (const line of bodyText.split("\n")) {
    if (line === "") continue;

    const { indent, nextState } = determineIndent(line, lastIndentLevel);
    lastIndentLevel = nextState;

    out.push(
      new Paragraph({
        ...(indent > 0 ? { indent: { left: indent } } : {}),
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
