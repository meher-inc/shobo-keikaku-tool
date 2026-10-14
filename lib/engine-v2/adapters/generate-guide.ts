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
import { toRenderData } from "./to-render-data";
import type { V2Pack } from "./generate-plan";
import { PLAN_CHECKLIST } from "../builders/shared/cover-page";
import { buildFloorPlanGuide } from "../builders/shared/floor-plan-guide";
import { plainText, sectionHeading } from "../builders/shared/paragraph-helpers";
import { CONSTRUCTION_CHECKLIST, constructionSubmitNote } from "../builders/construction/cover";
import { constructionDeptMeta } from "../builders/construction/dept-meta";

const GOTHIC = "游ゴシック";

/**
 * 提出前チェックシート（提出しない案内用のWord）。
 *
 * 提出用の消防計画とは別ファイルにして、次の案内だけを載せる。
 *   - ご提出前に追記・確認が必要な事項
 *   - （工事中の計画のみ）所轄ごとの届出の注意
 *   - 作成後の提出のしかた
 *   - 各階平面図・避難経路図の記入用テンプレート
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function buildPlanGuide(form: any, pack: V2Pack): Promise<Buffer> {
  const data = toRenderData((form ?? {}) as Record<string, unknown>);
  const isConstruction = form?.plan_kind === "construction" && pack !== "sample";
  const name = data.companyName ?? data.buildingName ?? "";

  const checklist = isConstruction ? CONSTRUCTION_CHECKLIST : PLAN_CHECKLIST;
  const children: (Paragraph | Table)[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [new TextRun({ text: "消防計画 提出前チェックシート", size: 36, bold: true, font: GOTHIC })],
    }),
    ...(name
      ? [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 },
            children: [new TextRun({ text: name, size: 24, font: GOTHIC })],
          }),
        ]
      : []),
    plainText(
      "この提出前チェックシートは、消防計画を提出する前の確認と準備のための資料です。所轄の消防署へ提出するのは、別ファイルの消防計画（提出用）です。この提出前チェックシートは提出しません。"
    ),
    sectionHeading(isConstruction ? "ご提出前に追記・確認が必要な事項（工事中の消防計画）" : "ご提出前に追記・確認が必要な事項"),
    ...checklist.map((c) => plainText(`・${c}`)),
  ];
  if (isConstruction) {
    children.push(plainText(""), plainText(`※　${constructionSubmitNote(constructionDeptMeta(pack, data.city))}`));
  }
  children.push(...buildFloorPlanGuide(data));

  const doc = new Document({
    sections: [
      {
        properties: {
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
                  new TextRun({ text: "提出前チェックシート（提出不要）  ", size: 18, font: GOTHIC }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 18, font: GOTHIC }),
                  new TextRun({ text: " / ", size: 18, font: GOTHIC }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, font: GOTHIC }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });
  return Packer.toBuffer(doc);
}
