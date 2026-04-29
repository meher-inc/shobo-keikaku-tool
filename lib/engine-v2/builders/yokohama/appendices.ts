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

function buildAppendix1SelfCheck(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("１", "自主点検チェックリスト"),
    plainText(
      "（Phase 2B で完全実装：建物名・記載年月日・記載者・項目別の点検結果欄）"
    ),
  ];
}

// ── 別表2: 自衛消防隊の組織及び任務分担 (STUB) ────────────────────

function buildAppendix2FireBrigade(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("２", "自衛消防隊の組織及び任務分担"),
    plainText(
      "（Phase 2B で完全実装：自衛消防隊長／通報連絡班／初期消火班／避難誘導班／応急救護班の編成と任務）"
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
    ...buildAppendix1SelfCheck(),
    ...buildAppendix2FireBrigade(),
    ...(hasDisasterCenter ? buildAppendix3DisasterCenter() : []),
    ...(outsourced ? buildAppendix4Outsource(data) : []),
  ];
}
