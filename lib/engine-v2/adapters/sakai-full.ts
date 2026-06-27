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
import { buildChildrenFromPack, type SectionOverride } from "../builders/document";
import { buildCoverPage } from "../builders/shared/cover-page";
import { buildFloorPlanGuide } from "../builders/shared/floor-plan-guide";
import {
  buildSakaiAppendices,
  buildSakaiAppendixList,
} from "../builders/sakai/appendices";
import { toRenderData } from "./to-render-data";
import sakaiCityFull from "../templates/sakai-city.full.json";

/**
 * Build the Sakai City Fire Bureau 中規模用 消防計画 from
 * sakai-city.full.json.
 *
 * 出典: 堺市「消防計画（中規模事業所用）keikaku3」
 *   https://www.city.sakai.lg.jp/kurashi/bosai/shobo/shinsei/bokakanri/index.html
 *
 * 札幌(sapporo-full)同様の節建て構成。別表（別表１〜１２）は
 * plan !== "light" のとき結合する。
 */

export const SakaiFormSchema = z
  .object({
    building_name: z.string().optional(),
    company_name: z.string().optional(),

    // 別表7（自衛消防の組織における編成及び主な任務）の班員
    leader_name: z.string().optional(),
    tsuhou_member: z.string().optional(),
    shoka_member: z.string().optional(),
    hinan_member: z.string().optional(),
    kyugo_member: z.string().optional(),
    anzen_member: z.string().optional(),

    plan: z.enum(["light", "standard", "premium"]).optional(),
  })
  .passthrough();
export type SakaiForm = z.infer<typeof SakaiFormSchema>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function buildSakaiFull(form: any): Promise<Buffer> {
  const loaded = loadPack(sakaiCityFull);
  const data = toRenderData((form ?? {}) as Record<string, unknown>);

  extendForSakai(data, form);

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

  const overrides: Record<string, SectionOverride> = {};

  const coverChildren = buildCoverPage(data, {
    subtitle: "【中規模用】",
  });

  const packChildren = buildChildrenFromPack(loaded, data, overrides);

  const plan = (form?.plan as string) || "standard";
  const includeAppendix = plan !== "light";

  const allChildren: (Paragraph | Table)[] = [
    ...coverChildren,
    ...packChildren,
    ...(includeAppendix ? buildSakaiAppendixList() : []),
    ...(includeAppendix ? buildSakaiAppendices(data) : []),
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

// ── sakai-specific RenderData extension ──────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extendForSakai(data: RenderData, form: any): void {
  data.leaderName = str(form?.leader_name);
  data.tsuhouMember = str(form?.tsuhou_member);
  data.shokaMember = str(form?.shoka_member);
  data.hinanMember = str(form?.hinan_member);
  data.kyugoMember = str(form?.kyugo_member);
  data.anzenMember = str(form?.anzen_member);
}

function str(v: unknown): string | undefined {
  if (v === undefined || v === null) return undefined;
  if (typeof v === "string") return v.length > 0 ? v : undefined;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return undefined;
}
