import type { Paragraph, Table } from "docx";
import type { RenderData } from "../../helpers/placeholder";
import type { TableTheme } from "../shared/table-helpers";
import { styledTable } from "../shared/table-helpers";
import {
  appendixHeading,
  pageBreak,
  sectionHeading,
} from "../shared/paragraph-helpers";

/**
 * 北九州市消防局（中・大規模用）別表ビルダ。
 *
 * 出典: 北九州市「消防計画（中規模、大規模防火対象物用）」
 *   https://www.city.kitakyushu.lg.jp/shoubou/file_0260.html
 *
 * 本文（第18条・第24条・第36条 ほか）から参照される記入式フォーム。
 */

const kitakyushuTheme: TableTheme = {
  headerFill: "2E5F9E",
  altFill: "EEF4FA",
};

const B = "";
const NAME = "(　　　　)";

function buildAppendix1Inspect(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("１", "自主検査チェック票"),
    styledTable(
      ["区分", "検査項目", "結果"],
      [
        ["建物", "壁・床・天井・階段に損傷・ひび割れはないか", B],
        ["避難施設", "避難通路・階段・避難口に障害物はないか、防火戸は閉鎖できるか", B],
        ["火気使用設備器具", "可燃物からの離隔距離は適正か、安全装置は機能するか", B],
        ["電気設備", "コードの損傷・たこ足配線はないか", B],
        ["危険物施設等", "貯蔵・取扱いは適正で、漏れ・転倒防止措置はあるか", B],
      ],
      [2200, 5826, 1000],
      kitakyushuTheme
    ),
  ];
}

function buildAppendix2FireOrg(data: RenderData): (Paragraph | Table)[] {
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
    appendixHeading("２", "自衛消防隊の編成"),
    styledTable(["班", "編成（氏名）", "任務"], rows, [2200, 3826, 3000], kitakyushuTheme),
  ];
}

function buildAppendix3InspectPlan(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("３", "消防用設備等点検計画表"),
    styledTable(
      ["設備名", "機器点検（6か月）", "総合点検（1年）", "点検者"],
      [
        ["消火器", B, B, NAME],
        ["屋内消火栓設備", B, B, NAME],
        ["自動火災報知設備", B, B, NAME],
        ["避難器具・誘導灯", B, B, NAME],
      ],
      [2600, 2200, 2200, 2026],
      kitakyushuTheme
    ),
  ];
}

function buildAppendix4Outsource(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("４", "防火管理業務の委託状況"),
    styledTable(
      ["項目", "内容"],
      [
        ["受託者の氏名（名称）・住所", B],
        ["方式（常駐・巡回・遠隔移報）", B],
        ["管理（委託）区域", B],
        ["委託時間帯", B],
        ["委託契約の期間", B],
      ],
      [3026, 6000],
      kitakyushuTheme
    ),
  ];
}

export function buildKitakyushuAppendixList(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    sectionHeading("別表一覧"),
    styledTable(
      ["番号", "名称"],
      [
        ["別表１", "自主検査チェック票"],
        ["別表２", "自衛消防隊の編成"],
        ["別表３", "消防用設備等点検計画表"],
        ["別表４", "防火管理業務の委託状況"],
      ],
      [1500, 7526],
      kitakyushuTheme
    ),
  ];
}

export function buildKitakyushuAppendices(data: RenderData): (Paragraph | Table)[] {
  return [
    ...buildAppendix1Inspect(),
    ...buildAppendix2FireOrg(data),
    ...buildAppendix3InspectPlan(),
    ...buildAppendix4Outsource(),
  ];
}
