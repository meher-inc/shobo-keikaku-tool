import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

/**
 * 12 公式テンプレを「全変数同名で埋めた」状態でレンダリングし、
 * 出力 docx に「空欄」が残っていないことを保証する回帰テスト。
 *
 * 「空欄」の定義:
 *   - vMerge=continue でない完全空セル (他セルに意味あるテキストがある行のみ)
 *   - 未差し込み {{var}}
 *   - 空電話括弧「（電話[\\s 　]{2,}）」
 *   - 空番号「第[\\s 　]{3,}号」
 *   - 空日付「年[\\s 　]{3,}月[\\s 　]{3,}日」
 */

const TEMPLATES_DIR = path.join(
  process.cwd(),
  "lib/engine-v2/national/templates-official"
);

const EXPECTED_PACKS = [
  "building-use-start",
  "hazmat-facility-permit",
  "hazmat-facility-change-permit",
  "hazmat-temporary-use",
  "hazmat-transfer",
  "hazmat-name-quantity-change",
  "hazmat-facility-abolition",
  "hazmat-comprehensive-safety-supervisor",
  "hazmat-safety-supervisor",
  "hazmat-prevention-rules-approval",
  "minor-hazmat-notification",
  "hazmat-temporary-storage",
];

const rowRe = /<w:tr\b[^>]*>[\s\S]*?<\/w:tr>/g;
const cellRe = /<w:tc\b[^>]*>[\s\S]*?<\/w:tc>/g;

function findAll(re: RegExp, src: string) {
  const out: Array<{ start: number; end: number; full: string }> = [];
  let m: RegExpExecArray | null;
  re.lastIndex = 0;
  while ((m = re.exec(src)) !== null) {
    out.push({ start: m.index, end: m.index + m[0].length, full: m[0] });
  }
  return out;
}

function getCellText(cellXml: string): string {
  const texts: string[] = [];
  const r = /<w:t\b[^>]*>([^<]*)<\/w:t>/g;
  let m: RegExpExecArray | null;
  while ((m = r.exec(cellXml)) !== null) if (m[1]) texts.push(m[1]);
  return texts.join("");
}

function isVMergeContinue(cellXml: string): boolean {
  return (
    /<w:vMerge(?:\s+w:val="continue")?\s*\/>/.test(cellXml) &&
    !/<w:vMerge\s+w:val="restart"/.test(cellXml)
  );
}

function trimAll(s: string): string {
  return s.replace(/[\s 　]/g, "");
}

type Blank = { type: string; row: number; cell: number; text?: string };

function detectBlanks(xml: string): Blank[] {
  const blanks: Blank[] = [];
  const rows = findAll(rowRe, xml);
  rows.forEach((row, ri) => {
    const cells = findAll(cellRe, row.full);
    cells.forEach((cell, ci) => {
      if (isVMergeContinue(cell.full)) return;
      const ct = getCellText(cell.full);
      if (trimAll(ct) === "") {
        const rowHasLabel = cells.some(
          (c, i) =>
            i !== ci &&
            !isVMergeContinue(c.full) &&
            trimAll(getCellText(c.full)).length > 0
        );
        if (rowHasLabel) {
          blanks.push({ type: "empty-cell", row: ri + 1, cell: ci + 1 });
        }
        return;
      }
      if (/\{\{[A-Za-z_][A-Za-z0-9_]*\}\}/.test(ct)) {
        blanks.push({ type: "unfilled-var", row: ri + 1, cell: ci + 1, text: ct });
      }
      if (/[（(]電話[\s 　]{2,}[)）]/.test(ct)) {
        blanks.push({ type: "empty-phone-paren", row: ri + 1, cell: ci + 1, text: ct });
      }
      if (/第[\s 　]{3,}号/.test(ct)) {
        blanks.push({ type: "empty-number", row: ri + 1, cell: ci + 1, text: ct });
      }
      if (/年[\s 　]{3,}月[\s 　]{3,}日/.test(ct)) {
        blanks.push({ type: "empty-date", row: ri + 1, cell: ci + 1, text: ct });
      }
    });
  });
  return blanks;
}

/** 全 var に同じテスト値を入れるための proxy */
function fullSample(): Record<string, string> {
  return new Proxy({} as Record<string, string>, {
    get: (_, key) => {
      if (key === "then") return undefined;
      return `[${String(key)}]`;
    },
    has: () => true,
    ownKeys: () => [],
    getOwnPropertyDescriptor: () => undefined,
  });
}

describe("zero blanks in rendered official templates", () => {
  for (const pack of EXPECTED_PACKS) {
    it(`${pack} renders with zero blanks`, () => {
      const tplPath = path.join(TEMPLATES_DIR, `${pack}.docx`);
      const buf = fs.readFileSync(tplPath);
      const zip = new PizZip(buf);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: { start: "{{", end: "}}" },
        nullGetter: () => "[NULL]",
      });
      doc.render(fullSample());
      const xml = doc.getZip().file("word/document.xml")!.asText();
      const blanks = detectBlanks(xml);
      expect(blanks, `${pack} has ${blanks.length} blanks: ${JSON.stringify(blanks, null, 2)}`).toEqual([]);
    });
  }
});
