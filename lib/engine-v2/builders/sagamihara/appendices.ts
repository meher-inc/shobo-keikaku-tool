import type { Paragraph, Table } from "docx";
import type { RenderData } from "../../helpers/placeholder";
import type { TableTheme } from "../shared/table-helpers";
import { styledTable } from "../shared/table-helpers";
import { pageBreak, sectionHeading } from "../shared/paragraph-helpers";

/**
 * 相模原市消防局（中規模用）別表ビルダ。
 *
 * 出典: 相模原市「中規模用消防計画（作成例）1-3-3」
 *   https://www.city.sagamihara.kanagawa.jp/shinseisho_menu/syoubo/1011884/1011889/1011892.html
 *
 * 本文（4・12・14条相当の節）から参照される記入式フォーム。
 */

const sagamiharaTheme: TableTheme = {
  headerFill: "2E5F9E",
  altFill: "EEF4FA",
};

const B = "";
const NAME = "(　　　　)";

function buildBesso2Daily(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    sectionHeading("別表２　自主検査チェック表（日常）"),
    styledTable(
      ["検査項目", "結果"],
      [
        ["火気使用設備器具の周囲に可燃物はないか、使用後の確認はされているか", B],
        ["避難通路・避難口に障害物はないか", B],
        ["電気器具のコード・たこ足配線に異常はないか", B],
        ["喫煙場所以外での喫煙はないか", B],
      ],
      [8026, 1000],
      sagamiharaTheme
    ),
  ];
}

function buildBesso3Periodic(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    sectionHeading("別表３　自主検査チェック表（定期）"),
    styledTable(
      ["区分", "検査項目", "結果"],
      [
        ["建物", "壁・床・天井・階段に損傷・ひび割れはないか", B],
        ["防火区画", "防火戸・防火シャッターの機能は保持されているか", B],
        ["避難施設", "避難器具の設置・操作に障害はないか", B],
        ["火気設備", "安全装置は機能し、保有距離は適正か", B],
      ],
      [2200, 5826, 1000],
      sagamiharaTheme
    ),
  ];
}

function buildBesso4Quake(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    sectionHeading("別表４　地震対策（転倒・落下防止）チェック表"),
    styledTable(
      ["対象", "措置", "結果"],
      [
        ["看板・装飾塔等", "倒壊・転倒・落下防止措置がされているか", B],
        ["家具類・什器", "転倒・落下・移動防止措置がされているか", B],
        ["火気使用設備器具", "上部・周囲に転倒落下のおそれのある物品はないか", B],
      ],
      [2600, 5426, 1000],
      sagamiharaTheme
    ),
  ];
}

function buildBesso5Equip(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    sectionHeading("別表５　消防用設備等自主点検チェック表"),
    styledTable(
      ["設備名", "点検項目", "結果"],
      [
        ["消火器", "設置場所・外形・圧力に異常はないか", B],
        ["屋内消火栓設備", "ホース・ノズル・開閉弁に損傷・障害はないか", B],
        ["自動火災報知設備", "受信機・感知器の表示・機能に異常はないか", B],
        ["避難器具・誘導灯", "設置・操作・点灯に障害はないか", B],
      ],
      [2600, 5426, 1000],
      sagamiharaTheme
    ),
  ];
}

function buildBesso8FireOrg(data: RenderData): (Paragraph | Table)[] {
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
    sectionHeading("別表８　自衛消防隊の編成と任務"),
    styledTable(["班", "編成（氏名）", "任務"], rows, [2200, 3826, 3000], sagamiharaTheme),
  ];
}

function buildBessoOutsource(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    sectionHeading("別表　防火管理業務の委託状況"),
    styledTable(
      ["項目", "内容"],
      [
        ["受託者の氏名（名称）・住所", B],
        ["方式（常駐・巡回・遠隔移報）", B],
        ["委託する業務の範囲", B],
        ["業務の時間帯", B],
      ],
      [3026, 6000],
      sagamiharaTheme
    ),
  ];
}

export function buildSagamiharaAppendixList(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    sectionHeading("別表等一覧"),
    styledTable(
      ["区分", "名称"],
      [
        ["別表２", "自主検査チェック表（日常）"],
        ["別表３", "自主検査チェック表（定期）"],
        ["別表４", "地震対策（転倒・落下防止）チェック表"],
        ["別表５", "消防用設備等自主点検チェック表"],
        ["別表８", "自衛消防隊の編成と任務"],
        ["別表", "防火管理業務の委託状況"],
      ],
      [1800, 7226],
      sagamiharaTheme
    ),
  ];
}

export function buildSagamiharaAppendices(data: RenderData): (Paragraph | Table)[] {
  return [
    ...buildBesso2Daily(),
    ...buildBesso3Periodic(),
    ...buildBesso4Quake(),
    ...buildBesso5Equip(),
    ...buildBesso8FireOrg(data),
    ...buildBessoOutsource(),
  ];
}
