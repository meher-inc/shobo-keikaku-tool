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
 * Fukuoka City Fire Bureau (中規模防火対象物用) appendix builders.
 *
 * Phase 2A scope (chukibo 公式の 別表 3 本 + 別記様式 1 本):
 *   - 別表1 火災予防のための組織編成              — STUB (TODO Phase 2B)
 *   - 別表2 自主点検を実施するための組織編成表(例) — STUB (TODO Phase 2B)
 *   - 別表3 自衛消防隊の編成と任務                — FULL impl
 *                                                   (osaka 別表9 と同型構造、
 *                                                   placeholder 共通命名で
 *                                                   shared プリミティブへ
 *                                                   委譲)
 *   - 別記様式 防火・防災管理業務の委託状況表        — FULL impl
 *                                                   gated by
 *                                                   hasOutsourcedManagement
 *                                                   (第3条本文との 2 重 gating
 *                                                   整合)
 *
 * Theme: Phase 2A interim — 福岡市カラー紺青系 (#1A4789)。
 * 大阪・横浜と一律 Phase 2B/2C でブランドカラー確定予定。
 */

/** Phase 2A interim theme — 福岡市紺青系。Brand color TBD in Phase 2B. */
const fukuokaTheme: TableTheme = {
  headerFill: "1A4789",
  altFill: "F0F4FA",
};

// ── 別表1: 火災予防のための組織編成 (STUB) ──────────────────────

function buildAppendix1PreventionOrgStub(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("１", "火災予防のための組織編成"),
    plainText(
      "（Phase 2B で完全実装：階・区域 × 防火担当責任者・火元責任者の編成表）"
    ),
  ];
}

// ── 別表2: 自主点検を実施するための組織編成表（例）(STUB) ────────

function buildAppendix2InspectionOrgStub(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("２", "自主点検を実施するための組織編成表（例）"),
    plainText(
      "（Phase 2B で完全実装：点検班区分 × 点検班員 × 点検対象設備の編成表）"
    ),
  ];
}

// ── 別表3: 自衛消防隊の編成と任務 (FULL) ─────────────────────────

/**
 * 別表3 builder. osaka 別表9 (買買 buildAppendix9FireBrigade) と同型構造。
 * shared プリミティブ (styledTable + appendixHeading + pageBreak) への
 * 委譲方式で実装。
 *
 * Each row uses fukuoka-specific 自衛消防隊 role fields, but placeholder
 * names are intentionally aligned with osaka (leaderName,
 * defenseSubLeader, tsuhouMember, shokaMember, hinanMember,
 * kyugoMember, anzenMember) for cross-dept placeholder reuse —
 * adapter Step 2 で extendForFukuoka に共通命名で先取り定義済。
 *
 * 福岡固有の任務テキスト (第25条〜第30条 から抽出):
 *   - 隊長:        「全体の指揮，消防隊との連携」(第25条1項)
 *   - 副隊長:      「隊長の補佐，隊長不在時の代行」(第25条2項)
 *   - 通報連絡係:   「119番通報、関係機関への連絡」(第26条)
 *   - 消火係:       「消火器・屋内消火栓による初期消火・延焼拡大防止」(第27条)
 *   - 避難誘導係:   「適切な避難経路の選択・避難誘導」(第28条)
 *   - 安全防護係:   「排煙口操作、防火戸・防火シャッター閉鎖」(第29条)
 *   - 救護係:       「救護所設置、応急手当、救急隊との連絡」(第30条)
 *
 * osaka 別表9 との差分:
 *   - 班 → 係 命名 (chukibo 公式表記に準拠、osaka は「○○班」)
 *   - 副隊長 行を独立ロー追加 (第25条2項に基づく)
 *   - title に buildingName placeholder なし (osaka と異なり固定タイトル)
 */
function buildAppendix3FireBrigade(data: RenderData): (Paragraph | Table)[] {
  const fallback = "(    )";
  const rows: string[][] = [
    ["隊長", data.leaderName ?? fallback, "全体の指揮，消防隊との連携"],
    ["副隊長", data.defenseSubLeader ?? fallback, "隊長の補佐，隊長不在時の代行"],
    ["通報連絡係", data.tsuhouMember ?? fallback, "119番通報、関係機関への連絡"],
    ["消火係", data.shokaMember ?? fallback, "消火器・屋内消火栓による初期消火・延焼拡大防止"],
    ["避難誘導係", data.hinanMember ?? fallback, "適切な避難経路の選択・避難誘導"],
    ["安全防護係", data.anzenMember ?? fallback, "排煙口操作、防火戸・防火シャッター閉鎖"],
    ["救護係", data.kyugoMember ?? fallback, "救護所設置、応急手当、救急隊との連絡"],
  ];
  return [
    pageBreak(),
    appendixHeading("３", "自衛消防隊の編成と任務"),
    styledTable(["係", "編成", "任務"], rows, [2200, 3000, 3826], fukuokaTheme),
  ];
}

// ── 別記様式: 防火・防災管理業務の委託状況表 (FULL, gated by hasOutsourcedManagement) ─

/**
 * 別記様式 builder. 福岡公式 chukibo 末尾の委託状況表を再現。
 * 別表 1/2/3 とは別概念だが appendices.ts に並列配置 (recon §B-2 採用 B1)。
 *
 * 第3条本文と 2 重 gating 関係:
 *   - 第3条 (ch1-art3-outsource): adapter sectionsToSkip で skip
 *   - 別記様式 (本 builder): 本ファイル dispatcher で skip
 *   両者とも hasOutsourcedManagement が条件、整合性は Step 4 smoke で検証。
 */
function buildBekkiOutsourceForm(data: RenderData): (Paragraph | Table)[] {
  const fallback = "(　　　　　　)";
  return [
    pageBreak(),
    appendixHeading("別記様式", "防火・防災管理業務の委託状況表"),
    styledTable(
      ["項目", "内容"],
      [
        ["受託者氏名（名称）", data.outsourceCompany ?? fallback],
        ["受託者住所", fallback],
        ["受託する防火・防災管理業務の範囲", fallback],
        ["委託する時間帯", fallback],
      ],
      [3000, 6026],
      fukuokaTheme
    ),
  ];
}

// ── 別表等一覧 ────────────────────────────────────────────────

export function buildFukuokaAppendixList(data: RenderData): (Paragraph | Table)[] {
  const outsourced = data.hasOutsourcedManagement === "true";
  return [
    pageBreak(),
    sectionHeading("別表等一覧"),
    styledTable(
      ["番号", "名称", "必要性"],
      [
        ["別表１", "火災予防のための組織編成", "必須"],
        ["別表２", "自主点検を実施するための組織編成表（例）", "必須"],
        ["別表３", "自衛消防隊の編成と任務", "必須"],
        ["別記様式", "防火・防災管理業務の委託状況表", applicableLabel(outsourced)],
      ],
      [1500, 5526, 2000],
      fukuokaTheme
    ),
  ];
}

// ── Dispatcher ────────────────────────────────────────────────

export function buildFukuokaAppendices(data: RenderData): (Paragraph | Table)[] {
  const outsourced = data.hasOutsourcedManagement === "true";
  return [
    ...buildAppendix1PreventionOrgStub(),
    ...buildAppendix2InspectionOrgStub(),
    ...buildAppendix3FireBrigade(data),
    ...(outsourced ? buildBekkiOutsourceForm(data) : []),
  ];
}
