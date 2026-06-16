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
 * さいたま市消防局（中規模用）別表ビルダ。
 *
 * 出典: 千葉市「消防計画ひな型（中規模建物用 tyuukibo）」
 *   https://www.city.chiba.lg.jp/001/011/014/011/004/p058184.html
 *
 * 本文（第4・第5・第6・第10条相当の節）から参照される記入式フォーム（別表1〜9）。
 */

const chibaTheme: TableTheme = {
  headerFill: "2E5F9E",
  altFill: "EEF4FA",
};

const B = "";
const NAME = "(　　　　)";

function buildAppendix1Notice(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("１", "日常の火災予防の担当者と日常の注意事項"),
    styledTable(
      ["担当者", "日常の注意事項"],
      [
        [NAME, "火気使用設備器具の点検・消火の確認"],
        [NAME, "喫煙管理・吸い殻の処理"],
        [NAME, "避難通路・避難口の確保"],
        [NAME, "電気器具・配線の点検"],
      ],
      [3026, 6000],
      chibaTheme
    ),
  ];
}

function buildAppendix2DailyFire(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("２", "自主検査チェック票（日常）「火気関係」"),
    styledTable(
      ["検査項目", "結果"],
      [
        ["火気使用設備器具の周囲に可燃物はないか", B],
        ["使用後の火気の確認（消火）はされているか", B],
        ["喫煙場所以外での喫煙はないか", B],
        ["電気器具のコード・プラグに損傷・たこ足配線はないか", B],
      ],
      [8026, 1000],
      chibaTheme
    ),
  ];
}

function buildAppendix3DailyBlock(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("３", "自主検査チェック票（日常）「閉鎖障害等」"),
    styledTable(
      ["検査項目", "結果"],
      [
        ["避難通路・階段に避難障害となる物品はないか", B],
        ["避難口・防火戸の閉鎖障害となる物品はないか", B],
        ["防火戸・防火シャッターは閉鎖できる状態か", B],
        ["誘導灯・誘導標識は点灯・視認できるか", B],
      ],
      [8026, 1000],
      chibaTheme
    ),
  ];
}

function buildAppendix4Periodic(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("４", "自主検査チェック票（定期）"),
    styledTable(
      ["区分", "検査項目", "結果"],
      [
        ["建物", "壁・床・天井・階段に損傷・ひび割れはないか", B],
        ["防火区画", "防火戸・防火シャッターの機能は保持されているか", B],
        ["避難施設", "避難器具の設置・操作に障害はないか", B],
        ["火気設備", "火気使用設備器具の安全装置は機能するか", B],
      ],
      [2200, 5826, 1000],
      chibaTheme
    ),
  ];
}

function buildAppendix5EquipInspect(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("５", "消防用設備等・特殊消防用設備等自主点検チェック票"),
    styledTable(
      ["設備名", "点検項目", "結果"],
      [
        ["消火器", "設置場所・外形・圧力に異常はないか", B],
        ["屋内消火栓設備", "ホース・ノズル・開閉弁に損傷・障害はないか", B],
        ["自動火災報知設備", "受信機・感知器の表示・機能に異常はないか", B],
        ["避難器具・誘導灯", "設置・操作・点灯に障害はないか", B],
      ],
      [2600, 5426, 1000],
      chibaTheme
    ),
  ];
}

function buildAppendix6InspectPlan(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("６", "消防用設備等・特殊消防用設備等点検計画表"),
    styledTable(
      ["設備名", "機器点検（6か月）", "総合点検（1年）", "点検者"],
      [
        ["消火器", B, B, NAME],
        ["屋内消火栓設備", B, B, NAME],
        ["自動火災報知設備", B, B, NAME],
        ["避難器具", B, B, NAME],
      ],
      [2600, 2200, 2200, 2026],
      chibaTheme
    ),
  ];
}

function buildAppendix7FireOrg(data: RenderData): (Paragraph | Table)[] {
  const rows: string[][] = [
    ["本部隊・隊長", data.leaderName ?? NAME, "自衛消防活動全般の指揮統括"],
    ["通報連絡班", data.tsuhouMember ?? NAME, "119番通報、館内放送、関係機関への連絡"],
    ["初期消火班", data.shokaMember ?? NAME, "消火器・屋内消火栓設備等による初期消火"],
    ["避難誘導班", data.hinanMember ?? NAME, "在館者の避難誘導、避難経路の確保"],
    ["救護班", data.kyugoMember ?? NAME, "負傷者の応急救護、救護所の設置"],
    ["安全防護班", data.anzenMember ?? NAME, "防火戸の閉鎖、火気・電源の遮断、二次災害の防止"],
  ];
  return [
    pageBreak(),
    appendixHeading("７", "自衛消防隊の編成と任務"),
    styledTable(["班", "編成（氏名）", "任務"], rows, [2200, 3826, 3000], chibaTheme),
  ];
}

function buildAppendix8DrillResult(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("９", "消防訓練実施結果表"),
    styledTable(
      ["実施日", "訓練種別", "参加人数", "内容・反省点"],
      [
        [B, B, B, B],
        [B, B, B, B],
      ],
      [1800, 2200, 1400, 3626],
      chibaTheme
    ),
  ];
}

function buildAppendix9Outsource(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("10", "防火管理業務の一部委託状況表"),
    styledTable(
      ["項目", "内容"],
      [
        ["受託者（氏名・名称）", B],
        ["住所・電話", B],
        ["委託方式（常駐・巡回・遠隔）", B],
        ["委託する業務の範囲", B],
        ["業務の時間帯", B],
      ],
      [3026, 6000],
      chibaTheme
    ),
  ];
}

export function buildChibaAppendixList(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    sectionHeading("別表等一覧"),
    styledTable(
      ["番号", "名称"],
      [
        ["別表１", "日常の火災予防の担当者と日常の注意事項"],
        ["別表２", "自主検査チェック票（日常）「火気関係」"],
        ["別表３", "自主検査チェック票（日常）「閉鎖障害等」"],
        ["別表４", "自主検査チェック票（定期）"],
        ["別表５", "消防用設備等・特殊消防用設備等自主点検チェック票"],
        ["別表６", "消防用設備等・特殊消防用設備等点検計画表"],
        ["別表７", "自衛消防隊の編成と任務"],
        ["別表９", "消防訓練実施結果表"],
        ["別表10", "防火管理業務の一部委託状況表"],
      ],
      [1500, 7526],
      chibaTheme
    ),
  ];
}

export function buildChibaAppendices(data: RenderData): (Paragraph | Table)[] {
  return [
    ...buildAppendix1Notice(),
    ...buildAppendix2DailyFire(),
    ...buildAppendix3DailyBlock(),
    ...buildAppendix4Periodic(),
    ...buildAppendix5EquipInspect(),
    ...buildAppendix6InspectPlan(),
    ...buildAppendix7FireOrg(data),
    ...buildAppendix8DrillResult(),
    ...buildAppendix9Outsource(),
  ];
}
