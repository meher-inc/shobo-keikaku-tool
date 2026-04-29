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
 * Osaka City Fire Bureau (中・小規模 事業所・テナント用) appendix builders.
 *
 * Phase 2A scope (v1 osaka JSON DB の include_in_standard=true 6 別表):
 *   - 別表１ 防火・防災管理業務委託状況表  — STUB, gated by
 *                                           hasOutsourcedManagement
 *   - 別表２ 災害想定                      — STUB (TODO Phase 2B)
 *   - 別表３ 防火・防災対象物実態把握表      — STUB (TODO Phase 2B)
 *   - 別表７ 防火・防災管理維持台帳に編冊する書類等 — STUB (TODO Phase 2B)
 *   - 別表８ 非常用物品等の一覧              — STUB (TODO Phase 2B)
 *   - 別表９ 地区隊の編成と任務              — FULL impl, custom
 *                                            (shared buildFireBrigade
 *                                            だと班名・任務文言が
 *                                            kyoto 流で固定されて
 *                                            おり osaka 仕様と
 *                                            合わないため、
 *                                            shared プリミティブ
 *                                            (styledTable +
 *                                            appendixHeading +
 *                                            pageBreak) への
 *                                            委譲方式で実装)
 *
 * Theme: Phase 2A interim — kyoto と区別するため濃緑を採用。
 * 大阪市公式ブランドカラーの確定を Phase 2B/2C で行う際に再評価。
 */

/** Phase 2A interim theme — green/teal palette. Brand colors TBD. */
const osakaTheme: TableTheme = {
  headerFill: "1F6E5B",
  altFill: "F0F7F4",
};

// ── 別表1: 防火・防災管理業務委託状況表 (STUB, gated) ─────────────

function buildAppendix1OutsourceStub(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("１", "防火・防災管理業務委託状況表"),
    plainText(
      "（Phase 2B で完全実装：委託方式・受託者氏名・住所・業務範囲・業務時間帯）"
    ),
  ];
}

// ── 別表2: 災害想定 (STUB) ─────────────────────────────────────

function buildAppendix2DisasterStub(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("２", "災害想定"),
    plainText(
      "（Phase 2B で完全実装：地震規模・想定災害・人的被害想定・物的被害想定）"
    ),
  ];
}

// ── 別表3: 防火・防災対象物実態把握表 (STUB) ──────────────────────

function buildAppendix3PropertyStub(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("３", "防火・防災対象物実態把握表"),
    plainText(
      "（Phase 2B で完全実装：所有形態・建築年月日・構造・階数・延べ面積・管理権原範囲・収容人員・主用途・危険物・消防用設備）"
    ),
  ];
}

// ── 別表7: 防火・防災管理維持台帳に編冊する書類等 (STUB) ─────────

function buildAppendix7RecordsStub(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("７", "防火・防災管理維持台帳に編冊する書類等"),
    plainText(
      "（Phase 2B で完全実装：講習修了証・各種届出書・点検記録等の 12 項目）"
    ),
  ];
}

// ── 別表8: 非常用物品等の一覧 (STUB) ─────────────────────────────

function buildAppendix8SuppliesStub(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("８", "非常用物品等の一覧"),
    plainText(
      "（Phase 2B で完全実装：飲料水・非常食・懐中電灯・ラジオ・救急医薬品・毛布・簡易トイレ・ヘルメット）"
    ),
  ];
}

// ── 別表9: 地区隊の編成と任務 (FULL) ─────────────────────────────

/**
 * 別表9 builder. Title contains a placeholder (`{building_name}`)
 * which is realised at render time from data.buildingName.
 *
 * Each row uses an osaka-specific 班 member field (leaderName,
 * tsuhouMember, shokaMember, hinanMember, kyugoMember,
 * anzenMember). Falls back to "(    )" placeholders when not
 * supplied — same convention as shared buildFireBrigade.
 *
 * Cannot delegate to shared buildFireBrigade because that helper
 * (1) hardcodes COMMON_BRIGADE_ROWS with kyoto naming (担当 vs
 * osaka 班) and fixed-text duties, and (2) uses managerName for
 * the leader row. osaka v1 generator emits leaderName + 5 osaka
 * specific 班 rows with osaka-specific 任務 text. Therefore this
 * appendix delegates to shared *primitives* (styledTable,
 * appendixHeading, pageBreak) instead.
 */
function buildAppendix9FireBrigade(data: RenderData): (Paragraph | Table)[] {
  const buildingName = data.buildingName ?? "（建物名未設定）";
  const fallback = "(    )";
  const rows: string[][] = [
    ["隊長", data.leaderName ?? fallback, "全体の指揮統括"],
    ["通報連絡班", data.tsuhouMember ?? fallback, "119番通報、館内放送、関係機関連絡"],
    ["初期消火班", data.shokaMember ?? fallback, "消火器・屋内消火栓による初期消火"],
    ["避難誘導班", data.hinanMember ?? fallback, "在館者の避難誘導、避難経路確保"],
    ["救護班", data.kyugoMember ?? fallback, "負傷者の応急手当、安全な場所への搬送"],
    ["安全防護班", data.anzenMember ?? fallback, "防火戸閉鎖、危険物の除去、二次災害防止"],
  ];
  return [
    pageBreak(),
    appendixHeading("９", `（${buildingName}）地区隊の編成と任務`),
    styledTable(["班", "編成", "任務"], rows, [2200, 3000, 3826], osakaTheme),
  ];
}

// ── 別表等一覧 ────────────────────────────────────────────────

export function buildOsakaAppendixList(data: RenderData): (Paragraph | Table)[] {
  const outsourced = data.hasOutsourcedManagement === "true";
  return [
    pageBreak(),
    sectionHeading("別表等一覧"),
    styledTable(
      ["番号", "名称", "必要性"],
      [
        ["別表１", "防火・防災管理業務委託状況表", applicableLabel(outsourced)],
        ["別表２", "災害想定", "必須"],
        ["別表３", "防火・防災対象物実態把握表", "必須"],
        ["別表７", "防火・防災管理維持台帳に編冊する書類等", "必須"],
        ["別表８", "非常用物品等の一覧", "必須"],
        ["別表９", "地区隊の編成と任務", "必須"],
      ],
      [1500, 5526, 2000],
      osakaTheme
    ),
  ];
}

// ── Dispatcher ────────────────────────────────────────────────

export function buildOsakaAppendices(data: RenderData): (Paragraph | Table)[] {
  const outsourced = data.hasOutsourcedManagement === "true";
  return [
    ...(outsourced ? buildAppendix1OutsourceStub() : []),
    ...buildAppendix2DisasterStub(),
    ...buildAppendix3PropertyStub(),
    ...buildAppendix7RecordsStub(),
    ...buildAppendix8SuppliesStub(),
    ...buildAppendix9FireBrigade(data),
  ];
}
