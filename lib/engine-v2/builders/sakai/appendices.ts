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
 * 堺市消防局（中規模用）別表ビルダ。
 *
 * 出典: 堺市「消防計画（中規模事業所用）keikaku3」
 *   https://www.city.sakai.lg.jp/kurashi/bosai/shobo/shinsei/bokakanri/index.html
 *
 * 本文（総則・予防管理対策・自衛消防活動・防災教育及び訓練等の節）から
 * 参照される記入式フォーム（別表1〜12）。
 */

const sakaiTheme: TableTheme = {
  headerFill: "2E5F9E",
  altFill: "EEF4FA",
};

const B = "";
const NAME = "(　　　　)";

function buildAppendix1Ledger(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("１", "防火管理台帳"),
    styledTable(
      ["項目", "内容"],
      [
        ["防火対象物の名称", B],
        ["所在地", B],
        ["用途・収容人員", B],
        ["管理権原者", B],
        ["防火管理者（選任年月日）", B],
        ["消防計画作成（変更）年月日", B],
      ],
      [3026, 6000],
      sakaiTheme
    ),
  ];
}

function buildAppendix2DailyInspect(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("２", "自主検査表（日常）"),
    styledTable(
      ["検査項目", "結果"],
      [
        ["火気使用設備器具の周囲に可燃物はないか", B],
        ["使用後の火気の確認（消火）はされているか", B],
        ["喫煙場所以外での喫煙はないか", B],
        ["避難通路・避難口に障害物はないか", B],
        ["電気器具のコード・プラグに損傷・たこ足配線はないか", B],
      ],
      [8026, 1000],
      sakaiTheme
    ),
  ];
}

function buildAppendix3PeriodicCheck(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("３", "自主検査チェック表（定期）"),
    styledTable(
      ["区分", "検査項目", "結果"],
      [
        ["建物", "壁・床・天井・階段に損傷・ひび割れはないか", B],
        ["防火区画", "防火戸・防火シャッターの機能は保持されているか", B],
        ["避難施設", "避難器具の設置・操作に障害はないか", B],
        ["火気設備", "火気使用設備器具の安全装置は機能するか", B],
        ["電気設備", "配線・分電盤に損傷・過熱はないか", B],
      ],
      [2200, 5826, 1000],
      sakaiTheme
    ),
  ];
}

function buildAppendix4EquipCheck(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("４", "消防用設備等自主点検チェック表"),
    styledTable(
      ["設備名", "点検項目", "結果"],
      [
        ["消火器", "設置場所・外形・圧力に異常はないか", B],
        ["屋内消火栓設備", "ホース・ノズル・開閉弁に損傷・障害はないか", B],
        ["自動火災報知設備", "受信機・感知器の表示・機能に異常はないか", B],
        ["避難器具・誘導灯", "設置・操作・点灯に障害はないか", B],
      ],
      [2600, 5426, 1000],
      sakaiTheme
    ),
  ];
}

function buildAppendix5InspectOrg(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("５", "自主点検・検査実施組織編成表"),
    styledTable(
      ["担当区分", "氏名", "担当する点検・検査の範囲"],
      [
        ["建物・防火施設", NAME, B],
        ["火気使用設備・器具", NAME, B],
        ["電気設備", NAME, B],
        ["消防用設備等", NAME, B],
        ["危険物施設", NAME, B],
      ],
      [2600, 2426, 4000],
      sakaiTheme
    ),
  ];
}

function buildAppendix6InspectPlan(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("６", "消防用設備等点検計画表"),
    styledTable(
      ["設備名", "機器点検（6か月）", "総合点検（1年）", "点検者"],
      [
        ["消火器", B, B, NAME],
        ["屋内消火栓設備", B, B, NAME],
        ["自動火災報知設備", B, B, NAME],
        ["避難器具", B, B, NAME],
      ],
      [2600, 2200, 2200, 2026],
      sakaiTheme
    ),
  ];
}

function buildAppendix7FireOrg(data: RenderData): (Paragraph | Table)[] {
  const rows: string[][] = [
    ["自衛消防隊長", data.leaderName ?? NAME, "自衛消防活動全般の指揮統括"],
    ["通報連絡班", data.tsuhouMember ?? NAME, "119番通報、館内放送、関係機関への連絡"],
    ["初期消火班", data.shokaMember ?? NAME, "消火器・屋内消火栓設備等による初期消火"],
    ["避難誘導班", data.hinanMember ?? NAME, "在館者の避難誘導、避難経路の確保"],
    ["応急救護班", data.kyugoMember ?? NAME, "負傷者の応急手当、救護所の設置"],
    ["安全防護班", data.anzenMember ?? NAME, "防火戸の閉鎖、火気・電源の遮断、二次災害の防止"],
  ];
  return [
    pageBreak(),
    appendixHeading("７", "自衛消防の組織における編成及び主な任務"),
    styledTable(["班", "編成（氏名）", "主な任務"], rows, [2200, 3826, 3000], sakaiTheme),
  ];
}

function buildAppendix8NightOrg(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("８", "休日・夜間における自衛消防の組織編成表"),
    styledTable(
      ["任務", "氏名", "主な任務"],
      [
        ["通報連絡", NAME, "消防機関への通報、関係者への連絡"],
        ["初期消火", NAME, "消防用設備等による初期消火"],
        ["避難誘導", NAME, "在館者・入館者の避難誘導"],
        ["安全防護", NAME, "防火戸の閉鎖、火気・電源の遮断"],
      ],
      [2600, 2426, 4000],
      sakaiTheme
    ),
  ];
}

function buildAppendix9Education(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("９", "防災教育の実施予定表"),
    styledTable(
      ["実施時期", "実施対象者", "実施回数", "実施者"],
      [
        [B, B, B, NAME],
        [B, B, B, NAME],
        [B, B, B, NAME],
      ],
      [2200, 2826, 1500, 2500],
      sakaiTheme
    ),
  ];
}

function buildAppendix10Drill(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("１０", "自衛消防訓練予定表"),
    styledTable(
      ["訓練種別", "実施時期", "実施対象者", "備考"],
      [
        ["消火訓練", B, B, B],
        ["通報訓練", B, B, B],
        ["避難訓練", B, B, B],
        ["総合訓練", B, B, B],
      ],
      [2200, 2200, 2626, 2000],
      sakaiTheme
    ),
  ];
}

function buildAppendix11FireOrg(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("１１", "火災予防組織編成表（火元責任者）"),
    styledTable(
      ["区域", "火元責任者（氏名）", "担当する業務の範囲"],
      [
        [B, NAME, B],
        [B, NAME, B],
        [B, NAME, B],
        [B, NAME, B],
      ],
      [2600, 2426, 4000],
      sakaiTheme
    ),
  ];
}

function buildAppendix12EmergencyCall(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("１２", "非常呼出簿"),
    styledTable(
      ["氏名", "役職", "連絡先（電話）", "住所"],
      [
        [NAME, B, B, B],
        [NAME, B, B, B],
        [NAME, B, B, B],
        [NAME, B, B, B],
      ],
      [2200, 1826, 2500, 2500],
      sakaiTheme
    ),
  ];
}

export function buildSakaiAppendixList(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    sectionHeading("別表等一覧"),
    styledTable(
      ["番号", "名称"],
      [
        ["別表１", "防火管理台帳"],
        ["別表２", "自主検査表（日常）"],
        ["別表３", "自主検査チェック表（定期）"],
        ["別表４", "消防用設備等自主点検チェック表"],
        ["別表５", "自主点検・検査実施組織編成表"],
        ["別表６", "消防用設備等点検計画表"],
        ["別表７", "自衛消防の組織における編成及び主な任務"],
        ["別表８", "休日・夜間における自衛消防の組織編成表"],
        ["別表９", "防災教育の実施予定表"],
        ["別表１０", "自衛消防訓練予定表"],
        ["別表１１", "火災予防組織編成表（火元責任者）"],
        ["別表１２", "非常呼出簿"],
      ],
      [1500, 7526],
      sakaiTheme
    ),
  ];
}

export function buildSakaiAppendices(data: RenderData): (Paragraph | Table)[] {
  return [
    ...buildAppendix1Ledger(),
    ...buildAppendix2DailyInspect(),
    ...buildAppendix3PeriodicCheck(),
    ...buildAppendix4EquipCheck(),
    ...buildAppendix5InspectOrg(),
    ...buildAppendix6InspectPlan(),
    ...buildAppendix7FireOrg(data),
    ...buildAppendix8NightOrg(),
    ...buildAppendix9Education(),
    ...buildAppendix10Drill(),
    ...buildAppendix11FireOrg(),
    ...buildAppendix12EmergencyCall(),
  ];
}
