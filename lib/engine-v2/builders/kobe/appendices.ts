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
 * 神戸市消防局（オフィスビル用・防火防災）別表ビルダ。
 *
 * 出典: 神戸市「消防計画作成例（オフィスビル用 4-コ）」
 *   https://www.city.kobe.lg.jp/a92906/business/todokede/yousiki/boukabousaikanri.html
 *
 * 本文（第3条・第11条・第13条・第16条・第34条・第36条・第66条 ほか）から
 * 参照される記入式フォーム（別表1〜8）。
 */

const kobeTheme: TableTheme = {
  headerFill: "2E5F9E",
  altFill: "EEF4FA",
};

const B = "";
const NAME = "(　　　　)";

function buildAppendix1Damage(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("１", "被害想定"),
    styledTable(
      ["想定項目", "内容"],
      [
        ["想定地震・規模", B],
        ["人的被害の想定", B],
        ["物的被害の想定", B],
        ["ライフライン被害の想定", B],
        ["対応方針", B],
      ],
      [3026, 6000],
      kobeTheme
    ),
  ];
}

function buildAppendix2Committee(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("２", "防火・防災管理委員会の構成"),
    styledTable(
      ["役職", "氏名", "備考"],
      [
        ["委員長", NAME, "管理権原者"],
        ["副委員長", NAME, "防火・防災管理者"],
        ["委員", NAME, B],
        ["委員", NAME, B],
      ],
      [2200, 3826, 3000],
      kobeTheme
    ),
  ];
}

function buildAppendix3PreventionOrg(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("３", "予防的活動のための組織"),
    styledTable(
      ["階・区域", "防火・防災担当責任者", "火元責任者"],
      [
        [B, NAME, NAME],
        [B, NAME, NAME],
        [B, NAME, NAME],
        [B, NAME, NAME],
      ],
      [3026, 3000, 3000],
      kobeTheme
    ),
  ];
}

function buildAppendix4Inspectors(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("４", "自主点検・検査員"),
    styledTable(
      ["点検・検査の対象", "点検・検査員氏名"],
      [
        ["消防用設備等・特殊消防用設備等", NAME],
        ["建物", NAME],
        ["火気使用設備器具", NAME],
        ["電気設備等", NAME],
      ],
      [5026, 4000],
      kobeTheme
    ),
  ];
}

function buildAppendix5Supplies(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("５", "地震対策用品の管理"),
    styledTable(
      ["品目", "数量", "保管場所", "管理者"],
      [
        ["飲料水・非常食", B, B, NAME],
        ["救急医薬品", B, B, NAME],
        ["懐中電灯・携帯ラジオ", B, B, NAME],
        ["応急復旧用工具", B, B, NAME],
      ],
      [2600, 1400, 3026, 2000],
      kobeTheme
    ),
  ];
}

function buildAppendix6FireOrg(data: RenderData): (Paragraph | Table)[] {
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
    appendixHeading("６", "自衛消防組織の編成"),
    styledTable(["班", "編成（氏名）", "備考"], rows, [2200, 3826, 3000], kobeTheme),
  ];
}

function buildAppendix7Duties(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("７", "自衛消防組織の任務分担"),
    styledTable(
      ["班", "任務分担"],
      [
        ["通報連絡班", "119番通報、自衛消防隊長への報告、館内放送、関係機関・消防隊への情報提供"],
        ["初期消火班", "出火場所への消火器・屋内消火栓設備等による初期消火活動"],
        ["避難誘導班", "避難開始の伝達、非常口の開放、在館者の避難誘導、未避難者の確認"],
        ["救護班", "応急救護所の設置、負傷者の応急手当と搬送"],
        ["安全防護班", "防火戸・防火シャッターの閉鎖、火気・電源の遮断、避難障害物の除去"],
      ],
      [2200, 6826],
      kobeTheme
    ),
  ];
}

function buildAppendix8Contacts(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("８", "関係機関への通報連絡先"),
    styledTable(
      ["連絡先", "電話番号"],
      [
        ["消防（119番）", "119"],
        ["所轄消防署", B],
        ["警察（110番）", "110"],
        ["管理権原者", B],
        ["ビル管理会社・防災センター", B],
        ["電気・ガス・水道", B],
      ],
      [5026, 4000],
      kobeTheme
    ),
  ];
}

export function buildKobeAppendixList(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    sectionHeading("別表等一覧"),
    styledTable(
      ["番号", "名称"],
      [
        ["別表１", "被害想定"],
        ["別表２", "防火・防災管理委員会の構成"],
        ["別表３", "予防的活動のための組織"],
        ["別表４", "自主点検・検査員"],
        ["別表５", "地震対策用品の管理"],
        ["別表６", "自衛消防組織の編成"],
        ["別表７", "自衛消防組織の任務分担"],
        ["別表８", "関係機関への通報連絡先"],
      ],
      [1500, 7526],
      kobeTheme
    ),
  ];
}

export function buildKobeAppendices(data: RenderData): (Paragraph | Table)[] {
  return [
    ...buildAppendix1Damage(),
    ...buildAppendix2Committee(),
    ...buildAppendix3PreventionOrg(),
    ...buildAppendix4Inspectors(),
    ...buildAppendix5Supplies(),
    ...buildAppendix6FireOrg(data),
    ...buildAppendix7Duties(),
    ...buildAppendix8Contacts(),
  ];
}
