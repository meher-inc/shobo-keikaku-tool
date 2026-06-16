import type { Paragraph, Table } from "docx";
import type { RenderData } from "../../helpers/placeholder";
import type { TableTheme } from "../shared/table-helpers";
import { styledTable } from "../shared/table-helpers";
import { pageBreak, sectionHeading } from "../shared/paragraph-helpers";

/**
 * 新潟市消防局（その他用途・中規模）別表・別紙ビルダ。
 *
 * 出典: 新潟市「消防計画作成例（その他の用途・中規模）keikaku-sonota」
 *   https://www.city.niigata.lg.jp/kurashi/bohan/shobo/sinsei_todokede/sinsei_todokede/keikaku-sakuseirei.html
 *
 * 本文（第4条・第11条）から参照される記入式フォーム。
 */

const niigataTheme: TableTheme = {
  headerFill: "2E5F9E",
  altFill: "EEF4FA",
};

const B = "";

function buildBeshi1(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    sectionHeading("別紙１　自主検査票（その１）「火気・電気関係」"),
    styledTable(
      ["検査項目", "結果"],
      [
        ["火気使用設備器具の周囲に可燃物はないか", B],
        ["使用後の火気の確認（消火）はされているか", B],
        ["電気器具のコード・プラグに損傷・たこ足配線はないか", B],
        ["喫煙場所以外での喫煙はないか", B],
      ],
      [8026, 1000],
      niigataTheme
    ),
  ];
}

function buildBeshi2(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    sectionHeading("別紙２　自主検査票（その２）「避難・設備関係」"),
    styledTable(
      ["検査項目", "結果"],
      [
        ["避難通路・階段・避難口に障害物はないか", B],
        ["防火戸・防火シャッターは閉鎖できる状態か", B],
        ["消火器・屋内消火栓設備に異常はないか", B],
        ["誘導灯・誘導標識は点灯・視認できるか", B],
      ],
      [8026, 1000],
      niigataTheme
    ),
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
      niigataTheme
    ),
  ];
}

export function buildNiigataAppendixList(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    sectionHeading("別表・別紙一覧"),
    styledTable(
      ["区分", "名称"],
      [
        ["別紙１", "自主検査票（その１）「火気・電気関係」"],
        ["別紙２", "自主検査票（その２）「避難・設備関係」"],
        ["別表", "防火管理業務の委託状況"],
      ],
      [1800, 7226],
      niigataTheme
    ),
  ];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function buildNiigataAppendices(_data: RenderData): (Paragraph | Table)[] {
  return [
    ...buildBeshi1(),
    ...buildBeshi2(),
    ...buildBessoOutsource(),
  ];
}
