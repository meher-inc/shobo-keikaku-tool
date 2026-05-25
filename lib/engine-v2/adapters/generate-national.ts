import { renderNationalDocx } from "../national/render-docx";
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
  return renderNationalDocx(pack, form);
}

export { NATIONAL_PACK_NAMES };
