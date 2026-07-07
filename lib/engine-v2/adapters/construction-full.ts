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
import { loadPack } from "../engine";
import type { RenderData } from "../helpers/placeholder";
import type { TemplatePack, Chapter, Section } from "../types/template-pack";
import { buildChildrenFromPack } from "../builders/document";
import { buildFloorPlanGuide } from "../builders/shared/floor-plan-guide";
import { toRenderData } from "./to-render-data";
import type { V2Pack } from "./generate-plan";
import { constructionDeptMeta } from "../builders/construction/dept-meta";
import { buildConstructionCoverPage } from "../builders/construction/cover";
import {
  buildConstructionAppendices,
  buildConstructionAppendixList,
} from "../builders/construction/appendices";
import constructionFull from "../templates/construction.full.json";

/**
 * 工事中の消防計画（工事中の防火対象物用）を生成する。
 *
 * 通常計画と異なり、計画本体は全国共通テンプレート
 * （construction.full.json）を使い、所轄消防本部名は表紙・提出案内の
 * メタデータとしてのみ差し替える（builders/construction/dept-meta.ts）。
 * これは工事中の消防計画の公表様式が消防本部間で揃っていないためで、
 * 都市別専用テンプレートが整い次第、通常計画と同様にここで分岐する。
 *
 * form.plan_kind === "construction" のとき runV2Adapter から呼ばれる。
 * basePack には city-dispatch が所在地から選んだ通常計画の pack が
 * 渡ってくるので、それをキーに所轄メタデータを引く。
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function buildConstructionFull(form: any, basePack: V2Pack): Promise<Buffer> {
  const loaded = loadPack(constructionFull);
  const data = toRenderData((form ?? {}) as Record<string, unknown>);
  const dept = constructionDeptMeta(basePack, data.city);

  // 附則 eraDate — default to "now" if caller didn't supply one.
  if (!data.creationDateIso) {
    data.creationDateIso = new Date().toISOString();
  }
  if (!data.creationDate && data.creationDateIso) {
    const d = new Date(data.creationDateIso);
    if (!Number.isNaN(d.getTime())) {
      data.creationDate = d.toLocaleDateString("ja-JP-u-ca-japanese", {
        era: "long", year: "numeric", month: "long", day: "numeric",
      });
    }
  }

  // ── section filtering ─────────────────────────────────────
  // ch2-occupied は「使用（営業）しながらの工事」のときだけ載せる。
  const filteredPack = filterPack(loaded, data);

  // ── cover page ─────────────────────────────────────────────
  const coverChildren = buildConstructionCoverPage(data, dept);

  // ── plan-based appendix gating（通常計画と同じ: light は本体のみ）──
  const plan = (form?.plan as string) || "standard";
  const includeAppendix = plan !== "light";

  // ── assemble ──────────────────────────────────────────────
  const packChildren = buildChildrenFromPack(filteredPack, data);

  const allChildren: (Paragraph | Table)[] = [
    ...coverChildren,
    ...packChildren,
    ...(includeAppendix ? buildConstructionAppendixList() : []),
    ...(includeAppendix ? buildConstructionAppendices(data) : []),
  ];

  // 末尾に各階平面図（工事範囲記入用）テンプレートを同梱
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

// ── pack filtering helpers ────────────────────────────────────

function sectionsToSkip(data: RenderData): Set<string> {
  const skip = new Set<string>();

  // ch2-occupied: 使用（営業）と並行しない工事（全面閉鎖・新築等）では省く。
  if (data.occupiedDuringConstruction !== "true") {
    skip.add("ch2-occupied");
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
