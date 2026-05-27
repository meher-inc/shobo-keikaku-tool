/**
 * docxtemplater ベースの公式 Word テンプレート差し込みレンダラ。
 *
 * 設計:
 *   - lib/engine-v2/national/templates-official/<packName>.docx が存在する pack に対し、
 *     docxtemplater で {{name}} プレースホルダを差し込んで docx Buffer を返す
 *   - テンプレが存在しない pack は本モジュールではなく、既存の独自レンダラ
 *     (render-docx.ts) に委譲する (フォールバック)
 *
 * デリミタ: {{ ... }} (Q5=D2 採択)
 *
 * 並行運用:
 *   - 既存 render-docx.ts と並存
 *   - adapter (generate-national.ts) で「テンプレ docx が存在すれば docxtemplater、
 *     存在しなければ既存」と自動分岐 (Q-E=2 採択)
 */

import fs from "node:fs";
import path from "node:path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import type { NationalFormData } from "../types/national-form-pack";

const TEMPLATES_DIR = path.join(
  process.cwd(),
  "lib/engine-v2/national/templates-official"
);

/** 公式 docx テンプレートが存在するかチェック (自動経路選択用)。 */
export function hasOfficialTemplate(packName: string): boolean {
  const p = path.join(TEMPLATES_DIR, `${packName}.docx`);
  return fs.existsSync(p);
}

/** テンプレ docx のフルパス取得。 */
export function getOfficialTemplatePath(packName: string): string {
  return path.join(TEMPLATES_DIR, `${packName}.docx`);
}

/**
 * 公式テンプレ docx に {{name}} を差し込んで docx Buffer を返す。
 *
 * @param packName - registered pack name
 * @param data - flat key-value form data ({{name}} で参照されるキー)
 * @throws テンプレが存在しない / docxtemplater の差し込みでエラーが出た場合
 */
export async function renderWithOfficialTemplate(
  packName: string,
  data: NationalFormData
): Promise<Buffer> {
  const templatePath = getOfficialTemplatePath(packName);
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Official template not found: ${templatePath}`);
  }

  const content = fs.readFileSync(templatePath);
  const zip = new PizZip(content);

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: "{{", end: "}}" },
  });

  // undefined → 空文字、配列 → 連結 (チェックボックス Mark 系を意識)
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) {
      normalized[key] = "";
    } else if (Array.isArray(value)) {
      normalized[key] = value.join("、");
    } else {
      normalized[key] = String(value);
    }
  }
  doc.render(normalized);

  const out = doc.getZip().generate({ type: "nodebuffer" });
  return out as Buffer;
}
