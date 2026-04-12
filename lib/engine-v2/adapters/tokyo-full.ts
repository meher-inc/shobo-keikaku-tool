import { Document, Packer, Paragraph, Table } from "docx";
import { loadPack } from "../engine";
import type { RenderData } from "../helpers/placeholder";
import type { TemplatePack, Chapter, Section } from "../types/template-pack";
import { buildChildrenFromPack, type SectionOverride } from "../builders/document";
import { toRenderData } from "./to-render-data";
import tokyoTfdFull from "../templates/tokyo-tfd.full.json";

// Tokyo chapter table overrides.
import { buildCh2DutiesTable } from "../builders/tokyo/tables/ch2-duties";
import { buildCh5EducationTable } from "../builders/tokyo/tables/ch5-education";
import { buildCh6ReportsTable } from "../builders/tokyo/tables/ch6-reports";
import { buildCh7EmergencyTable } from "../builders/tokyo/tables/ch7-emergency";
import { buildCh8DrillsTable } from "../builders/tokyo/tables/ch8-drills";

// Appendix builders.
import {
  buildTokyoAppendices,
  buildTokyoAppendixList,
} from "../builders/tokyo/appendices";

/**
 * Build the full Tokyo TFD medium-scale 消防計画 (11 chapters,
 * 帰宅困難者対策, 附則, 別表等一覧, 別表 1-11) from the
 * tokyo-tfd.full.json pack + TS-built tables and appendices.
 *
 * Mirrors the kyoto-full.ts pattern — fully isolated code path
 * so kyoto and tokyo never share mutable state.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function buildTokyoFull(form: any): Promise<Buffer> {
  const loaded = loadPack(tokyoTfdFull);
  const data = toRenderData((form ?? {}) as Record<string, unknown>);

  // 附則 eraDate — default to "now" if caller didn't supply one.
  if (!data.creationDateIso) {
    data.creationDateIso = new Date().toISOString();
  }

  // ── section filtering ─────────────────────────────────────
  // Tokyo has only 1 gatable JSON section (vs kyoto's 2).
  const filteredPack = filterPack(loaded, data);

  // ── section overrides (TS table builders) ─────────────────
  const overrides: Record<string, SectionOverride> = {
    "ch2-manager-duties": () => buildCh2DutiesTable(),
    "ch5-education-schedule": (d) => buildCh5EducationTable(d),
    "ch6-reports": (d) => buildCh6ReportsTable(d),
    "ch7-emergency-contacts": (d) => buildCh7EmergencyTable(d),
    "ch8-drill-schedule": (d) => buildCh8DrillsTable(d),
  };

  // ── assemble ──────────────────────────────────────────────
  const packChildren = buildChildrenFromPack(filteredPack, data, overrides);
  const appendixListChildren = buildTokyoAppendixList();
  const appendixChildren = buildTokyoAppendices(data);

  const allChildren: (Paragraph | Table)[] = [
    ...packChildren,
    ...appendixListChildren,
    ...appendixChildren,
  ];

  const doc = new Document({
    sections: [{ children: allChildren }],
  });

  return Packer.toBuffer(doc);
}

// ── pack filtering helpers ────────────────────────────────────

function sectionsToSkip(data: RenderData): Set<string> {
  const skip = new Set<string>();

  // ch1-outsource: only include when outsourced management is set.
  if (data.hasOutsourcedManagement !== "true") {
    skip.add("ch1-outsource");
  }

  return skip;
}

function filterPack(pack: TemplatePack, data: RenderData): TemplatePack {
  const skip = sectionsToSkip(data);
  if (skip.size === 0) return pack;

  return {
    ...pack,
    chapters: pack.chapters.map((chapter: Chapter) => ({
      ...chapter,
      sections: chapter.sections.filter(
        (section: Section) => !skip.has(section.id)
      ),
    })),
  };
}
