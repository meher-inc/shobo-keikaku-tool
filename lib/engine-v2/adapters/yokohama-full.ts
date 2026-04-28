import {
  AlignmentType,
  Document,
  Footer,
  Packer,
  PageNumber,
  Paragraph,
  Table,
  TextRun,
} from "docx";
import { z } from "zod";
import { loadPack } from "../engine";
import type { RenderData } from "../helpers/placeholder";
import type { TemplatePack, Chapter, Section } from "../types/template-pack";
import { buildChildrenFromPack, type SectionOverride } from "../builders/document";
import { buildCoverPage } from "../builders/shared/cover-page";
import { toRenderData } from "./to-render-data";
import yokohamaCityFull from "../templates/yokohama-city.full.json";

/**
 * Build the full Yokohama City Fire Bureau 一般用 消防計画
 * (第１〜第７章 + 附則) from yokohama-city.full.json.
 *
 * Mirrors kyoto-full / tokyo-full structure. Yokohama-specific
 * extensions:
 *   - extendForYokohama() supplies camelCase fields not covered by
 *     toRenderData (tsunamiEvac, sharedFloors, planStartDate,
 *     educationCount, drillCount).
 *   - sectionsToSkip() applies three gating flags:
 *       hasOutsourcedManagement → 第７章 の３条 (委託)
 *       requiresUnifiedFpm     → 第１章第３条第５項 / 第４条第14号 /
 *                                第２章第13条の２ (統括防火管理者)
 *       hasDisasterCenter       → 別表３ のみ（builders 側で適用）
 *
 * Phase 2A Step 2: 章本文 + cover + footer のみ。別表は Step 3 で
 * builders/yokohama/appendices.ts を結合する。
 */

/**
 * Form contract for the Yokohama adapter. Documents the
 * snake_case shape that callers (route handler, form UI) supply.
 * Uses .passthrough() so unknown keys flow through to toRenderData
 * without breaking — strict mode would reject benign extra fields.
 */
export const YokohamaFormSchema = z
  .object({
    // Identity
    building_name: z.string().optional(),
    company_name: z.string().optional(),

    // Outsourcing (shared with kyoto/tokyo)
    has_outsourced_management: z.union([z.boolean(), z.string()]).optional(),
    outsource_company: z.string().optional(),

    // Yokohama-specific gating flags
    requires_unified_fpm: z.union([z.boolean(), z.string()]).optional(),
    has_disaster_center: z.union([z.boolean(), z.string()]).optional(),

    // Yokohama-specific placeholders
    tsunami_evac: z.string().optional(),
    shared_floors: z.string().optional(),
    plan_start_date: z.string().optional(),
    education_count: z.union([z.number(), z.string()]).optional(),
    drill_count: z.union([z.number(), z.string()]).optional(),
    wide_area_evacuation_site: z.string().optional(),

    // Plan tier (for include_appendix gating in Step 3)
    plan: z.enum(["light", "standard"]).optional(),
  })
  .passthrough();
export type YokohamaForm = z.infer<typeof YokohamaFormSchema>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function buildYokohamaFull(form: any): Promise<Buffer> {
  const loaded = loadPack(yokohamaCityFull);
  const data = toRenderData((form ?? {}) as Record<string, unknown>);

  extendForYokohama(data, form);

  // 附則 / cover date — set defaults if caller didn't supply.
  if (!data.creationDateIso) {
    data.creationDateIso = new Date().toISOString();
  }
  if (!data.creationDate && data.creationDateIso) {
    const d = new Date(data.creationDateIso);
    if (!Number.isNaN(d.getTime())) {
      data.creationDate = d.toLocaleDateString("ja-JP-u-ca-japanese", {
        era: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  }

  const filteredPack = filterPack(loaded, data);

  // No TS table overrides in Phase 2A Step 2 — Step 3 may add some
  // (e.g. Article 5 reports table, Article 7 responsibility table)
  // but the smoke test path doesn't depend on them.
  const overrides: Record<string, SectionOverride> = {};

  const coverChildren = buildCoverPage(data, {
    subtitle: "【一般用】",
  });

  const packChildren = buildChildrenFromPack(filteredPack, data, overrides);

  const allChildren: (Paragraph | Table)[] = [...coverChildren, ...packChildren];

  const doc = new Document({
    sections: [
      {
        properties: {
          titlePage: true,
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ children: [PageNumber.CURRENT], size: 18, font: "游ゴシック" }),
                  new TextRun({ text: " / ", size: 18, font: "游ゴシック" }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, font: "游ゴシック" }),
                ],
              }),
            ],
          }),
        },
        children: allChildren,
      },
    ],
  });

  return Packer.toBuffer(doc);
}

// ── yokohama-specific RenderData extension ─────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extendForYokohama(data: RenderData, form: any): void {
  data.tsunamiEvac = str(form?.tsunami_evac);
  data.sharedFloors = str(form?.shared_floors);
  data.planStartDate = str(form?.plan_start_date);
  data.educationCount = str(form?.education_count);
  data.drillCount = str(form?.drill_count);

  data.requiresUnifiedFpm = str(form?.requires_unified_fpm);
  data.hasDisasterCenter = str(form?.has_disaster_center);
}

function str(v: unknown): string | undefined {
  if (v === undefined || v === null) return undefined;
  if (typeof v === "string") return v.length > 0 ? v : undefined;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return undefined;
}

// ── pack filtering helpers ─────────────────────────────────────

function sectionsToSkip(data: RenderData): Set<string> {
  const skip = new Set<string>();

  if (data.hasOutsourcedManagement !== "true") {
    skip.add("ch7-art56-outsource");
    skip.add("ch7-art57-command");
    skip.add("ch7-art58-report");
  }

  if (data.requiresUnifiedFpm !== "true") {
    skip.add("ch1-art3-unified-clause");
    skip.add("ch1-art4-unified-clause");
    skip.add("ch2-art13-2-unified-report");
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
