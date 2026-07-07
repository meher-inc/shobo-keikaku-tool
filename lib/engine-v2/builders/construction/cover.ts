import { AlignmentType, PageBreak, Paragraph, Table, TextRun } from "docx";
import type { RenderData } from "../../helpers/placeholder";
import { styledTable, type TableTheme } from "../shared/table-helpers";
import { sectionHeading, plainText, pageBreak } from "../shared/paragraph-helpers";
import type { ConstructionDeptMeta } from "./dept-meta";

const GOTHIC = "游ゴシック";
const MINCHO = "游明朝";

// 工事中用はオレンジ系（工事・注意喚起の連想色）で通常計画と区別する。
export const constructionTheme: TableTheme = {
  headerFill: "B25E09",
  altFill: "FBF3E9",
};

// ご提出前に建物・工事固有で追記・確認が必要な代表的事項。
const CHECKLIST = [
  "工事工程表・工事範囲を示した平面図の添付",
  "別表（工事概要書・火気使用工事 事前承認書・危険物品持込届 等）の具体的な記入",
  "施工者（元請・下請）の体制と現場責任者の確定",
  "消防用設備等の機能停止が生じる場合の所轄消防署への事前連絡",
  "届出様式（工事中の消防計画の届出書）は所轄消防署の様式・要否を必ず確認",
  "記載内容が実際の工事内容と一致しているかの最終確認",
];

// 入力した内容を文書冒頭に概要として載せる（通常計画の front matter と
// 同じ狙い。工事関連の入力を必ず文書へ反映し、取りこぼしを防ぐ）。
function buildFrontMatter(data: RenderData, dept: ConstructionDeptMeta): (Paragraph | Table)[] {
  const v = (x?: string) => (x && x.trim() ? x : "（未入力）");
  const addr = [data.prefecture, data.city, data.ward, data.addressDetail].filter(Boolean).join("");
  const scale = [
    data.totalArea ? `${data.totalArea}㎡` : "",
    data.numFloors ? `${data.numFloors}階` : "",
    data.capacity ? `${data.capacity}人` : "",
  ].filter(Boolean).join(" / ");
  const mgr = data.managerName
    ? `${data.managerName}${data.managerQualification ? `（${data.managerQualification}）` : ""}`
    : "";
  const period = [data.constructionStart, data.constructionEnd].filter(Boolean).join(" 〜 ");
  const contractor = [data.contractorName, data.contractorTel].filter(Boolean).join(" / ");
  const emerg = [data.emergencyContactName, data.emergencyContactPhone].filter(Boolean).join(" / ");

  const rows: string[][] = [
    ["所在地", v(addr)],
    ["建物名称", v(data.buildingName)],
    ["用途（令別表第一）", v(data.useCategory)],
    ["規模（面積／階数／収容人員）", v(scale)],
    ["管理権原者", v(data.ownerName)],
    ["防火管理者", v(mgr)],
    ["工事名称", v(data.constructionName)],
    ["工事種別", v(data.constructionType)],
    ["工事範囲", v(data.constructionScope)],
    ["工事期間", v(period)],
    ["施工者（連絡先）", v(contractor)],
    ["現場責任者", v(data.constructionSiteManager)],
    ["停止予定の消防用設備等", v(data.equipmentShutdown)],
    ["緊急連絡先", v(emerg)],
    ["広域避難場所", v(data.wideAreaEvacuationSite)],
    ["一時集合場所", v(data.temporaryAssemblyPoint)],
  ];

  const submitNote = dept.deptName
    ? dept.hasDedicatedForm
      ? `${dept.deptName}管内では工事中の消防計画の届出様式が公表されています。所轄消防署の様式・提出方法をご確認のうえ、本計画を添付してご提出ください。`
      : `${dept.deptName}管内の様式・届出要否は所轄消防署にご確認のうえご提出ください（工事中の消防計画の運用は消防本部ごとに異なります）。`
    : "工事中の消防計画の様式・届出要否は消防本部ごとに異なります。所轄消防署に事前相談のうえご提出ください。";

  return [
    sectionHeading("防火対象物及び工事の概要（ご入力内容）"),
    plainText("本計画は工事中の防火対象物向けの雛形です。下記の入力内容を反映しています。工事固有の事項は追記・確認のうえご提出ください。"),
    styledTable(["項目", "ご入力内容"], rows, [3200, 6200], constructionTheme),
    sectionHeading("ご提出前に追記・確認が必要な事項"),
    ...CHECKLIST.map((c) => plainText(`・${c}`)),
    plainText(""),
    plainText(`※　${submitNote}`),
    pageBreak(),
  ];
}

/**
 * 工事中の消防計画の表紙。
 *
 * shared/cover-page.ts はタイトルが「消防計画」固定のため、工事中用は
 * タイトル「工事中の消防計画」・front matter（工事概要入り）を持つ
 * 専用ビルダーとして分離する（共有ビルダーは変更しない）。
 */
export function buildConstructionCoverPage(
  data: RenderData,
  dept: ConstructionDeptMeta
): (Paragraph | Table)[] {
  const buildingName = data.companyName ?? data.buildingName ?? "（建物名未設定）";
  const creationDate = data.creationDate ?? "";
  const subtitle = dept.deptName
    ? `【工事中の防火対象物用・${dept.deptName}管内】`
    : "【工事中の防火対象物用】";

  return [
    new Paragraph({
      spacing: { before: 4000 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: buildingName, size: 36, bold: true, font: GOTHIC }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200 },
      children: [
        new TextRun({ text: "工事中の消防計画", size: 52, bold: true, font: GOTHIC }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 300 },
      children: [
        new TextRun({ text: subtitle, size: 24, font: GOTHIC, color: "B25E09" }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200 },
      children: [
        new TextRun({ text: `${creationDate}作成`, size: 22, font: MINCHO }),
      ],
    }),
    new Paragraph({ children: [new PageBreak()] }),
    ...buildFrontMatter(data, dept),
  ];
}
