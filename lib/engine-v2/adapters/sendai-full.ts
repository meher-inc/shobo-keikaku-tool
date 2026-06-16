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
  buildSendaiAppendices,
  buildSendaiAppendixList,
} from "../builders/sendai/appendices";
import { toRenderData } from "./to-render-data";
import sendaiCityFull from "../templates/sendai-city.full.json";

/**
 * Build the Sendai City Fire Bureau オフィスビル用（防火・防災）消防計画
 * (節建て（目的及び適用範囲〜地震対策）) from sendai-city.full.json.
 *
 * 出典: 仙台市「消防計画作成例（大規模用 bouka01）」
 *   https://www.city.sendai.lg.jp/a92906/business/todokede/yousiki/boukabousaikanri.html
 *
 * 川崎(kawasaki-full)同様の構成。神戸は防火・大規模用。
 * 別表（別表１〜８）は plan !== "light" のとき結合する。
 */

export const SendaiFormSchema = z
  .object({
    building_name: z.string().optional(),
    company_name: z.string().optional(),

    // 別表6（自衛消防組織）の班員
    leader_name: z.string().optional(),
    tsuhou_member: z.string().optional(),
    shoka_member: z.string().optional(),
    hinan_member: z.string().optional(),
    kyugo_member: z.string().optional(),
    anzen_member: z.string().optional(),

    plan: z.enum(["light", "standard", "premium"]).optional(),
  })
  .passthrough();
export type SendaiForm = z.infer<typeof SendaiFormSchema>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function buildSendaiFull(form: any): Promise<Buffer> {
  const loaded = loadPack(sendaiCityFull);
  const data = toRenderData((form ?? {}) as Record<string, unknown>);

  extendForSendai(data, form);

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
    subtitle: "【大規模用】",
  });

  const packChildren = buildChildrenFromPack(loaded, data, overrides);

  const plan = (form?.plan as string) || "standard";
  const includeAppendix = plan !== "light";

  const allChildren: (Paragraph | Table)[] = [
    ...coverChildren,
    ...packChildren,
    ...(includeAppendix ? buildSendaiAppendixList() : []),
    ...(includeAppendix ? buildSendaiAppendices(data) : []),
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

// ── sendai-specific RenderData extension ─────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extendForSendai(data: RenderData, form: any): void {
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
