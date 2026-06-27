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
 * 各階平面図・避難経路図の「記入用テンプレート」。生成docの末尾に同梱する。
 * 手順ガイド＋記号凡例＋方眼（手描き or 画像貼り付け用）で構成。
 * 平面図画像のアップロード機能を持たず、Word上で完結できるようにする狙い。
 */
export function buildFloorPlanGuide(data: RenderData): (Paragraph | Table)[] {
  return [
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
