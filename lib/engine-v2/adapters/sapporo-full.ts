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
import { buildFloorPlanGuide } from "../builders/shared/floor-plan-guide";
import {
  buildSapporoAppendices,
  buildSapporoAppendixList,
} from "../builders/sapporo/appendices";
import { toRenderData } from "./to-render-data";
import sapporoCityFull from "../templates/sapporo-city.full.json";

/**
 * Build the Sapporo City Fire Bureau 中規模用 消防計画 (第１〜第17 + 附則)
 * from sapporo-city.full.json.
 *
 * 出典: 札幌市「消防計画作成（変更）届出」本文様式（中規模用）
 *   https://www3.city.sapporo.jp/download/shinsei/search/procedure_view.asp?ProcID=638
 *
 * Mirrors osaka-full structure:
 *   - toRenderData が共通の snake_case フォームを camelCase へ変換。
 *   - extendForSapporo() が別表で使う 班員 フィールドを補う。
 *   - sectionsToSkip() が「第３ 防火管理業務の一部委託（該当する場合のみ）」を
 *     has_outsourced_management が真でないとき省く。
 *   - 別表（別表１〜３）は plan !== "light" のとき結合する。
 */

export const SapporoFormSchema = z
  .object({
    building_name: z.string().optional(),
    company_name: z.string().optional(),
    has_outsourced_management: z.union([z.boolean(), z.string()]).optional(),

    // 別表2・3（自衛消防隊／休日夜間編成）の班員
    leader_name: z.string().optional(),
    tsuhou_member: z.string().optional(),
    shoka_member: z.string().optional(),
    hinan_member: z.string().optional(),
    kyugo_member: z.string().optional(),

    plan: z.enum(["light", "standard", "premium"]).optional(),
  })
  .passthrough();
export type SapporoForm = z.infer<typeof SapporoFormSchema>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function buildSapporoFull(form: any): Promise<Buffer> {
  const loaded = loadPack(sapporoCityFull);
  const data = toRenderData((form ?? {}) as Record<string, unknown>);

  extendForSapporo(data, form);

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

  const overrides: Record<string, SectionOverride> = {};

  const coverChildren = buildCoverPage(data, {
    subtitle: "【中規模用】",
  });

  const packChildren = buildChildrenFromPack(filteredPack, data, overrides);

  // plan === "light" → 別表なし（kyoto/osaka と同じゲーティング）。
  const plan = (form?.plan as string) || "standard";
  const includeAppendix = plan !== "light";

  const allChildren: (Paragraph | Table)[] = [
    ...coverChildren,
    ...packChildren,
    ...(includeAppendix ? buildSapporoAppendixList() : []),
    ...(includeAppendix ? buildSapporoAppendices(data) : []),
  ];

  // 末尾に各階平面図・避難経路図の記入用テンプレートを同梱

  allChildren.push(...buildFloorPlanGuide(data));


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

// ── sapporo-specific RenderData extension ──────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extendForSapporo(data: RenderData, form: any): void {
  data.leaderName = str(form?.leader_name);
  data.tsuhouMember = str(form?.tsuhou_member);
  data.shokaMember = str(form?.shoka_member);
  data.hinanMember = str(form?.hinan_member);
  data.kyugoMember = str(form?.kyugo_member);
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

  // 第３ 防火管理業務の一部委託（該当する場合のみ）:
  // has_outsourced_management が真のときのみ emit。
  if (data.hasOutsourcedManagement !== "true") {
    skip.add("ch3-outsource");
  }

  return skip;
}

function filterPack(pack: TemplatePack, data: RenderData): TemplatePack {
  const skip = sectionsToSkip(data);
  if (skip.size === 0) return pack;

  return {
    ...pack,
    chapters: pack.chapters
      .map((chapter: Chapter) => ({
        ...chapter,
        sections: chapter.sections.filter(
          (section: Section) => !skip.has(section.id)
        ),
      }))
      // 単独章（第３ 一部委託）が空になった場合は章ごと省く。
      // 番号ギャップは osaka の設計判断 #7 と同様に許容する。
      .filter((chapter: Chapter) => chapter.sections.length > 0),
  };
}
