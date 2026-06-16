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
 * 広島市消防局 別表・別紙ビルダ。
 *
 * 出典: 広島市「消防計画（様式）shouboukeikaku_word」
 *   https://www.city.hiroshima.lg.jp/living/shobo-bohan/1006085/1025612/1033050/1033051.html
 *
 * 本文（第14条・第8条・第22条・第25条）から参照される記入式フォーム。
 */

const hiroshimaTheme: TableTheme = {
  headerFill: "2E5F9E",
  altFill: "EEF4FA",
};

const B = "";
const NAME = "(　　　　)";

function buildBessoFireOrg(data: RenderData): (Paragraph | Table)[] {
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
    appendixHeading("", "自衛消防隊の編成と任務"),
    styledTable(["班", "編成（氏名）", "任務"], rows, [2200, 3826, 3000], hiroshimaTheme),
  ];
}

function buildBeshi1Inspect(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    sectionHeading("別紙１　消防用設備等・特殊消防用設備等自主点検チェック表"),
    styledTable(
      ["実施設備", "確認箇所", "点検結果"],
      [
        ["消火器", "設置場所・薬剤の漏れ・変形・損傷・腐食・安全栓に異常はないか", B],
        ["屋内消火栓設備", "ホース・ノズル・開閉弁に損傷・使用障害はないか", B],
        ["自動火災報知設備", "受信機・感知器の表示・機能に異常はないか", B],
        ["避難器具・誘導灯", "設置・操作・点灯に障害はないか", B],
      ],
      [2400, 5626, 1000],
      hiroshimaTheme
    ),
  ];
}

function buildBeshi2Drill(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    sectionHeading("別紙２　自衛消防訓練通報書"),
    styledTable(
      ["項目", "内容"],
      [
        ["実施予定日時", B],
        ["訓練種別（消火・通報・避難・総合）", B],
        ["実施場所", B],
        ["参加予定人数", B],
      ],
      [3026, 6000],
      hiroshimaTheme
    ),
  ];
}

function buildBeshi3Outsource(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    sectionHeading("別紙３　防火管理業務の委託状況"),
    styledTable(
      ["項目", "内容"],
      [
        ["受託者の氏名（名称）・住所", B],
        ["担当事業所・所在地・TEL", B],
        ["受託する防火管理業務の範囲", B],
        ["業務の方法（常駐・巡回・遠隔）", B],
      ],
      [3026, 6000],
      hiroshimaTheme
    ),
  ];
}

export function buildHiroshimaAppendixList(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    sectionHeading("別表・別紙一覧"),
    styledTable(
      ["区分", "名称"],
      [
        ["別表", "自衛消防隊の編成と任務"],
        ["別紙１", "消防用設備等・特殊消防用設備等自主点検チェック表"],
        ["別紙２", "自衛消防訓練通報書"],
        ["別紙３", "防火管理業務の委託状況"],
      ],
      [1800, 7226],
      hiroshimaTheme
    ),
  ];
}

export function buildHiroshimaAppendices(data: RenderData): (Paragraph | Table)[] {
  return [
    ...buildBessoFireOrg(data),
    ...buildBeshi1Inspect(),
    ...buildBeshi2Drill(),
    ...buildBeshi3Outsource(),
  ];
}
