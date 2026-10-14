import type { Paragraph, Table } from "docx";
import type { RenderData } from "../../helpers/placeholder";
import type { TableTheme } from "../shared/table-helpers";
import { styledTable } from "../shared/table-helpers";
import {
  appendixHeading,
  pageBreak,
  plainText,
  sectionHeading,
  spacerParagraph,
} from "../shared/paragraph-helpers";
import { buildOutsourceStatus } from "../shared/appendices";
import { applicableLabel } from "./logic";

/**
 * Yokohama City Fire Bureau (一般用) appendix builders.
 *
 * Phase 2A scope:
 *   - 別表１ 自主点検チェックリスト           — STUB (TODO Phase 2B)
 *   - 別表２ 自衛消防隊の組織及び任務分担     — STUB (TODO Phase 2B)
 *   - 別表３ 防災センター従事者一覧表          — FULL impl, gated by
 *                                              hasDisasterCenter
 *   - 別表４ 防火管理業務の委託状況表          — FULL impl (delegates to
 *                                              shared buildOutsourceStatus),
 *                                              gated by hasOutsourcedManagement
 *
 * Theme: Phase 2A interim — uses a navy palette (kyoto-equivalent)
 * until yokohama brand colors are confirmed in Phase 2B/2C.
 */

/** Phase 2A interim theme. Brand colors TBD. */
const yokohamaTheme: TableTheme = {
  headerFill: "2B4C7E",
  altFill: "F5F7FA",
};

// ── 別表1: 自主点検チェックリスト (STUB) ──────────────────────────

function buildAppendix1SelfCheck(data: RenderData): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("１", "自主点検チェックリスト"),
    plainText(`建物名：${data.buildingName ?? "　　　　　　"}\u3000\u3000記載年月日：　　年　　月　　日\u3000\u3000記載者：　　　　　`),
    styledTable(
      ["点検項目", "点検内容", "結果"],
      [
        ["避難口・廊下・階段", "避難の障害となる物品が置かれていないか", "良 ・ 否"],
        ["防火戸", "閉鎖の障害となる物品が置かれていないか", "良 ・ 否"],
        ["火気使用設備器具", "周囲に可燃物がなく、適正に使用されているか", "良 ・ 否"],
        ["電気設備", "配線・コンセントに異常はないか", "良 ・ 否"],
        ["消防用設備等", "消火器・誘導灯等の設置場所・外観に異常はないか", "良 ・ 否"],
        ["その他", "　", "良 ・ 否"],
      ],
      [2800, 4200, 2026],
      yokohamaTheme
    ),
  ];
}

// ── 別表2: 自衛消防隊の組織及び任務分担 (STUB) ────────────────────

function buildAppendix2FireBrigade(data: RenderData): (Paragraph | Table)[] {
  const fallback = "(    )";
  return [
    pageBreak(),
    appendixHeading("２", "自衛消防隊の組織及び任務分担"),
    styledTable(
      ["班", "氏名", "任務"],
      [
        ["自衛消防隊長", data.leaderName ?? data.managerName ?? fallback, "自衛消防隊の指揮、消防隊への情報提供"],
        ["通報連絡班", data.tsuhouMember ?? fallback, "119番通報、館内への連絡"],
        ["初期消火班", data.shokaMember ?? fallback, "消火器等による初期消火"],
        ["避難誘導班", data.hinanMember ?? fallback, "在館者の避難誘導、逃げ遅れた者の確認"],
        ["応急救護班", data.kyugoMember ?? fallback, "負傷者の応急手当、救急隊への引継ぎ"],
      ],
      [2500, 3000, 3526],
      yokohamaTheme
    ),
  ];
}

// ── 別表3: 防災センター従事者一覧表 (FULL, gated by hasDisasterCenter) ─

function buildAppendix3DisasterCenter(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("３", "防災センター従事者一覧表"),
    styledTable(
      ["区分", "氏名", "役職", "担当業務", "勤務時間"],
      [
        ["通常時", "(　　　)", "(　　)", "防災センター運用全般", "(　　)"],
        ["夜間", "(　　　)", "(　　)", "宿直対応・通報・初動", "(　　)"],
        ["休日", "(　　　)", "(　　)", "巡回・初期対応", "(　　)"],
      ],
      [1500, 2200, 1500, 2326, 1500],
      yokohamaTheme
    ),
    spacerParagraph(),
    plainText("※防災センターの運用は、防火管理者の指揮の下に行う。"),
  ];
}

// ── 別表4: 防火管理業務の委託状況表 (FULL, gated by hasOutsourcedManagement) ─

function buildAppendix4Outsource(data: RenderData): (Paragraph | Table)[] {
  return buildOutsourceStatus(data, yokohamaTheme, {
    num: "４",
    title: "防火管理業務の委託状況表",
  });
}

// ── 別表等一覧 ────────────────────────────────────────────────

export function buildYokohamaAppendixList(data: RenderData): (Paragraph | Table)[] {
  const outsourced = data.hasOutsourcedManagement === "true";
  const hasDisasterCenter = data.hasDisasterCenter === "true";
  return [
    pageBreak(),
    sectionHeading("別表等一覧"),
    styledTable(
      ["番号", "名称", "必要性"],
      [
        ["別表１", "自主点検チェックリスト", "必須"],
        ["別表２", "自衛消防隊の組織及び任務分担", "必須"],
        ["別表３", "防災センター従事者一覧表", applicableLabel(hasDisasterCenter)],
        ["別表４", "防火管理業務の委託状況表", applicableLabel(outsourced)],
      ],
      [1500, 5526, 2000],
      yokohamaTheme
    ),
  ];
}

// ── Dispatcher ────────────────────────────────────────────────

export function buildYokohamaAppendices(data: RenderData): (Paragraph | Table)[] {
  const outsourced = data.hasOutsourcedManagement === "true";
  const hasDisasterCenter = data.hasDisasterCenter === "true";
  return [
    ...buildAppendix1SelfCheck(data),
    ...buildAppendix2FireBrigade(data),
    ...(hasDisasterCenter ? buildAppendix3DisasterCenter() : []),
    ...(outsourced ? buildAppendix4Outsource(data) : []),
  ];
}
