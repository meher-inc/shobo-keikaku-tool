import { renderNationalDocx } from "../national/render-docx";
import {
  hasOfficialTemplate,
  renderWithOfficialTemplate,
} from "../national/render-docxtemplater";
import { getNationalPack, NATIONAL_PACK_NAMES } from "../national/registry";
import type { NationalFormData } from "../types/national-form-pack";

export class UnknownNationalPackError extends Error {
  constructor(packName: string) {
    super(
      `Unknown national pack: ${packName}. Allowed: ${NATIONAL_PACK_NAMES.join(", ")}`
    );
    this.name = "UnknownNationalPackError";
  }
}

/**
 * Generate a docx Buffer for a national-standard 届出書 from form data.
 *
 * 経路自動分岐:
 *   - lib/engine-v2/national/templates-official/<packName>.docx が存在する場合は
 *     docxtemplater で公式テンプレに差し込む (renderWithOfficialTemplate)
 *   - 存在しない pack は既存の独自 JSON テンプレ経路 (renderNationalDocx) を使用
 *
 * @param packName - one of NATIONAL_PACK_NAMES.
 * @param form     - flat map of field key → string | string[] | undefined.
 */
export async function generateNationalDocument(
  packName: string,
  form: NationalFormData
): Promise<Buffer> {
  const pack = getNationalPack(packName);
  if (!pack) {
    throw new UnknownNationalPackError(packName);
  }
  if (hasOfficialTemplate(packName)) {
    return renderWithOfficialTemplate(packName, form);
  }
  return renderNationalDocx(pack, form);
}

export { NATIONAL_PACK_NAMES };
