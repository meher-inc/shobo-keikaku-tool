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
import {
  buildNagoyaAppendices,
  buildNagoyaAppendixList,
} from "../builders/nagoya/appendices";
import { toRenderData } from "./to-render-data";
import nagoyaCityFull from "../templates/nagoya-city.full.json";

/**
 * Build the Nagoya City Fire Bureau その他用《中規模》 消防計画
 * (第１〜第８章 + 附則) from nagoya-city.full.json (Phase 2A Step 1
 * Option B: 機能別擬似章 8 章グルーピング、13 条フラットを v2
 * ChapterSchema に整理).
 *
 * Mirrors fukuoka-full / yokohama-full / osaka-full structure.
 * Nagoya-specific extensions:
 *   - extendForNagoya() supplies camelCase fields not covered by
 *     toRenderData (planStartDate, reportFrequency + 別表用
 *     ロール別フィールド先取り定義、Phase 2A Step 3 の
 *     builders/nagoya/appendices.ts が消費).
 *   - sectionsToSkip() applies single body-level gating:
 *       hasOutsourcedManagement → 第13条 防火管理業務の一部委託
 *                                  (osaka/fukuoka 同型 single-section
 *                                  skip)
 *
 * 名古屋固有の設計判断 (Phase 1 recon §4.1 / Step 1 commit 505229b):
 *   - 第9条 (東海地震注意情報発表時から警戒宣言が発令されるまでの措置)
 *     + 第10条 (警戒宣言発令時の対応策) は **無条件 emit**。名古屋市
 *     は東海地震防災対策強化地域該当のため。`tokaiQuakeApplicable`
 *     フラグを将来予約として extendForNagoya に含めるが、Phase 2A
 *     範囲では skip-list 影響なし (Phase 2B で動的 gating 拡張余地)。
 *   - 統括防火管理者は recon §4.1 通り chukibo に直接言及なし
 *     (中規模スコープ外)。`requiresUnifiedFpm` フラグは
 *     osaka/fukuoka/yokohama 整合のため受け入れるが、現時点で gating
 *     対象 section が JSON pack に存在しないため skip-list は実質
 *     no-op。Phase 2B で統括関連条文を JSON 追加すれば自動的に gating
 *     動作。
 *   - インラインテーブル (第3/4/6/7条 + 第8条備蓄品/救助救出資機材 +
 *     第11条教育/訓練表) は Step 1 JSON で「下表のとおり」リファレンス
 *     のみ、実テーブル emit は Phase 2B で builders/nagoya/tables/。
 *
 * Phase 2A Step 2: 章本文 + cover + footer のみ。別表は Step 3 で
 * builders/nagoya/appendices.ts を結合する。
 */

/**
 * Form contract for the Nagoya adapter. Documents the snake_case
 * shape that callers (route handler, form UI) supply. Uses
 * .passthrough() so unknown keys flow through to toRenderData
 * without breaking — strict mode would reject benign extra fields.
 */
export const NagoyaFormSchema = z
  .object({
    // Identity
    building_name: z.string().optional(),
    company_name: z.string().optional(),

    // Outsourcing (shared with kyoto/tokyo/osaka/yokohama/fukuoka)
    has_outsourced_management: z.union([z.boolean(), z.string()]).optional(),

    // Yokohama/fukuoka-aligned gating flag (Phase 2A 受け入れのみ、
    // gating 対象 section は Phase 2B 追加予定)
    requires_unified_fpm: z.union([z.boolean(), z.string()]).optional(),

    // Nagoya-specific 将来予約フラグ (推進/強化地域外事業所の保険、
    // Phase 2B で動的 gating 設計時に活用)
    tokai_quake_applicable: z.union([z.boolean(), z.string()]).optional(),

    // Body-level placeholders (Step 1 JSON で定義済 8 keys、横浜/大阪/
    // 福岡命名踏襲、toRenderData 既存マッピング併用)
    inspection_company: z.string().optional(),
    evacuation_site: z.string().optional(),
    outsource_company: z.string().optional(),
    plan_start_date: z.string().optional(),
    report_frequency: z.union([z.number(), z.string()]).optional(),

    // 別表用ロール別フィールド (Step 3 で builders 側が消費、osaka 別表9
    // / fukuoka 別表3 と完全共通命名で cross-dept 再利用可能)
    // 第7条 自衛消防隊の編成 (Phase 2B でテーブル emit)
    leader_name: z.string().optional(),
    defense_sub_leader: z.string().optional(),
    tsuhou_member: z.string().optional(),
    shoka_member: z.string().optional(),
    hinan_member: z.string().optional(),
    kyugo_member: z.string().optional(),
    anzen_member: z.string().optional(),
    // 第3条 予防管理組織 / 第4条 自主検査
    defense_handler: z.string().optional(),
    fire_handler: z.string().optional(),
    inspection_team: z.string().optional(),

    // Plan tier (for include_appendix gating in Step 3)
    plan: z.enum(["light", "standard"]).optional(),
  })
  .passthrough();
export type NagoyaForm = z.infer<typeof NagoyaFormSchema>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function buildNagoyaFull(form: any): Promise<Buffer> {
  const loaded = loadPack(nagoyaCityFull);
  const data = toRenderData((form ?? {}) as Record<string, unknown>);

  extendForNagoya(data, form);

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
  // (e.g. 第3/4/6/7/8/11 条 のインラインテーブル emit) for Phase 2B
  // builders/nagoya/tables/, but Step 2 smoke does not depend on them.
  const overrides: Record<string, SectionOverride> = {};

  const coverChildren = buildCoverPage(data, {
    subtitle: "【中規模防火対象物用】",
  });

  const packChildren = buildChildrenFromPack(filteredPack, data, overrides);

  // ── plan-based appendix gating ─────────────────────────────
  // Mirrors kyoto/tokyo/osaka/yokohama/fukuoka: plan === "light" → no appendices.
  const plan = (form?.plan as string) || "standard";
  const includeAppendix = plan !== "light";

  const allChildren: (Paragraph | Table)[] = [
    ...coverChildren,
    ...packChildren,
    ...(includeAppendix ? buildNagoyaAppendixList(data) : []),
    ...(includeAppendix ? buildNagoyaAppendices(data) : []),
  ];

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

// ── nagoya-specific RenderData extension ───────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extendForNagoya(data: RenderData, form: any): void {
  // 本文 placeholders (Step 1 JSON で定義済 8 keys のうち、toRenderData
  // で既にカバー済の companyName / ownerName / managerName /
  // inspectionCompany / outsourceCompany はここで再設定不要。
  // toRenderData 未カバーの keys のみ extend)
  data.evacuationSite = str(form?.evacuation_site);
  data.planStartDate = str(form?.plan_start_date);
  data.reportFrequency = str(form?.report_frequency);

  // gating flags
  data.requiresUnifiedFpm = str(form?.requires_unified_fpm);
  data.tokaiQuakeApplicable = str(form?.tokai_quake_applicable);

  // 別表用ロール別フィールド先取り定義 (Step 3 builders 消費、
  // osaka 別表9 / fukuoka 別表3 と完全共通命名)
  // 第7条 自衛消防隊の編成
  data.leaderName = str(form?.leader_name);
  data.defenseSubLeader = str(form?.defense_sub_leader);
  data.tsuhouMember = str(form?.tsuhou_member);
  data.shokaMember = str(form?.shoka_member);
  data.hinanMember = str(form?.hinan_member);
  data.kyugoMember = str(form?.kyugo_member);
  data.anzenMember = str(form?.anzen_member);

  // 第3条 予防管理組織 / 第4条 自主検査
  data.defenseHandler = str(form?.defense_handler);
  data.fireHandler = str(form?.fire_handler);
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

  // art13-outsource: only emit when has_outsourced_management is true.
  // osaka/fukuoka 流 single-section skip (Phase 2A 設計判断、第13条のみ
  // が委託対象のため番号 gap 許容、Phase 2B でペア化リファイン候補)
  if (data.hasOutsourcedManagement !== "true") {
    skip.add("art13-outsource");
  }

  // requiresUnifiedFpm: Phase 2A 範囲では gating 対象 section が JSON pack
  // に存在しない (recon §4.1: 中規模スコープでは統括防火管理者言及なし)。
  // Phase 2B で統括関連条文を JSON 追加する場合、ここに skip エントリを
  // 追加する想定。
  // if (data.requiresUnifiedFpm !== "true") {
  //   skip.add("...");
  // }

  // tokaiQuakeApplicable: Phase 2A 範囲では第9-10条を **無条件 emit**
  // (名古屋市は東海地震防災対策強化地域該当)。Phase 2B で推進/強化
  // 地域外事業所向けに skip 拡張する場合、ここに追加。
  // if (data.tokaiQuakeApplicable === "false") {
  //   skip.add("art9-tokai-info");
  //   skip.add("art10-warning-issued");
  // }

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
