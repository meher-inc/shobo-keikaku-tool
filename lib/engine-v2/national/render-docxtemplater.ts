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
import { getOfficialPackMeta } from "./templates-official-metadata";

const TEMPLATES_DIR = path.join(
  process.cwd(),
  "lib/engine-v2/national/templates-official"
);

/** チェックボックス変数 (true → ☑、false → □) */
export const CHECKED_MARK = "☑";  // ☑
export const UNCHECKED_MARK = "□"; // □

/** truthy/falsy 判定 (string "true"/"false", boolean, "on"/"off" 等を許容) */
function toBoolean(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    const s = v.toLowerCase().trim();
    return s === "true" || s === "1" || s === "on" || s === "yes" || s === CHECKED_MARK;
  }
  return Boolean(v);
}

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

  // metadata から checkbox 型 field を抽出
  const meta = getOfficialPackMeta(packName);
  const checkboxKeys = new Set<string>();
  if (meta) {
    for (const section of meta.sections) {
      for (const field of section.fields) {
        if (field.type === "checkbox") checkboxKeys.add(field.key);
      }
    }
  }

  // undefined → 空文字、配列 → 連結 (改行区切りで複数行値)、checkbox → ☑/□
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    if (checkboxKeys.has(key)) {
      normalized[key] = toBoolean(value) ? CHECKED_MARK : UNCHECKED_MARK;
    } else if (value === undefined) {
      normalized[key] = "";
    } else if (Array.isArray(value)) {
      normalized[key] = value.join("\n");
    } else {
      normalized[key] = String(value);
    }
  }
  doc.render(normalized);

  const out = doc.getZip().generate({ type: "nodebuffer" });
  return out as Buffer;
}
