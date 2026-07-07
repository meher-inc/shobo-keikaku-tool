import type { Paragraph, Table } from "docx";
import type { RenderData } from "../../helpers/placeholder";
import { styledTable } from "../shared/table-helpers";
import {
  appendixHeading,
  pageBreak,
  plainText,
  sectionHeading,
  spacerParagraph,
} from "../shared/paragraph-helpers";
import { constructionTheme } from "./cover";

/**
 * 工事中の消防計画の別表ビルダー。
 *
 * 通常計画の別表（自主検査表等）と異なり、工事中は「承認・届出の
 * 記録様式」が実務の中心になるため、次の5表を同梱する。
 *   別表１　工事概要書（入力値プリフィル）
 *   別表２　火気使用工事 事前承認書（記入様式）
 *   別表３　危険物品持込届（記入様式）
 *   別表４　工事中の自衛消防隊編成及び緊急連絡先一覧（プリフィル）
 *   別表５　工事中の防火巡回チェック表（記入様式）
 */

const table = (headers: string[], rows: string[][], widths: number[]): Table =>
  styledTable(headers, rows, widths, constructionTheme);

const v = (x?: string) => (x && x.trim() ? x : "");

// ── 別表1 工事概要書 ──────────────────────────────────────────

function buildAppendix1(data: RenderData): (Paragraph | Table)[] {
  const period = [v(data.constructionStart), v(data.constructionEnd)]
    .filter(Boolean)
    .join(" 〜 ");
  return [
    pageBreak(),
    appendixHeading("１", "工事概要書"),
    table(
      ["項目", "内容"],
      [
        ["工事名称", v(data.constructionName)],
        ["工事種別", v(data.constructionType)],
        ["工事範囲（階・部分）", v(data.constructionScope)],
        ["工事期間", period],
        ["施工者（元請）", v(data.contractorName)],
        ["現場責任者", v(data.constructionSiteManager)],
        ["施工者連絡先", v(data.contractorTel)],
        ["火気を使用する工事の有無", v(data.hotWork) === "true" ? "有" : "有 ・ 無（該当に○）"],
        ["危険物品の持込み予定", v(data.hazmatUse) === "true" ? "有" : "有 ・ 無（該当に○）"],
        ["機能停止予定の消防用設備等", v(data.equipmentShutdown)],
        ["主な工程（着工〜完了）", ""],
        ["備考", ""],
      ],
      [3200, 6200]
    ),
    spacerParagraph(),
    plainText("※　工事工程表及び工事範囲を示した平面図を添付すること。"),
  ];
}

// ── 別表2 火気使用工事 事前承認書 ─────────────────────────────

function buildAppendix2(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("２", "火気使用工事 事前承認書"),
    plainText("　溶接・溶断・グラインダー等の火花又は火気を使用する作業を行うときは、作業の都度、本書により防火管理者の承認を受けること。"),
    table(
      ["項目", "記入欄"],
      [
        ["申請日", "　　年　　月　　日"],
        ["申請者（工事人）", ""],
        ["作業内容（溶接・溶断・グラインダー等）", ""],
        ["作業場所（階・部分）", ""],
        ["作業日時", "　　年　　月　　日　　時　〜　　時"],
        ["可燃物の除去・養生", "実施した ・ 該当なし"],
        ["消火器等の準備", "準備した（本数：　　本）"],
        ["監視人の配置", "氏名：　　　　　　　　"],
        ["作業後の残火確認（30分以上経過後の再確認）", "実施予定時刻：　　時　　分"],
        ["防火管理者 承認欄", "承認日：　　年　　月　　日　氏名：　　　　　　　　㊞"],
      ],
      [4200, 5200]
    ),
  ];
}

// ── 別表3 危険物品持込届 ──────────────────────────────────────

function buildAppendix3(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("３", "危険物品持込届"),
    plainText("　塗料・シンナー・接着剤・燃料・高圧ガス容器等を持ち込むときは、事前に本書により防火管理者に届け出て承認を受けること。"),
    table(
      ["品名", "数量", "使用場所", "保管場所・方法", "持込期間"],
      [
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
      ],
      [2200, 1400, 1900, 2200, 1700]
    ),
    spacerParagraph(),
    plainText("届出者（工事人）：　　　　　　　　　　防火管理者 承認欄：　　　　　　　　㊞"),
    plainText("※　持込量は当日の使用に必要な最小限度とし、残量は原則としてその日のうちに搬出すること。"),
  ];
}

// ── 別表4 工事中の自衛消防隊編成及び緊急連絡先一覧 ─────────────

function buildAppendix4(data: RenderData): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("４", "工事中の自衛消防隊編成及び緊急連絡先一覧"),
    sectionHeading("１　自衛消防隊の編成"),
    table(
      ["任務", "担当者", "主な活動"],
      [
        ["隊長", v(data.leaderName), "指揮・統括"],
        ["通報連絡", v(data.tsuhouMember), "１１９番通報・関係者への連絡"],
        ["初期消火", v(data.shokaMember), "消火器等による初期消火"],
        ["避難誘導", v(data.hinanMember), "利用者・工事人の避難誘導"],
        ["現場責任者（施工者側）", v(data.constructionSiteManager), "工事人への伝達・工事部分の確認"],
      ],
      [2400, 3000, 4026]
    ),
    spacerParagraph(),
    sectionHeading("２　緊急連絡先"),
    table(
      ["連絡先", "氏名・名称", "電話番号"],
      [
        ["消防機関（火災・救急）", "―", "１１９"],
        ["防火管理者", v(data.managerName), v(data.managerContact)],
        ["緊急連絡先", v(data.emergencyContactName), v(data.emergencyContactPhone)],
        ["施工者（元請）", v(data.contractorName), v(data.contractorTel)],
        ["警備会社等", v(data.securityCompany), ""],
      ],
      [2800, 3300, 3326]
    ),
  ];
}

// ── 別表5 工事中の防火巡回チェック表 ──────────────────────────

function buildAppendix5(): (Paragraph | Table)[] {
  const items = [
    "避難通路・階段・避難口が資材等で塞がれていないか",
    "防火戸・防火シャッターの閉鎖に支障となる物件がないか",
    "火気使用作業の承認・監視・残火確認が行われているか",
    "危険物品が届出どおりに保管・搬出されているか",
    "可燃性の廃材等が放置されていないか（放火防止）",
    "喫煙が指定場所で行われているか",
    "消防用設備等の機能停止時の代替措置が講じられているか",
    "作業終了後の施錠・戸締りが行われているか",
  ];
  return [
    pageBreak(),
    appendixHeading("５", "工事中の防火巡回チェック表"),
    plainText("　防火管理者又はその指定する者は、工事期間中、次の事項を巡回時に確認し、記録する。"),
    table(
      ["確認事項", "月　日", "月　日", "月　日", "月　日"],
      items.map((i) => [i, "", "", "", ""]),
      [4826, 1050, 1050, 1050, 1050]
    ),
    spacerParagraph(),
    plainText("記入例：良→○、不備あり→×（不備の内容と是正結果を欄外に記録）"),
  ];
}

// ── public API ────────────────────────────────────────────────

export function buildConstructionAppendixList(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    sectionHeading("別表等一覧"),
    plainText("・別表１　工事概要書"),
    plainText("・別表２　火気使用工事 事前承認書"),
    plainText("・別表３　危険物品持込届"),
    plainText("・別表４　工事中の自衛消防隊編成及び緊急連絡先一覧"),
    plainText("・別表５　工事中の防火巡回チェック表"),
  ];
}

export function buildConstructionAppendices(data: RenderData): (Paragraph | Table)[] {
  return [
    ...buildAppendix1(data),
    ...buildAppendix2(),
    ...buildAppendix3(),
    ...buildAppendix4(data),
    ...buildAppendix5(),
  ];
}
