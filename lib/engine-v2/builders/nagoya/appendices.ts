import type { Paragraph, Table } from "docx";
import type { RenderData } from "../../helpers/placeholder";
import type { TableTheme } from "../shared/table-helpers";
import { styledTable } from "../shared/table-helpers";
import {
  appendixHeading,
  pageBreak,
  plainText,
  sectionHeading,
} from "../shared/paragraph-helpers";
import { applicableLabel } from "./logic";

/**
 * Nagoya City Fire Bureau (その他用《中規模》) appendix builders.
 *
 * Phase 2A scope (recon §9.5 + claude.ai 指示書 9-2 採用):
 *   - 別表1 予防管理組織編成 (第3条由来)        — STUB (TODO Phase 2B)
 *   - 別表2 自主点検チェックリスト (第4/6条由来) — STUB (TODO Phase 2B)
 *   - 別表3 自衛消防隊の編成と任務 (第7条由来)    — FULL impl
 *                                                   (osaka 別表9 / fukuoka
 *                                                   別表3 と同型構造、
 *                                                   shared プリミティブ
 *                                                   への委譲方式)
 *   - 別記様式 防火管理業務の委託状況票 (第13条) — FULL impl
 *                                                   gated by
 *                                                   hasOutsourcedManagement
 *                                                   (第13条本文と 2 重 gating
 *                                                   整合、福岡同パターン)
 *
 * 名古屋公式 sonota.doc は別表参照が委託状況票のみだが、A 案採用
 * (claude.ai 指示書 9-3) で kyoto/tokyo/osaka/yokohama/fukuoka と同形式の
 * dispatcher を持ち、6 dept 整合を維持。別表1/2 は要領 + 福岡パターン
 * 整合のための placeholder で、Phase 2B でテーブル emit。
 *
 * Theme: Phase 2A interim — 名古屋市公式ブランドカラー (ライトオレンジ
 * 系)。osaka 濃緑 / yokohama navy / fukuoka 紺青 と区別可能な色相。
 * Phase 2B でブランドカラー一括確定予定。
 */

/** Phase 2A interim theme — 名古屋市ライトオレンジ系。Brand color TBD. */
const nagoyaTheme: TableTheme = {
  headerFill: "D77A1F",
  altFill: "FCF3E8",
};

// ── 別表1: 予防管理組織編成 (STUB) ─────────────────────────────

function buildAppendix1PreventionOrgStub(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("１", "予防管理組織編成"),
    plainText(
      "（Phase 2B で完全実装：階・区域 × 防火管理者・防火担当責任者・火元責任者の任務分担表、第3条のインラインテーブル由来）"
    ),
  ];
}

// ── 別表2: 自主点検チェックリスト (STUB) ────────────────────────

function buildAppendix2InspectionChecklistStub(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("２", "自主点検チェックリスト"),
    plainText(
      "（Phase 2B で完全実装：第4条 建築物等の自主検査票 + 第6条 消防用設備等の法定点検時期表、検査対象 × 実施月日 / 機器点検 × 総合点検）"
    ),
  ];
}

// ── 別表3: 自衛消防隊の編成と任務 (FULL) ───────────────────────

/**
 * 別表3 builder. osaka 別表9 / fukuoka 別表3 と同型構造。
 * shared プリミティブ (styledTable + appendixHeading + pageBreak) への
 * 委譲方式で実装。
 *
 * Each row uses 自衛消防隊 role fields, placeholder names are
 * intentionally aligned with osaka/fukuoka (leaderName, tsuhouMember,
 * shokaMember, hinanMember, kyugoMember, anzenMember) for cross-dept
 * placeholder reuse — adapter Step 2 で extendForNagoya に共通命名で
 * 先取り定義済。
 *
 * 名古屋固有の任務テキスト (第7条 chukibo 由来):
 *   - 隊長:      「全体の指揮、消防隊との連携」
 *   - 通報連絡班: 「119番で消防機関へ通報、事務所内への非常放送、関係者への連絡」
 *   - 消火班:    「消火器等による初期消火」
 *   - 避難誘導班: 「出火時における避難者の誘導、逃げ遅れた者の確認、避難器具による避難」
 *   - 救護班:    「負傷者の応急手当 (＊ 必要に応じ組織)」
 *   - 安全防護班: 「防火戸閉鎖、危険物の除去 (＊ 必要に応じ組織)」
 *
 * osaka 別表9 / fukuoka 別表3 との差分:
 *   - 班 naming (osaka と同じ「○○班」、fukuoka の「○○係」とは異なる)
 *   - 副隊長行なし (fukuoka 第25条2項 由来の副隊長は名古屋公式にない)
 *   - 救護班 + 安全防護班は「必要に応じ組織」表記 (chukibo 第7条 末尾)
 */
function buildAppendix3FireBrigade(data: RenderData): (Paragraph | Table)[] {
  const fallback = "(    )";
  const rows: string[][] = [
    ["隊長", data.leaderName ?? fallback, "全体の指揮、消防隊との連携"],
    ["通報連絡班", data.tsuhouMember ?? fallback, "119番で消防機関へ通報、事務所内への非常放送、関係者への連絡"],
    ["消火班", data.shokaMember ?? fallback, "消火器等による初期消火"],
    ["避難誘導班", data.hinanMember ?? fallback, "出火時における避難者の誘導、逃げ遅れた者の確認、避難器具による避難"],
    ["救護班", data.kyugoMember ?? fallback, "負傷者の応急手当（＊ 必要に応じ組織）"],
    ["安全防護班", data.anzenMember ?? fallback, "防火戸閉鎖、危険物の除去（＊ 必要に応じ組織）"],
  ];
  return [
    pageBreak(),
    appendixHeading("３", "自衛消防隊の編成と任務"),
    styledTable(["班", "編成", "任務"], rows, [2200, 3000, 3826], nagoyaTheme),
  ];
}

// ── 別記様式: 防火管理業務の委託状況票 (FULL, gated by hasOutsourcedManagement) ─

/**
 * 別記様式 builder. fukuoka 同パターン (buildBekkiOutsourceForm)、福岡公式
 * との差分は dept name のみ (「防火管理業務」、福岡は「防火・防災管理業務」)。
 *
 * 第13条本文と 2 重 gating 関係 (福岡同型):
 *   - 第13条 (art13-outsource): adapter sectionsToSkip で skip
 *   - 別記様式 (本 builder): 本ファイル dispatcher で skip
 *   両者とも hasOutsourcedManagement が条件、整合性は Step 4 smoke で検証。
 */
function buildBekkiOutsourceForm(data: RenderData): (Paragraph | Table)[] {
  const fallback = "(　　　　　　)";
  return [
    pageBreak(),
    appendixHeading("別記様式", "防火管理業務の委託状況票"),
    styledTable(
      ["項目", "内容"],
      [
        ["受託者氏名（名称）", data.outsourceCompany ?? fallback],
        ["受託者住所", fallback],
        ["受託する防火管理業務の範囲", fallback],
        ["委託する時間帯", fallback],
      ],
      [3000, 6026],
      nagoyaTheme
    ),
  ];
}

// ── 別表等一覧 ────────────────────────────────────────────────

export function buildNagoyaAppendixList(data: RenderData): (Paragraph | Table)[] {
  const outsourced = data.hasOutsourcedManagement === "true";
  return [
    pageBreak(),
    sectionHeading("別表等一覧"),
    styledTable(
      ["番号", "名称", "必要性"],
      [
        ["別表１", "予防管理組織編成", "必須"],
        ["別表２", "自主点検チェックリスト", "必須"],
        ["別表３", "自衛消防隊の編成と任務", "必須"],
        ["別記様式", "防火管理業務の委託状況票", applicableLabel(outsourced)],
      ],
      [1500, 5526, 2000],
      nagoyaTheme
    ),
  ];
}

// ── Dispatcher ────────────────────────────────────────────────

export function buildNagoyaAppendices(data: RenderData): (Paragraph | Table)[] {
  const outsourced = data.hasOutsourcedManagement === "true";
  return [
    ...buildAppendix1PreventionOrgStub(),
    ...buildAppendix2InspectionChecklistStub(),
    ...buildAppendix3FireBrigade(data),
    ...(outsourced ? buildBekkiOutsourceForm(data) : []),
  ];
}
