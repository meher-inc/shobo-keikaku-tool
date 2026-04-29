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
import osakaCityFull from "../templates/osaka-city.full.json";

/**
 * Build the Osaka City Fire Bureau 中・小規模 (事業所・テナント用)
 * 消防計画 (第１〜第８章) from osaka-city.full.json.
 *
 * Mirrors tokyo-full / yokohama-full structure. Osaka-specific
 * extensions:
 *   - extendForOsaka() supplies camelCase fields not covered by
 *     toRenderData (kengenRange, tsunamiEvac, plus appendix-only
 *     fields used by Step 3 builders).
 *   - sectionsToSkip() applies a single body-level gating flag:
 *       hasOutsourcedManagement → 第１章 4 節「防火・防災管理業務の委託」
 *     The adapter accepts the v1 osaka behavior of "skip section,
 *     leave a number gap" rather than emitting a 〔該当〕/〔非該当〕
 *     placeholder pair (kyoto pattern). See Phase 2A Step 1
 *     design decision #7.
 *
 * Phase 2A Step 2: 章本文 + cover + footer のみ。別表は Step 3 で
 * builders/osaka/appendices.ts を結合する。
 */

/**
 * Form contract for the Osaka adapter. Documents the snake_case
 * shape that callers (route handler, form UI) supply. Uses
 * .passthrough() so unknown keys flow through to toRenderData
 * without breaking — strict mode would reject benign extra fields.
 */
export const OsakaFormSchema = z
  .object({
    // Identity
    building_name: z.string().optional(),
    company_name: z.string().optional(),

    // Outsourcing (shared with kyoto/tokyo/yokohama)
    has_outsourced_management: z.union([z.boolean(), z.string()]).optional(),

    // 第1章 placeholders
    kengen_range: z.string().optional(),

    // 第2章 placeholders
    report_month: z.union([z.number(), z.string()]).optional(),

    // 第6章 (南海トラフ対策) — Osaka-specific
    tsunami_evac: z.string().optional(),

    // 第7章 (教育訓練)
    drill_fire_month1: z.union([z.number(), z.string()]).optional(),
    drill_fire_month2: z.union([z.number(), z.string()]).optional(),
    drill_eq_month: z.union([z.number(), z.string()]).optional(),

    // 第8章 (計画の実施日)
    plan_start_date: z.string().optional(),

    // ── Appendix-only fields (Step 3 builders consume these) ───
    // 別表3 (防火・防災対象物実態把握表)
    building_address: z.string().optional(),
    building_ownership: z.string().optional(),
    building_constructed_date: z.string().optional(),
    building_structure: z.string().optional(),
    floors_above: z.union([z.number(), z.string()]).optional(),
    floors_below: z.union([z.number(), z.string()]).optional(),
    total_area_m2: z.union([z.number(), z.string()]).optional(),
    occupancy: z.union([z.number(), z.string()]).optional(),
    main_usage: z.string().optional(),
    has_hazardous_materials: z.string().optional(),
    fire_equipment_summary: z.string().optional(),

    // 別表2 (災害想定)
    casualty_estimate: z.string().optional(),
    property_damage_estimate: z.string().optional(),

    // 別表8 (非常用物品)
    storage_location: z.string().optional(),

    // 別表9 (地区隊編成)
    leader_name: z.string().optional(),
    tsuhou_member: z.string().optional(),
    shoka_member: z.string().optional(),
    hinan_member: z.string().optional(),
    kyugo_member: z.string().optional(),
    anzen_member: z.string().optional(),

    // 別表1 (委託状況) — additional fields when has_outsourced_management
    itaku_method: z.string().optional(),
    itaku_name: z.string().optional(),
    itaku_address: z.string().optional(),
    itaku_scope: z.string().optional(),
    itaku_hours: z.string().optional(),

    // Plan tier (for include_appendix gating in Step 3)
    plan: z.enum(["light", "standard"]).optional(),
  })
  .passthrough();
export type OsakaForm = z.infer<typeof OsakaFormSchema>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function buildOsakaFull(form: any): Promise<Buffer> {
  const loaded = loadPack(osakaCityFull);
  const data = toRenderData((form ?? {}) as Record<string, unknown>);

  extendForOsaka(data, form);

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
  // for chapter-internal tables, but the smoke path doesn't need them.
  const overrides: Record<string, SectionOverride> = {};

  const coverChildren = buildCoverPage(data, {
    subtitle: "【中・小規模事業所・テナント用】",
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

// ── osaka-specific RenderData extension ────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extendForOsaka(data: RenderData, form: any): void {
  // 第1章 / 第2章 / 第6章 / 第7章 / 第8章 placeholders used in body
  data.kengenRange = str(form?.kengen_range);
  data.reportMonth = str(form?.report_month);
  data.tsunamiEvac = str(form?.tsunami_evac);
  data.drillFireMonth1 = str(form?.drill_fire_month1);
  data.drillFireMonth2 = str(form?.drill_fire_month2);
  data.drillEqMonth = str(form?.drill_eq_month);
  data.planStartDate = str(form?.plan_start_date);

  // ── Appendix-only (Step 3 builders consume these) ─────────────
  // 別表3 (防火・防災対象物実態把握表)
  data.buildingAddress = str(form?.building_address);
  data.buildingOwnership = str(form?.building_ownership);
  data.buildingConstructedDate = str(form?.building_constructed_date);
  data.buildingStructure = str(form?.building_structure);
  data.floorsAbove = str(form?.floors_above);
  data.floorsBelow = str(form?.floors_below);
  data.totalAreaM2 = str(form?.total_area_m2);
  data.occupancy = str(form?.occupancy);
  data.mainUsage = str(form?.main_usage);
  data.hasHazardousMaterials = str(form?.has_hazardous_materials);
  data.fireEquipmentSummary = str(form?.fire_equipment_summary);

  // 別表2 (災害想定)
  data.casualtyEstimate = str(form?.casualty_estimate);
  data.propertyDamageEstimate = str(form?.property_damage_estimate);

  // 別表8 (非常用物品)
  data.storageLocation = str(form?.storage_location);

  // 別表9 (地区隊編成)
  data.leaderName = str(form?.leader_name);
  data.tsuhouMember = str(form?.tsuhou_member);
  data.shokaMember = str(form?.shoka_member);
  data.hinanMember = str(form?.hinan_member);
  data.kyugoMember = str(form?.kyugo_member);
  data.anzenMember = str(form?.anzen_member);

  // 別表1 (委託状況、has_outsourced_management gated)
  data.itakuMethod = str(form?.itaku_method);
  data.itakuName = str(form?.itaku_name);
  data.itakuAddress = str(form?.itaku_address);
  data.itakuScope = str(form?.itaku_scope);
  data.itakuHours = str(form?.itaku_hours);
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

  // ch1-outsource: only emit when has_outsourced_management is true.
  // Phase 2A design decision #7: skip-list single-section approach
  // (number gap is accepted, matching v1 osaka generator behavior).
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
