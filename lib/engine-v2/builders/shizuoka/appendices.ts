import type { Paragraph, Table } from "docx";
import type { RenderData } from "../../helpers/placeholder";
import type { TableTheme } from "../shared/table-helpers";
import { styledTable } from "../shared/table-helpers";
import { pageBreak, sectionHeading } from "../shared/paragraph-helpers";

/**
 * 静岡市消防局（単一権原・作成例2）別表ビルダ。
 *
 * 出典: 静岡市「消防計画（作成例2 単一権原）shouboukeikaku2」
 *   https://www.city.shizuoka.lg.jp/shinsei/s6329/p0108.html
 *
 * 本文（第8条・第12条・第13条 ほか）から参照される記入式フォーム。
 */

const shizuokaTheme: TableTheme = {
  headerFill: "2E5F9E",
  altFill: "EEF4FA",
};

const B = "";
const NAME = "(　　　　)";

function buildBesso1SelfInspect(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    sectionHeading("別表１　自主点検表"),
    styledTable(
      ["区分", "点検項目", "結果"],
      [
        ["建物・火気設備", "火気使用設備器具の周囲に可燃物はなく、安全装置は機能するか", B],
        ["電気設備", "コードの損傷・たこ足配線はないか", B],
        ["避難施設", "避難通路・避難口・階段に障害物はないか、防火戸は閉鎖できるか", B],
        ["消防用設備等", "消火器・屋内消火栓・自動火災報知設備に異常はないか", B],
      ],
      [2200, 5826, 1000],
      shizuokaTheme
    ),
  ];
}

function buildBesso2LegalInspect(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    sectionHeading("別表２　消防法令に基づく点検実施表"),
    styledTable(
      ["点検区分", "実施者・業者", "実施時期"],
      [
        ["防火対象物定期点検（法第8条の2の2）", NAME, B],
        ["消防用設備等定期点検（法第17条の3の3）", NAME, B],
      ],
      [4026, 3000, 2000],
      shizuokaTheme
    ),
  ];
}

function buildBesso3FireOrg(data: RenderData): (Paragraph | Table)[] {
  const rows: string[][] = [
    ["自衛消防隊長", data.leaderName ?? NAME, "自衛消防活動全般の指揮統括"],
    ["通報連絡班", data.tsuhouMember ?? NAME, "119番通報、館内放送、関係機関への連絡"],
    ["初期消火班", data.shokaMember ?? NAME, "消火器・屋内消火栓設備等による初期消火"],
    ["避難誘導班", data.hinanMember ?? NAME, "在館者の避難誘導、避難経路の確保"],
    ["救護班", data.kyugoMember ?? NAME, "負傷者の応急救護、救護所の設置"],
    ["安全防護班", data.anzenMember ?? NAME, "防火戸の閉鎖、火気・電源の遮断、二次災害の防止"],
  ];
  return [
    pageBreak(),
    sectionHeading("別表３　自衛消防組織編成表"),
    styledTable(["班", "編成（氏名）", "任務"], rows, [2200, 3826, 3000], shizuokaTheme),
  ];
}

function buildBesso4FireMaster(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    sectionHeading("別表４　火元責任者組織編成表"),
    styledTable(
      ["区域・階", "火元責任者", "担当業務"],
      [
        [B, NAME, "担当区域の日常の火気管理・自主点検"],
        [B, NAME, "担当区域の日常の火気管理・自主点検"],
        [B, NAME, "担当区域の日常の火気管理・自主点検"],
      ],
      [3026, 3000, 3000],
      shizuokaTheme
    ),
  ];
}

function buildBeshiDrill(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    sectionHeading("別紙　自衛消防訓練等通知書"),
    styledTable(
      ["項目", "内容"],
      [
        ["実施予定日時", B],
        ["訓練種別（消火・通報・避難・総合）", B],
        ["実施場所", B],
        ["参加予定人数", B],
      ],
      [3026, 6000],
      shizuokaTheme
    ),
  ];
}

export function buildShizuokaAppendixList(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    sectionHeading("別表・別紙一覧"),
    styledTable(
      ["区分", "名称"],
      [
        ["別表１", "自主点検表"],
        ["別表２", "消防法令に基づく点検実施表"],
        ["別表３", "自衛消防組織編成表"],
        ["別表４", "火元責任者組織編成表"],
        ["別紙", "自衛消防訓練等通知書"],
      ],
      [1800, 7226],
      shizuokaTheme
    ),
  ];
}

export function buildShizuokaAppendices(data: RenderData): (Paragraph | Table)[] {
  return [
    ...buildBesso1SelfInspect(),
    ...buildBesso2LegalInspect(),
    ...buildBesso3FireOrg(data),
    ...buildBesso4FireMaster(),
    ...buildBeshiDrill(),
  ];
}
