import type { Paragraph, Table } from "docx";
import type { RenderData } from "../../helpers/placeholder";
import { kyotoTheme } from "../shared/table-helpers";
import { kyotoTable } from "../shared/table-helpers";
import {
  appendixHeading,
  pageBreak,
  plainText,
  sectionHeading,
  spacerParagraph,
} from "../shared/paragraph-helpers";
import { applicableLabel, reportFrequencyPhrase } from "./logic";

// Shared appendix builders (kyoto + tokyo common structures).
import {
  buildOutsourceStatus,
  buildDailyPrevention,
  buildFireCheck,
  buildClosureCheck,
  buildPeriodicCheck,
  buildEquipmentCheck,
  buildFireBrigade,
} from "../shared/appendices";

/**
 * Kyoto-city appendix builders.
 *
 * 7 of the 9 appendices delegate to shared builders in
 * builders/shared/appendices/, passing kyotoTheme and kyoto-
 * specific text options. 2 appendices (法定点検, 訓練実施結果)
 * are kyoto-only and stay inline here.
 *
 * Step 5 scope: always output all 9 appendices (no gating).
 * TODO(step4d): Re-apply has_outsourced_management gating for
 * 別表1 once the fire-dept-aware gating design is settled.
 */

// ── Kyoto-only appendices (no Tokyo equivalent) ───────────────

function buildAppendix7(data: RenderData): (Paragraph | Table)[] {
  const isSpecific = data.isSpecificUse === "true";
  const inspectionCompany = data.inspectionCompany ?? "（未定）";
  return [
    pageBreak(),
    appendixHeading("７", "消防用設備等の法定点検実施計画"),
    kyotoTable(
      ["点検種別", "実施時期", "実施者"],
      [
        ["機器点検", "6か月に1回", inspectionCompany],
        ["総合点検", "1年に1回", inspectionCompany],
      ],
      [3000, 3000, 3026]
    ),
    spacerParagraph(),
    plainText(
      `報告:${reportFrequencyPhrase(isSpecific)}(総合点検終了後、所轄消防署へ報告)`
    ),
  ];
}

function buildAppendix9(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("９", "消防訓練実施結果表"),
    kyotoTable(
      ["実施年月日", "訓練種別", "参加人数", "反省点・改善事項"],
      [
        ["年　月　日", "消火 ・ 通報 ・ 避難 ・ 総合", "　　名", ""],
        ["年　月　日", "消火 ・ 通報 ・ 避難 ・ 総合", "　　名", ""],
        ["年　月　日", "消火 ・ 通報 ・ 避難 ・ 総合", "　　名", ""],
      ],
      [2200, 2200, 2200, 2426]
    ),
  ];
}

// ── 別表等一覧 ────────────────────────────────────────────────

export function buildKyotoAppendixList(data: RenderData): (Paragraph | Table)[] {
  const outsourced = data.hasOutsourcedManagement === "true";
  return [
    pageBreak(),
    sectionHeading("別表等一覧"),
    kyotoTable(
      ["番号", "名称", "必要性"],
      [
        ["別表１", "防火管理業務の一部委託状況表", applicableLabel(outsourced)],
        ["別表２", "日常の火災予防の担当者と日常の注意事項", "必須"],
        ["別表３", "自主検査チェック表(日常)「火気関係」", "必須"],
        ["別表４", "自主検査チェック表(日常)「閉鎖障害等」", "必須"],
        ["別表５", "自主検査チェック表(定期)", "必須"],
        ["別表６", "消防用設備等自主点検チェック表", "必須"],
        ["別表７", "消防用設備等の法定点検実施計画", "必須"],
        ["別表８", "自衛消防隊編成表", "必須"],
        ["別表９", "消防訓練実施結果表", "必須"],
      ],
      [1500, 5526, 2000]
    ),
  ];
}

// ── Dispatcher ────────────────────────────────────────────────

export function buildKyotoAppendices(data: RenderData): (Paragraph | Table)[] {
  const t = kyotoTheme;
  const outsourced = data.hasOutsourcedManagement === "true";
  return [
    // 別表1: v1 L202 — only when has_outsourced_management is true.
    ...(outsourced ? buildOutsourceStatus(data, t, { num: "１", title: "防火管理業務の一部委託状況表" }) : []),
    ...buildDailyPrevention(t, { num: "２", title: "日常の火災予防の担当者と日常の注意事項" }),
    ...buildFireCheck(data, t, { num: "３", title: "自主検査チェック表（日常）「火気関係」", timingDefault: "毎日終業時" }),
    ...buildClosureCheck(data, t, { num: "４", title: "自主検査チェック表（日常）「閉鎖障害等」", timingDefault: "毎日終業時" }),
    ...buildPeriodicCheck(data, t, { num: "５", title: "自主検査チェック表（定期）" }),
    ...buildEquipmentCheck(data, t, { num: "６", title: "消防用設備等自主点検チェック表" }),
    ...buildAppendix7(data),
    ...buildFireBrigade(data, t, { num: "８", title: "自衛消防隊編成表" }),
    ...buildAppendix9(),
  ];
}
