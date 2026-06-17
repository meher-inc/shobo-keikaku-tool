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
 * 岡山市消防局（中規模用）別表ビルダ。
 *
 * 出典: 岡山市「消防計画書（中規模用）」
 *   https://www.city.okayama.jp/shisei/0000010322.html
 *
 * 公式様式はWordの表・テキストボックス多用の記入式フォームのため、
 * 散文版本文（19節）から参照される記入式フォームをブランク表
 * （別表1〜4）として再構成したもの。
 */

const okayamaTheme: TableTheme = {
  headerFill: "2E5F9E",
  altFill: "EEF4FA",
};

const B = "";
const NAME = "(　　　　)";

function buildAppendix1Org(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("１", "防火管理体制の組織及び業務分担"),
    styledTable(
      ["区分", "氏名", "担当業務"],
      [
        ["管理権原者", NAME, B],
        ["防火管理者", NAME, B],
        ["防火担当責任者", NAME, B],
        ["火元責任者", NAME, B],
        ["火元責任者", NAME, B],
      ],
      [2600, 2426, 4000],
      okayamaTheme
    ),
  ];
}

function buildAppendix2FireOrg(data: RenderData): (Paragraph | Table)[] {
  const rows: string[][] = [
    ["自衛消防隊長", data.leaderName ?? NAME, "自衛消防隊の全般指揮"],
    ["副隊長", data.leaderName ?? NAME, "隊長の補佐、避難誘導の指揮"],
    ["通報連絡班", data.tsuhouMember ?? NAME, "“119”通報及び関係先への連絡"],
    ["初期消火班", data.shokaMember ?? NAME, "消火器・屋内消火栓等による初期消火"],
    ["避難誘導班", data.hinanMember ?? NAME, "在館者の避難誘導"],
    ["安全班", data.anzenMember ?? NAME, "電気・ガス等の安全措置、防火戸の閉鎖"],
  ];
  return [
    pageBreak(),
    appendixHeading("２", "自衛消防隊の編成"),
    styledTable(["班", "編成（氏名）", "主な任務"], rows, [2200, 3826, 3000], okayamaTheme),
  ];
}

function buildAppendix3Equip(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("３", "消防用設備等の担当者"),
    styledTable(
      ["設備名", "各階設置数", "担当（昼間）", "担当（夜間）"],
      [
        ["消火器", B, NAME, NAME],
        ["自動火災報知設備", B, NAME, NAME],
        ["屋内消火栓", B, NAME, NAME],
        ["特殊消火設備", B, NAME, NAME],
        ["避難器具", B, NAME, NAME],
      ],
      [2600, 2200, 2226, 2000],
      okayamaTheme
    ),
  ];
}

function buildAppendix4InspectPlan(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("４", "法定点検計画"),
    styledTable(
      ["設備名", "委託業者名"],
      [
        [B, B],
        [B, B],
        [B, B],
        [B, B],
      ],
      [3026, 6000],
      okayamaTheme
    ),
  ];
}

export function buildOkayamaAppendixList(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    sectionHeading("別表等一覧"),
    styledTable(
      ["番号", "名称"],
      [
        ["別表１", "防火管理体制の組織及び業務分担"],
        ["別表２", "自衛消防隊の編成"],
        ["別表３", "消防用設備等の担当者"],
        ["別表４", "法定点検計画"],
      ],
      [1500, 7526],
      okayamaTheme
    ),
  ];
}

export function buildOkayamaAppendices(data: RenderData): (Paragraph | Table)[] {
  return [
    ...buildAppendix1Org(),
    ...buildAppendix2FireOrg(data),
    ...buildAppendix3Equip(),
    ...buildAppendix4InspectPlan(),
  ];
}
