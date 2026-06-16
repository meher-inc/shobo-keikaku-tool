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
import {
  buildHiroshimaAppendices,
  buildHiroshimaAppendixList,
} from "../builders/hiroshima/appendices";
import { toRenderData } from "./to-render-data";
import hiroshimaCityFull from "../templates/hiroshima-city.full.json";

/**
 * Build the Hiroshima City Fire Bureau 消防計画 (第1章〜第8章 / 第1条〜第25条
 * + 付則) from hiroshima-city.full.json.
 *
 * 出典: 広島市「消防計画（様式）shouboukeikaku_word」
 *   https://www.city.hiroshima.lg.jp/living/shobo-bohan/1006085/1025612/1033050/1033051.html
 *
 * 章・条建て。南海トラフ地震対策（第19条）を含む。別表・別紙は
 * plan !== "light" のとき結合する。
 */

export const HiroshimaFormSchema = z
  .object({
    building_name: z.string().optional(),
    company_name: z.string().optional(),
    leader_name: z.string().optional(),
    tsuhou_member: z.string().optional(),
    shoka_member: z.string().optional(),
    hinan_member: z.string().optional(),
    kyugo_member: z.string().optional(),
    anzen_member: z.string().optional(),
    plan: z.enum(["light", "standard", "premium"]).optional(),
  })
  .passthrough();
export type HiroshimaForm = z.infer<typeof HiroshimaFormSchema>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function buildHiroshimaFull(form: any): Promise<Buffer> {
  const loaded = loadPack(hiroshimaCityFull);
  const data = toRenderData((form ?? {}) as Record<string, unknown>);

  extendForHiroshima(data, form);

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
    subtitle: "【単一権原用】",
  });

  const packChildren = buildChildrenFromPack(loaded, data, overrides);

  const plan = (form?.plan as string) || "standard";
  const includeAppendix = plan !== "light";

  const allChildren: (Paragraph | Table)[] = [
    ...coverChildren,
    ...packChildren,
    ...(includeAppendix ? buildHiroshimaAppendixList() : []),
    ...(includeAppendix ? buildHiroshimaAppendices(data) : []),
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extendForHiroshima(data: RenderData, form: any): void {
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
