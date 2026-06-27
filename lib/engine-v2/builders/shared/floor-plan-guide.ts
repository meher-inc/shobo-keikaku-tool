import {
  BorderStyle,
  HeightRule,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  WidthType,
} from "docx";
import type { RenderData } from "../../helpers/placeholder";
import { sectionHeading, plainText, pageBreak, spacerParagraph } from "./paragraph-helpers";

// 方眼テンプレートの寸法。
const GRID_COLS = 16;
const GRID_ROWS = 22;
const GRID_TOTAL_WIDTH = 9600; // dxa
const CELL_WIDTH = Math.floor(GRID_TOTAL_WIDTH / GRID_COLS);
const CELL_HEIGHT = 360; // twips（約6.3mm）

const THIN_BORDER = { style: BorderStyle.SINGLE, size: 2, color: "C8CCD2" };

function blankGrid(): Table {
  const cell = () =>
    new TableCell({
      width: { size: CELL_WIDTH, type: WidthType.DXA },
      borders: { top: THIN_BORDER, bottom: THIN_BORDER, left: THIN_BORDER, right: THIN_BORDER },
      children: [new Paragraph({ children: [] })],
    });
  const row = () =>
    new TableRow({
      height: { value: CELL_HEIGHT, rule: HeightRule.ATLEAST },
      children: Array.from({ length: GRID_COLS }, cell),
    });
  return new Table({
    width: { size: GRID_TOTAL_WIDTH, type: WidthType.DXA },
    columnWidths: Array.from({ length: GRID_COLS }, () => CELL_WIDTH),
    rows: Array.from({ length: GRID_ROWS }, row),
  });
}

function floorsLabel(data: RenderData): string {
  const n = parseInt(data.numFloors ?? "", 10);
  if (Number.isFinite(n) && n >= 1 && n <= 30) {
    return `1階〜${n}階（各階ぶん作成してください）`;
  }
  return "各階（1枚ずつ作成してください）";
}

/**
 * 生成docの末尾に同梱する付録。Word上で提出準備が完結することを狙う。
 * 1) 作成後の提出のしかた（届出書・窓口・部数の案内）
 * 2) 各階平面図・避難経路図の記入用テンプレート（手順＋記号凡例＋方眼）
 * 平面図画像のアップロード機能を持たず、手描き or 画像貼り付けで対応できる。
 */
export function buildFloorPlanGuide(data: RenderData): (Paragraph | Table)[] {
  return [
    pageBreak(),
    sectionHeading("作成後の提出のしかた"),
    plainText("本計画書は、作成後に所轄の消防署へ届け出ることで効力を持ちます。下記の手順でご提出ください。"),
    plainText(""),
    plainText("1. 本計画書の内容を確認し、空欄や追記が必要な事項（前ページの概要・チェックリスト参照）を記入します。"),
    plainText("2. 本計画書を印刷します（Wordから印刷、またはPDF化して印刷）。"),
    plainText("3. 「消防計画作成（変更）届出書」を用意します（所轄消防署の窓口、または各消防本部のウェブサイトで入手できます）。"),
    plainText("4. 届出書と本計画書を正副2部ずつ用意し、所轄消防署の予防課窓口へ提出します。"),
    plainText("5. 受付印が押された副本は、事業所で保管してください。"),
    plainText(""),
    plainText("※ 提出方法・必要部数・窓口の受付時間は所轄消防署により異なる場合があります。事前にご確認ください。"),
    plainText("※ 届出書の作成にお困りの場合は、消防関係の届出書類を作成できる「トドケデ消防書類作成」（docs.todokede.jp）もご利用いただけます。"),
    spacerParagraph(),
    pageBreak(),
    sectionHeading("各階平面図・避難経路図（記入用テンプレート）"),
    plainText("提出には各階の平面図・避難経路図が必要です。下の方眼を使って、各階の間取りと避難経路を記入してください。"),
    plainText(""),
    plainText("【手順】"),
    plainText("1. 下の方眼に、各階の間取り（部屋・廊下・出入口）を描きます。"),
    plainText("2. 記号凡例にしたがって、消火器・避難口・避難方向などを記入します。"),
    plainText("3. 完成したらスマートフォン等で撮影し、Wordの「挿入 ＞ 画像」でこのページに貼り付けます。"),
    plainText("　 （お手元に平面図の画像・PDFがある場合は、それをそのまま貼り付けても構いません。）"),
    plainText("4. 階数ぶん、Wordでこのページをコピーしてご利用ください。"),
    plainText(""),
    plainText("【記号凡例】　消火器=「消」／屋内消火栓=「栓」／自動火災報知設備（感知器）=「●」／誘導灯=「誘」／避難口=「□」／避難方向=「→」／防火戸・防火扉=「▥」"),
    plainText(`対象の階: ${floorsLabel(data)}`),
    spacerParagraph(),
    blankGrid(),
  ];
}
