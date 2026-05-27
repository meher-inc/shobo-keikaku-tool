import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import PizZip from "pizzip";
import {
  getOfficialPackMeta,
  OFFICIAL_PACK_NAMES,
} from "../templates-official-metadata";

/**
 * メタデータ (UI フォーム定義) と docx テンプレートの {{var}} の整合性検証。
 *
 * 要件:
 *   1. メタデータの全 field.key は docx テンプレート内の {{var}} と一致
 *   2. docx テンプレート内の全 {{var}} はメタデータで定義済み (未定義の変数が無い)
 */

const TEMPLATES_DIR = path.join(
  process.cwd(),
  "lib/engine-v2/national/templates-official"
);

function extractDocxVars(packName: string): Set<string> {
  const fp = path.join(TEMPLATES_DIR, `${packName}.docx`);
  const xml = new PizZip(fs.readFileSync(fp)).file("word/document.xml")!.asText();
  // <w:t> ノード分割を考慮して全テキスト連結後に regex 検出 (docxtemplater の挙動準拠)
  const textRe = /<w:t\b[^>]*>([^<]*)<\/w:t>/g;
  const texts: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = textRe.exec(xml)) !== null) texts.push(m[1]);
  const joined = texts.join("");
  const matches = joined.match(/\{\{([A-Za-z_][A-Za-z0-9_]*)\}\}/g) || [];
  return new Set(matches.map((s) => s.slice(2, -2)));
}

function extractMetaKeys(packName: string): Set<string> {
  const meta = getOfficialPackMeta(packName);
  if (!meta) throw new Error(`No meta for ${packName}`);
  const keys = new Set<string>();
  for (const section of meta.sections) {
    for (const field of section.fields) {
      keys.add(field.key);
    }
  }
  return keys;
}

describe("templates-official metadata coverage", () => {
  for (const pack of OFFICIAL_PACK_NAMES) {
    it(`${pack}: metadata keys ⊆ docx variables`, () => {
      const docxVars = extractDocxVars(pack);
      const metaKeys = extractMetaKeys(pack);
      const missingInDocx = [...metaKeys].filter((k) => !docxVars.has(k));
      expect(
        missingInDocx,
        `meta defines ${missingInDocx.length} keys not present in docx: ${missingInDocx.join(", ")}`
      ).toEqual([]);
    });

    it(`${pack}: docx variables ⊆ metadata keys`, () => {
      const docxVars = extractDocxVars(pack);
      const metaKeys = extractMetaKeys(pack);
      const missingInMeta = [...docxVars].filter((k) => !metaKeys.has(k));
      expect(
        missingInMeta,
        `docx has ${missingInMeta.length} vars not in metadata: ${missingInMeta.join(", ")}`
      ).toEqual([]);
    });
  }
});
