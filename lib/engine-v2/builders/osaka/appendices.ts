import type { Paragraph, Table } from "docx";
import type { RenderData } from "../../helpers/placeholder";
import type { TableTheme } from "../shared/table-helpers";
import { styledTable } from "../shared/table-helpers";
import {
  appendixHeading,
  pageBreak,
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
    styledTable(
      ["項目", "内容"],
      [
        ["委託方式", "常駐 ・ 巡回 ・ 遠隔移報 ・ その他（　　　　）"],
        ["受託者氏名（名称）", "　"],
        ["受託者住所", "　"],
        ["委託する業務の範囲", "　"],
        ["業務を行う時間帯", "　"],
      ],
      [3000, 6026],
      osakaTheme
    ),
  ];
}

// ── 別表2: 災害想定 (STUB) ─────────────────────────────────────

function buildAppendix2DisasterStub(data: RenderData): (Paragraph | Table)[] {
  const v = (x?: string) => (x && x.trim() ? x : "　");
  return [
    pageBreak(),
    appendixHeading("２", "災害想定"),
    styledTable(
      ["項目", "想定の内容"],
      [
        ["地震の規模", "　"],
        ["想定される災害", "　"],
        ["人的被害の想定", v(data.casualtyEstimate)],
        ["物的被害の想定", v(data.propertyDamageEstimate)],
      ],
      [3000, 6026],
      osakaTheme
    ),
  ];
}

// ── 別表3: 防火・防災対象物実態把握表 (STUB) ──────────────────────

function buildAppendix3PropertyStub(data: RenderData): (Paragraph | Table)[] {
  const v = (x?: string) => (x && x.trim() ? x : "　");
  const floors =
    data.floorsAbove || data.floorsBelow
      ? `地上${data.floorsAbove ?? "　"}階・地下${data.floorsBelow ?? "　"}階`
      : data.numFloors
        ? `${data.numFloors}階`
        : "　";
  return [
    pageBreak(),
    appendixHeading("３", "防火・防災対象物実態把握表"),
    styledTable(
      ["項目", "内容"],
      [
        ["所有形態", data.buildingOwnership ?? "自社所有 ・ 賃借 ・ その他（　　　　）"],
        ["建築年月日", v(data.buildingConstructedDate)],
        ["構造", v(data.buildingStructure)],
        ["階数", floors],
        ["延べ面積", v(data.totalAreaM2 ? `${data.totalAreaM2}㎡` : data.totalArea ? `${data.totalArea}㎡` : undefined)],
        ["管理権原範囲", v(data.kengenRange ?? data.managementScope)],
        ["収容人員", v(data.occupancy ?? (data.capacity ? `${data.capacity}人` : undefined))],
        ["主用途", v(data.mainUsage ?? data.useCategory)],
        ["危険物の有無", data.hasHazardousMaterials ?? "有（品名・数量：　　　　） ・ 無"],
        ["消防用設備等", v(data.fireEquipmentSummary ?? (data.fireEquipmentList ?? "").split(",").filter(Boolean).join("、"))],
      ],
      [3000, 6026],
      osakaTheme
    ),
  ];
}

// ── 別表7: 防火・防災管理維持台帳に編冊する書類等 (STUB) ─────────

function buildAppendix7RecordsStub(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("７", "防火・防災管理維持台帳に編冊する書類等"),
    styledTable(
      ["書類等", "編冊の有無"],
      [
        ["防火・防災管理者の講習修了証の写し", "有 ・ 無"],
        ["防火・防災管理者選任（解任）届出書の控え", "有 ・ 無"],
        ["消防計画作成（変更）届出書の控え", "有 ・ 無"],
        ["消防用設備等点検結果報告書の控え", "有 ・ 無"],
        ["防火対象物点検結果報告書の控え（該当する場合）", "有 ・ 無"],
        ["防災管理点検結果報告書の控え（該当する場合）", "有 ・ 無"],
        ["自衛消防訓練の実施記録", "有 ・ 無"],
        ["防火・防災教育の実施記録", "有 ・ 無"],
        ["自主検査・自主点検の記録", "有 ・ 無"],
        ["消防機関からの通知書・指導事項等", "有 ・ 無"],
        ["防火・防災管理業務の委託契約書等の写し（該当する場合）", "有 ・ 無"],
        ["その他防火・防災管理上必要な書類", "有 ・ 無"],
      ],
      [6500, 2526],
      osakaTheme
    ),
  ];
}

// ── 別表8: 非常用物品等の一覧 (STUB) ─────────────────────────────

function buildAppendix8SuppliesStub(data: RenderData): (Paragraph | Table)[] {
  const place = data.storageLocation ?? "　";
  return [
    pageBreak(),
    appendixHeading("８", "非常用物品等の一覧"),
    styledTable(
      ["品目", "数量", "保管場所"],
      [
        ["飲料水", "　", place],
        ["非常食", "　", place],
        ["懐中電灯", "　", place],
        ["ラジオ", "　", place],
        ["救急医薬品", "　", place],
        ["毛布", "　", place],
        ["簡易トイレ", "　", place],
        ["ヘルメット", "　", place],
      ],
      [3500, 2000, 3526],
      osakaTheme
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
    ...buildAppendix2DisasterStub(data),
    ...buildAppendix3PropertyStub(data),
    ...buildAppendix7RecordsStub(),
    ...buildAppendix8SuppliesStub(data),
    ...buildAppendix9FireBrigade(data),
  ];
}
