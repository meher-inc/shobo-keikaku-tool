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
  buildKawasakiAppendices,
  buildKawasakiAppendixList,
} from "../builders/kawasaki/appendices";
import { toRenderData } from "./to-render-data";
import kawasakiCityFull from "../templates/kawasaki-city.full.json";

/**
 * Build the Kawasaki City Fire Bureau 防火・単一権原用（甲種）消防計画
 * (第１条〜第45条 + 附則) from kawasaki-city.full.json.
 *
 * 出典: 川崎市「消防計画作成（変更）届出書」作成例 No.1（防火・単一権原用 甲種）
 *   https://www.city.kawasaki.jp/bousai/category/291-2-8-7-0-0-0-0-0-0.html
 *
 * 札幌(sapporo-full)同様の構成。川崎は条建て（第N条）で、第５条の
 * 防火管理業務の一部委託は様式上〔該当・非該当〕のチェック式のため
 * 常時 emit（節ゲーティングはしない）。別表（別表１〜７）は
 * plan !== "light" のとき結合する。
 */

export const KawasakiFormSchema = z
  .object({
    building_name: z.string().optional(),
    company_name: z.string().optional(),

    // 別表6（自衛消防の組織）の班員
    leader_name: z.string().optional(),
    tsuhou_member: z.string().optional(),
    shoka_member: z.string().optional(),
    hinan_member: z.string().optional(),
    kyugo_member: z.string().optional(),
    anzen_member: z.string().optional(),

    plan: z.enum(["light", "standard", "premium"]).optional(),
  })
  .passthrough();
export type KawasakiForm = z.infer<typeof KawasakiFormSchema>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function buildKawasakiFull(form: any): Promise<Buffer> {
  const loaded = loadPack(kawasakiCityFull);
  const data = toRenderData((form ?? {}) as Record<string, unknown>);

  extendForKawasaki(data, form);

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
    subtitle: "【防火・単一権原用（甲種）】",
  });

  const packChildren = buildChildrenFromPack(loaded, data, overrides);

  const plan = (form?.plan as string) || "standard";
  const includeAppendix = plan !== "light";

  const allChildren: (Paragraph | Table)[] = [
    ...coverChildren,
    ...packChildren,
    ...(includeAppendix ? buildKawasakiAppendixList() : []),
    ...(includeAppendix ? buildKawasakiAppendices(data) : []),
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

// ── kawasaki-specific RenderData extension ─────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extendForKawasaki(data: RenderData, form: any): void {
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
