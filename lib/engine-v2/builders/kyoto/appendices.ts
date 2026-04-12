import type { Paragraph, Table } from "docx";
import type { RenderData } from "../../helpers/placeholder";
import { kyotoTable } from "../shared/table-helpers";
import {
  appendixHeading,
  pageBreak,
  plainText,
  sectionHeading,
  spacerParagraph,
} from "../shared/paragraph-helpers";
import { applicableLabel, reportFrequencyPhrase } from "./logic";

/**
 * Kyoto-city appendix builders (別表1〜9) + the 別表等一覧 index.
 *
 * Direct ports of the buildAppendix1..9 + main-flow index table
 * from lib/generate_kyoto_full.js. One file because each builder
 * is small and they share a visual style.
 *
 * Gating note: v1 only emits 別表1 when
 * has_outsourced_management is true (L202). Per Step 4b scope
 * decision we always emit all 9 appendices — the "必要性" column
 * in the index table still reflects 該当/非該当 for 別表1, but
 * the appendix itself is always present.
 * TODO(step4d): Re-apply has_outsourced_management gating for
 * 別表1 once the fire-dept-aware gating design is settled with
 * SHUN.
 */

function buildAppendix1(data: RenderData): (Paragraph | Table)[] {
  const outsourceCompany = data.outsourceCompany ?? "（　　　　　　）";
  return [
    pageBreak(),
    appendixHeading("１", "防火管理業務の一部委託状況表"),
    kyotoTable(
      ["受託者", "委託業務の範囲", "受託の方法"],
      [
        [outsourceCompany, "（　　　　　　）", "常駐 ・ 巡回 ・ 遠隔"],
        ["", "", ""],
      ],
      [2500, 3500, 3026]
    ),
  ];
}

function buildAppendix2(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("２", "日常の火災予防の担当者と日常の注意事項"),
    kyotoTable(
      ["担当区域", "担当者", "日常の注意事項"],
      [
        ["事務室", "(    )", "退室時の電源遮断、書類の整理整頓"],
        ["厨房・給湯室", "(    )", "ガス栓の閉止、油の管理、換気"],
        ["倉庫・物置", "(    )", "可燃物の整理、施錠の確認"],
        ["共用部・廊下", "(    )", "避難経路上の物品の除去"],
        ["トイレ・洗面所", "(    )", "不審物の確認、巡視"],
      ],
      [2500, 3000, 3526]
    ),
  ];
}

function buildAppendix3(data: RenderData): (Paragraph | Table)[] {
  const checker = data.dailyChecker ?? "防火管理者";
  const timing = data.dailyCheckTiming ?? "毎日終業時";
  return [
    pageBreak(),
    appendixHeading("３", "自主検査チェック表（日常）「火気関係」"),
    kyotoTable(
      ["検査項目", "検査内容", "結果"],
      [
        ["喫煙場所", "吸い殻の処理は適正か", "良 ・ 否"],
        ["火気使用設備器具", "使用後の安全確認", "良 ・ 否"],
        ["ガス設備", "栓の閉止確認", "良 ・ 否"],
        ["電気設備", "コンセント・配線の異常の有無", "良 ・ 否"],
        ["危険物", "適正な保管", "良 ・ 否"],
      ],
      [3500, 3500, 2026]
    ),
    spacerParagraph(),
    plainText(`実施者:${checker}\u3000\u3000実施時期:${timing}`),
  ];
}

function buildAppendix4(data: RenderData): (Paragraph | Table)[] {
  const checker = data.dailyChecker ?? "防火管理者";
  const timing = data.dailyCheckTiming ?? "毎日終業時";
  return [
    pageBreak(),
    appendixHeading("４", "自主検査チェック表（日常）「閉鎖障害等」"),
    kyotoTable(
      ["検査項目", "検査内容", "結果"],
      [
        ["避難口", "開放できる状態か、物品で塞がれていないか", "良 ・ 否"],
        ["廊下・通路", "避難の障害となる物品がないか", "良 ・ 否"],
        ["階段", "物品が置かれていないか", "良 ・ 否"],
        ["防火戸", "閉鎖の障害となる物品がないか", "良 ・ 否"],
        ["防火シャッター", "降下位置に物品がないか", "良 ・ 否"],
      ],
      [3500, 3500, 2026]
    ),
    spacerParagraph(),
    plainText(`実施者:${checker}\u3000\u3000実施時期:${timing}`),
  ];
}

function buildAppendix5(data: RenderData): (Paragraph | Table)[] {
  const months = data.periodicCheckMonths ?? "4月と10月";
  return [
    pageBreak(),
    appendixHeading("５", "自主検査チェック表（定期）"),
    kyotoTable(
      ["検査対象", "検査内容", "結果"],
      [
        ["建物の構造", "壁・柱・床・天井に損傷はないか", "良 ・ 否"],
        ["防火区画", "貫通部の埋戻しは適正か", "良 ・ 否"],
        ["内装制限", "可燃性の装飾物の有無", "良 ・ 否"],
        ["危険物施設", "保管・取扱いは適正か", "良 ・ 否"],
        ["電気設備", "分電盤・配線の異常の有無", "良 ・ 否"],
      ],
      [2800, 4200, 2026]
    ),
    spacerParagraph(),
    plainText(`実施者:火元責任者\u3000\u3000実施時期:${months}`),
  ];
}

function buildAppendix6(data: RenderData): (Paragraph | Table)[] {
  // fire_equipment is serialised into fireEquipmentList (comma
  // separated) by the adapter's toRenderData step; fall back to
  // the v1 default list when the form doesn't supply one.
  const csv = data.fireEquipmentList;
  const equipment =
    csv && csv.length > 0
      ? csv
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
      : ["消火器", "自動火災報知設備", "誘導灯"];

  const checker = data.dailyChecker ?? "防火管理者";
  const selfCheckMonths = data.selfCheckMonths ?? "1月と7月";

  const rows = equipment.map((eq) => [
    eq,
    "外観・配置・機能に異常はないか",
    "良 ・ 否",
  ]);

  return [
    pageBreak(),
    appendixHeading("６", "消防用設備等自主点検チェック表"),
    kyotoTable(["設備名", "点検内容", "結果"], rows, [2800, 4200, 2026]),
    spacerParagraph(),
    plainText(`実施者:${checker}\u3000\u3000実施時期:${selfCheckMonths}`),
  ];
}

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

function buildAppendix8(data: RenderData): (Paragraph | Table)[] {
  const managerName = data.managerName ?? "(    )";
  return [
    pageBreak(),
    appendixHeading("８", "自衛消防隊編成表"),
    kyotoTable(
      ["役割", "氏名", "任務"],
      [
        ["自衛消防隊長", managerName, "全体の指揮、消防隊への情報提供"],
        ["通報連絡担当", "(    )", "119番通報、館内・関係者への連絡"],
        ["初期消火担当", "(    )", "消火器・屋内消火栓による初期消火"],
        ["避難誘導担当", "(    )", "避難経路の確保、在館者の誘導"],
        ["安全防護担当", "(    )", "防火戸・防火シャッターの閉鎖確認"],
        ["応急救護担当", "(    )", "負傷者の応急手当、救急隊への引継ぎ"],
      ],
      [2500, 3000, 3526]
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

/**
 * 別表等一覧 — the index table that appears right before the
 * individual appendices in v1 (L476-488). Column 3 (必要性) uses
 * applicableLabel(outsourced) for 別表1; every other row is
 * hard-coded as "必須".
 */
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

/**
 * Emit all nine appendices in order. No gating — Step 4b decision:
 * always output all 9 and defer gating design to Step 4d.
 */
export function buildKyotoAppendices(data: RenderData): (Paragraph | Table)[] {
  return [
    ...buildAppendix1(data),
    ...buildAppendix2(),
    ...buildAppendix3(data),
    ...buildAppendix4(data),
    ...buildAppendix5(data),
    ...buildAppendix6(data),
    ...buildAppendix7(data),
    ...buildAppendix8(data),
    ...buildAppendix9(),
  ];
}
