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
 * 仙台市消防局（大規模用・防火）別表ビルダ。
 *
 * 出典: 仙台市「消防計画作成例（大規模用 bouka01）」
 *   https://www.city.sendai.jp/yobo-shido/download/bunyabetsu/bosai/kasai/shobo.html
 *
 * 本文（自衛消防隊／火災予防上の点検等）から参照される記入式フォーム。
 */

const sendaiTheme: TableTheme = {
  headerFill: "2E5F9E",
  altFill: "EEF4FA",
};

const B = "";
const NAME = "(　　　　)";

function buildAppendix1FireOrg(data: RenderData): (Paragraph | Table)[] {
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
    appendixHeading("１", "自衛消防隊の編成と任務"),
    styledTable(["班", "編成（氏名）", "任務"], rows, [2200, 3826, 3000], sendaiTheme),
  ];
}

function buildAppendix2aIgnition(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    sectionHeading("別表２－１　自主検査チェック表（出火防止）"),
    styledTable(
      ["検査項目", "結果"],
      [
        ["火気使用設備器具の周囲に可燃物はないか", B],
        ["使用後の火気の確認（消火）はされているか", B],
        ["喫煙場所以外での喫煙はないか", B],
        ["電気器具のコード・プラグに損傷・たこ足配線はないか", B],
      ],
      [8026, 1000],
      sendaiTheme
    ),
  ];
}

function buildAppendix2bEvac(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    sectionHeading("別表２－２　自主検査チェック表（避難安全等）"),
    styledTable(
      ["検査項目", "結果"],
      [
        ["避難通路・階段に避難障害となる物品はないか", B],
        ["避難口・防火戸の閉鎖障害となる物品はないか", B],
        ["防火戸・防火シャッターは閉鎖できる状態か", B],
        ["誘導灯・誘導標識は点灯・視認できるか", B],
      ],
      [8026, 1000],
      sendaiTheme
    ),
  ];
}

function buildAppendix3Equip(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("３", "消防用設備等自主点検チェック表"),
    styledTable(
      ["設備名", "点検項目", "結果"],
      [
        ["消火器", "設置場所・外形・圧力に異常はないか", B],
        ["屋内消火栓設備", "ホース・ノズル・開閉弁に損傷・障害はないか", B],
        ["自動火災報知設備", "受信機・感知器の表示・機能に異常はないか", B],
        ["避難器具・誘導灯", "設置・操作・点灯に障害はないか", B],
      ],
      [2600, 5426, 1000],
      sendaiTheme
    ),
  ];
}

function buildBeshiOutsource(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    sectionHeading("別紙　防火管理業務委託状況票"),
    styledTable(
      ["項目", "内容"],
      [
        ["受託者の氏名（名称）・住所", B],
        ["担当事業所・所在地・TEL", B],
        ["受託する防火管理業務の範囲", B],
        ["業務の方法（常駐・巡回・遠隔移報）", B],
      ],
      [3026, 6000],
      sendaiTheme
    ),
  ];
}

export function buildSendaiAppendixList(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    sectionHeading("別表・別紙一覧"),
    styledTable(
      ["区分", "名称"],
      [
        ["別表１", "自衛消防隊の編成と任務"],
        ["別表２－１", "自主検査チェック表（出火防止）"],
        ["別表２－２", "自主検査チェック表（避難安全等）"],
        ["別表３", "消防用設備等自主点検チェック表"],
        ["別紙", "防火管理業務委託状況票"],
      ],
      [2000, 7026],
      sendaiTheme
    ),
  ];
}

export function buildSendaiAppendices(data: RenderData): (Paragraph | Table)[] {
  return [
    ...buildAppendix1FireOrg(data),
    ...buildAppendix2aIgnition(),
    ...buildAppendix2bEvac(),
    ...buildAppendix3Equip(),
    ...buildBeshiOutsource(),
  ];
}
