import { AlignmentType, PageBreak, Paragraph, Table, TextRun } from "docx";
import type { RenderData } from "../../helpers/placeholder";
import { styledTable, type TableTheme } from "./table-helpers";
import { sectionHeading, plainText, pageBreak } from "./paragraph-helpers";

const SUMMARY_THEME: TableTheme = { headerFill: "2E5F9E", altFill: "EEF4FA" };

// ご提出前に建物固有で追記・確認が必要な代表的事項。
const CHECKLIST = [
  "自衛消防組織の編成（各班の担当者・任務分担）— 規模により別表へ記入",
  "各階の平面図・避難経路図の添付",
  "別表（自主検査表・点検計画表・火元責任者の区域別割当 等）の具体的な記入",
  "消防用設備等の各階ごとの設置場所・数量",
  "管轄消防署から個別に求められた事項",
  "記載内容が自施設の実態と一致しているかの最終確認",
];

// 入力した内容を文書冒頭に概要として載せる（様式にプレースホルダが無い項目も
// 必ず文書へ反映されるようにし、入力の取りこぼしを防ぐ）。
function buildFrontMatter(data: RenderData): (Paragraph | Table)[] {
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
  const equip = (data.fireEquipmentList || "").replace(/,/g, "、");
  const emerg = [data.emergencyContactName, data.emergencyContactPhone].filter(Boolean).join(" / ");
  const team = [
    data.leaderName ? `隊長:${data.leaderName}` : "",
    data.tsuhouMember ? `通報:${data.tsuhouMember}` : "",
    data.shokaMember ? `初期消火:${data.shokaMember}` : "",
    data.hinanMember ? `避難誘導:${data.hinanMember}` : "",
    data.kyugoMember ? `救護:${data.kyugoMember}` : "",
    data.anzenMember ? `安全:${data.anzenMember}` : "",
  ].filter(Boolean).join(" / ");

  const rows: string[][] = [
    ["所在地", v(addr)],
    ["建物名称", v(data.buildingName)],
    ["用途（令別表第一）", v(data.useCategory)],
    ["規模（面積／階数／収容人員）", v(scale)],
    ["管理権原者", v(data.ownerName)],
    ["防火管理者", v(mgr)],
    ["選任年月日", v(data.managerAppointmentDate)],
    ["防火管理者 連絡先", v(data.managerContact)],
    ["設置している消防用設備等", v(equip)],
    ["緊急連絡先", v(emerg)],
    ["広域避難場所", v(data.wideAreaEvacuationSite)],
    ["一時集合場所", v(data.temporaryAssemblyPoint)],
    ["訓練実施月", v(data.drillMonths)],
    ["防災教育実施月", v(data.educationMonths)],
    ["自衛消防隊（各班の担当者）", v(team)],
  ];

  return [
    sectionHeading("防火対象物の概要（ご入力内容）"),
    plainText("本計画は所轄消防本部の様式に準拠した雛形です。下記の入力内容を反映しています。建物固有の事項は追記・確認のうえご提出ください。"),
    styledTable(["項目", "ご入力内容"], rows, [3200, 6200], SUMMARY_THEME),
    sectionHeading("ご提出前に追記・確認が必要な事項"),
    ...CHECKLIST.map((c) => plainText(`・${c}`)),
    pageBreak(),
  ];
}

/**
 * Cover page builder — shared across all dept packs.
 *
 * Produces a centered title page with building name, "消防計画"
 * heading, a dept-specific subtitle line, and a creation date,
 * followed by a page break to push the body to page 2.
 *
 * Ported from:
 * - Kyoto: lib/generate_kyoto_full.js L222-233
 * - Tokyo: lib/generate_tokyo_full.js L257-263
 */

const GOTHIC = "游ゴシック";
const MINCHO = "游明朝";

export type CoverPageOpts = {
  /** Line 3: dept-specific subtitle (e.g. "統括防火管理〔非該当〕" or "【中規模用】"). */
  subtitle: string;
  /** Optional colour for the subtitle TextRun (hex without #). */
  subtitleColor?: string;
  /** Font size for the subtitle line (half-points). Default 22. */
  subtitleSize?: number;
};

export function buildCoverPage(data: RenderData, opts: CoverPageOpts): (Paragraph | Table)[] {
  const buildingName = data.companyName ?? data.buildingName ?? "（建物名未設定）";
  const creationDate = data.creationDate ?? "";

  return [
    // Line 1: building / company name — large, bold, vertically offset
    new Paragraph({
      spacing: { before: 4000 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: buildingName, size: 36, bold: true, font: GOTHIC }),
      ],
    }),
    // Line 2: "消防計画" title
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200 },
      children: [
        new TextRun({ text: "消防計画", size: 56, bold: true, font: GOTHIC }),
      ],
    }),
    // Line 3: dept-specific subtitle
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: opts.subtitleColor ? 300 : 600 },
      children: [
        new TextRun({
          text: opts.subtitle,
          size: opts.subtitleSize ?? 22,
          font: opts.subtitleColor ? GOTHIC : MINCHO,
          ...(opts.subtitleColor ? { color: opts.subtitleColor } : {}),
        }),
      ],
    }),
    // Line 4: creation date
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200 },
      children: [
        new TextRun({ text: `${creationDate}作成`, size: 22, font: MINCHO }),
      ],
    }),
    // Page break to push body to page 2
    new Paragraph({ children: [new PageBreak()] }),
    // 入力内容の概要＋追記チェックリスト（全packで共通付与）
    ...buildFrontMatter(data),
  ];
}
