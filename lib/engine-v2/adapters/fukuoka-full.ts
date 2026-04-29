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
import fukuokaCityFull from "../templates/fukuoka-city.full.json";

/**
 * Build the Fukuoka City Fire Bureau 中規模防火対象物用 消防計画
 * (第１〜第５章 + 附則 を ch5 末尾に包含) from fukuoka-city.full.json.
 *
 * Mirrors yokohama-full / osaka-full structure. Fukuoka-specific
 * extensions:
 *   - extendForFukuoka() supplies camelCase fields not covered by
 *     toRenderData (8 本文 placeholders + 別表用ロール別フィールド
 *     先取り定義、Phase 2A Step 3 の builders/fukuoka/appendices.ts
 *     が消費)
 *   - sectionsToSkip() applies two body-level gating flags:
 *       hasOutsourcedManagement → 第3条 委託状況等 (osaka 同型
 *                                  single-section skip)
 *       requiresUnifiedFpm     → 第19条 統括防火管理者への報告
 *                                  (yokohama 独立条 gating 同型)
 *
 * Phase 2A Step 2: 章本文 + cover + footer のみ。別表は Step 3 で
 * builders/fukuoka/appendices.ts を結合する。
 */

/**
 * Form contract for the Fukuoka adapter. Documents the snake_case
 * shape that callers (route handler, form UI) supply. Uses
 * .passthrough() so unknown keys flow through to toRenderData
 * without breaking — strict mode would reject benign extra fields.
 */
export const FukuokaFormSchema = z
  .object({
    // Identity
    building_name: z.string().optional(),
    company_name: z.string().optional(),

    // Outsourcing (shared with kyoto/tokyo/osaka/yokohama)
    has_outsourced_management: z.union([z.boolean(), z.string()]).optional(),

    // Yokohama-aligned gating flag (要 SHUN 確定: requiresUnifiedFpm 採用)
    requires_unified_fpm: z.union([z.boolean(), z.string()]).optional(),

    // Body-level placeholders (8 keys、Step 1 JSON で定義済)
    shared_area_inspector: z.string().optional(),
    report_frequency: z.union([z.number(), z.string()]).optional(),
    internal_contact: z.string().optional(),
    disaster_center_name: z.string().optional(),
    temp_assembly_point: z.string().optional(),
    evacuation_site: z.string().optional(),
    plan_start_date: z.string().optional(),

    // 別表用ロール別フィールド (Step 3 で builders 側が消費、横浜命名踏襲)
    // 別表3 自衛消防隊の編成と任務
    leader_name: z.string().optional(),
    defense_sub_leader: z.string().optional(),
    tsuhou_member: z.string().optional(),
    shoka_member: z.string().optional(),
    hinan_member: z.string().optional(),
    kyugo_member: z.string().optional(),
    anzen_member: z.string().optional(),
    // 別表1 火災予防組織編成
    defense_handler: z.string().optional(),
    fire_handler: z.string().optional(),
    // 別表2 自主点検組織編成
    inspection_team: z.string().optional(),

    // Plan tier (for include_appendix gating in Step 3)
    plan: z.enum(["light", "standard"]).optional(),
  })
  .passthrough();
export type FukuokaForm = z.infer<typeof FukuokaFormSchema>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function buildFukuokaFull(form: any): Promise<Buffer> {
  const loaded = loadPack(fukuokaCityFull);
  const data = toRenderData((form ?? {}) as Record<string, unknown>);

  extendForFukuoka(data, form);

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
  // (e.g. inline check tables for arts 13/14/16/33/36/40), but the
  // smoke path doesn't need them.
  const overrides: Record<string, SectionOverride> = {};

  const coverChildren = buildCoverPage(data, {
    subtitle: "【中規模防火対象物用】",
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

// ── fukuoka-specific RenderData extension ──────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extendForFukuoka(data: RenderData, form: any): void {
  // 本文 placeholders (Step 1 JSON で定義済 8 keys)
  data.sharedAreaInspector = str(form?.shared_area_inspector);
  data.reportFrequency = str(form?.report_frequency);
  data.internalContact = str(form?.internal_contact);
  data.disasterCenterName = str(form?.disaster_center_name);
  data.tempAssemblyPoint = str(form?.temp_assembly_point);
  data.evacuationSite = str(form?.evacuation_site);
  data.planStartDate = str(form?.plan_start_date);

  // gating flag (横浜命名踏襲)
  data.requiresUnifiedFpm = str(form?.requires_unified_fpm);

  // 別表用ロール別フィールド先取り定義 (Step 3 builders 消費、
  // 横浜命名踏襲。Step 3 で実装される別表1/2/3 + 別記様式 で参照される)
  // 別表3 自衛消防隊の編成と任務 (osaka 別表9 と同型構造、
  // tsuhouMember 等の osaka と完全共通命名)
  data.leaderName = str(form?.leader_name);
  data.defenseSubLeader = str(form?.defense_sub_leader);
  data.tsuhouMember = str(form?.tsuhou_member);
  data.shokaMember = str(form?.shoka_member);
  data.hinanMember = str(form?.hinan_member);
  data.kyugoMember = str(form?.kyugo_member);
  data.anzenMember = str(form?.anzen_member);

  // 別表1 火災予防のための組織編成
  data.defenseHandler = str(form?.defense_handler);
  data.fireHandler = str(form?.fire_handler);

  // 別表2 自主点検を実施するための組織編成表
  data.inspectionTeam = str(form?.inspection_team);
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

  // ch1-art3-outsource: only emit when has_outsourced_management is true.
  // osaka 流 single-section skip (Phase 2A 設計判断 #2、第3条のみが委託
  // 対象のため番号 gap 許容、Phase 2B でペア化リファイン候補)
  if (data.hasOutsourcedManagement !== "true") {
    skip.add("ch1-art3-outsource");
  }

  // ch2-art19-unified-report: only emit when requires_unified_fpm is true.
  // yokohama 流 独立条 gating (横浜 ch2-art13-2-unified-report と
  // 偶然章番号一致だが意味は別。Phase 2A スコープでは第5条(11)/第25条
  // inline references は無条件 emit、Phase 2B で gating 検討)
  if (data.requiresUnifiedFpm !== "true") {
    skip.add("ch2-art19-unified-report");
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
