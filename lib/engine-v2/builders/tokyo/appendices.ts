import type { Paragraph, Table } from "docx";
import type { RenderData } from "../../helpers/placeholder";
import { tokyoTable, tokyoTheme } from "../shared/table-helpers";
import {
  appendixHeading,
  pageBreak,
  plainText,
  sectionHeading,
  spacerParagraph,
} from "../shared/paragraph-helpers";
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
 * Tokyo appendix builders — exclusive (別表2, 8-11) + dispatcher
 * that combines shared (別表1, 3-7) + exclusive + 別表等一覧.
 *
 * Step 5 scope: always output all appendices (no gating).
 */

// ── Tokyo-exclusive appendices ────────────────────────────────

/** 別表２ 委託契約書等の内容チェック表 (2×5 static). v1:L56-68. */
export function buildTokyoApp2(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("２", "委託契約書等の内容チェック表"),
    tokyoTable(
      ["確認事項", "確認結果"],
      [
        ["受託者の資格・能力は適正か", "良 ・ 否"],
        ["業務の範囲は明確か", "良 ・ 否"],
        ["指揮命令系統は明確か", "良 ・ 否"],
        ["報告体制は定められているか", "良 ・ 否"],
        ["緊急時の対応は定められているか", "良 ・ 否"],
      ],
      [6000, 3026]
    ),
  ];
}

/** 別表８ 転倒・落下・移動防止対策チェック表 (3×6 static). v1:L162-175. */
export function buildTokyoApp8(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("８", "転倒・落下・移動防止対策チェック表"),
    tokyoTable(
      ["対象物", "対策内容", "実施状況"],
      [
        ["書棚・キャビネット", "L字金具・ベルトで壁に固定", "済 ・ 未"],
        ["コピー機・複合機", "キャスターロック・転倒防止", "済 ・ 否"],
        ["パソコン・モニター", "粘着マット等で固定", "済 ・ 否"],
        ["窓ガラス", "飛散防止フィルム貼付", "済 ・ 否"],
        ["照明器具", "落下防止措置", "済 ・ 否"],
        ["看板・広告物", "倒壊・落下防止措置", "済 ・ 否"],
      ],
      [2800, 4200, 2026]
    ),
  ];
}

/** 別表９ 帰宅困難者対策の備蓄一覧 (3×6). v1:L178-192. */
export function buildTokyoApp9(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("９", "帰宅困難者対策の備蓄一覧"),
    plainText("　従業員等の3日分（東京都帰宅困難者対策条例に基づく）"),
    tokyoTable(
      ["品目", "備蓄量の目安", "現在の備蓄量"],
      [
        ["飲料水", "1人1日3L × 3日 = 9L", "(    ) L"],
        ["食料（アルファ米等）", "1人1日3食 × 3日 = 9食", "(    ) 食"],
        ["毛布・ブランケット", "1人1枚", "(    ) 枚"],
        ["簡易トイレ", "1人1日5回 × 3日 = 15回", "(    ) 回分"],
        ["懐中電灯・電池", "適量", "(    )"],
        ["救急用品", "適量", "(    )"],
      ],
      [3000, 3500, 2526]
    ),
  ];
}

/** 別表10 時差退社計画 (3×5 static). v1:L195-207. */
export function buildTokyoApp10(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("10", "時差退社計画"),
    tokyoTable(
      ["時間帯", "退社対象者", "備考"],
      [
        ["発災後〜3時間", "原則退社しない", "建物内待機"],
        ["3時間〜12時間", "情報収集・安否確認", "公共交通の運行状況確認"],
        ["12時間〜24時間", "近距離居住者から順次", "徒歩帰宅可能者"],
        ["24時間〜72時間", "中距離居住者", "公共交通の復旧に応じて"],
        ["72時間以降", "遠距離居住者", "状況に応じて宿泊"],
      ],
      [2500, 3500, 3026]
    ),
  ];
}

/** 別表11 施設安全点検チェックリスト (3×10). v1:L210-228. */
export function buildTokyoApp11(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("11", "施設安全点検チェックリスト"),
    plainText("　地震発生後、施設の使用可否を判断するための点検"),
    tokyoTable(
      ["点検箇所", "点検内容", "結果"],
      [
        ["建物外観", "傾き・ひび割れ・落下物の有無", "良 ・ 否"],
        ["柱・梁", "亀裂・変形の有無", "良 ・ 否"],
        ["床・壁", "亀裂・剥落の有無", "良 ・ 否"],
        ["階段", "破損・歪みの有無", "良 ・ 否"],
        ["ガラス", "破損・脱落の有無", "良 ・ 否"],
        ["天井", "落下・たわみの有無", "良 ・ 否"],
        ["電気設備", "異常・破損の有無", "良 ・ 否"],
        ["ガス設備", "漏れ・異臭の有無", "良 ・ 否"],
        ["給排水設備", "漏水の有無", "良 ・ 否"],
        ["エレベーター", "閉じ込め・破損の有無", "良 ・ 否"],
      ],
      [2800, 4200, 2026]
    ),
  ];
}

// ── 別表等一覧 ────────────────────────────────────────────────

/**
 * 別表等一覧 index table (3×14 + legend text). v1:L489-506.
 * The 3rd column is "法的根拠" (not "必要性" like kyoto) with
 * symbols ◎/○/●/▲ explained in the legend below.
 */
export function buildTokyoAppendixList(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    sectionHeading("別表等一覧"),
    tokyoTable(
      ["番号", "名称", "法的根拠"],
      [
        ["別表１", "防火・防災管理業務の一部委託状況表", "▲"],
        ["別表２", "委託契約書等の内容チェック表", "▲"],
        ["別表３", "日常の火災予防の担当者と注意事項", "◎"],
        ["別表４-1", "自主検査チェック表（火気関係）", "◎"],
        ["別表４-2", "自主検査チェック表（閉鎖障害等）", "◎"],
        ["別表５", "自主検査チェック表（定期）", "◎"],
        ["別表６", "自主点検チェック表（消防用設備等）", "◎"],
        ["別表７", "自衛消防隊の編成と任務", "◎"],
        ["別表８", "転倒・落下・移動防止対策チェック表", "○"],
        ["別表９", "帰宅困難者対策の備蓄一覧", "○"],
        ["別表10", "時差退社計画", "○"],
        ["別表11", "施設安全点検チェックリスト", "○"],
        ["別図", "避難経路図", "◎"],
        ["別添え", "消防計画概要", "▲"],
      ],
      [1500, 5000, 1526]
    ),
    spacerParagraph(),
    plainText("◎:消防法第8条 ○:東京都震災対策条例 ●:火災予防条例 ▲:該当時"),
  ];
}

// ── All-appendices dispatcher ─────────────────────────────────

/**
 * Emit all Tokyo appendices in order: shared (別表1,3-7) +
 * exclusive (別表2, 8-11). No gating — Step 5 scope outputs all.
 */
export function buildTokyoAppendices(data: RenderData): (Paragraph | Table)[] {
  const t = tokyoTheme;
  const outsourced = data.hasOutsourcedManagement === "true";
  return [
    // 別表1+2: v1 L233-236 — only when has_outsourced_management is true.
    ...(outsourced ? buildOutsourceStatus(data, t, { num: "１", title: "防火・防災管理業務の一部委託状況表" }) : []),
    ...(outsourced ? buildTokyoApp2() : []),
    ...buildDailyPrevention(t, { num: "３", title: "日常の火災予防の担当者と注意事項" }),
    ...buildFireCheck(data, t, { num: "４-１", title: "自主検査チェック表（火気関係）", timingDefault: "毎日" }),
    ...buildClosureCheck(data, t, { num: "４-２", title: "自主検査チェック表（閉鎖障害等）", timingDefault: "毎日" }),
    ...buildPeriodicCheck(data, t, { num: "５", title: "自主検査チェック表（定期）" }),
    ...buildEquipmentCheck(data, t, { num: "６", title: "自主点検チェック表（消防用設備等）", showTiming: false }),
    ...buildFireBrigade(data, t, {
      num: "７",
      title: "自衛消防隊の編成と任務",
      extraLeaderRows: [["副隊長", "(    )", "隊長の補佐、隊長不在時の代行"]],
    }),
    ...buildTokyoApp8(),
    ...buildTokyoApp9(),
    ...buildTokyoApp10(),
    ...buildTokyoApp11(),
  ];
}
