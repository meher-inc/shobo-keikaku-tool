import { loadPack, renderPack } from "../engine";
import type { RenderData } from "../helpers/placeholder";
import kyotoCitySample from "../packs/kyoto-city.sample.json";

/**
 * v2 experimental adapter for /api/generate-plan.
 *
 * Takes the raw POST body from the existing v1 route (still
 * snake_case since the form shape hasn't been migrated yet) and
 * returns a docx Buffer built from the kyoto-city sample pack.
 *
 * This is deliberately minimal: only the buildingName placeholder
 * is populated. Step 3 is about wiring, not feature parity.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function runV2Adapter(form: any): Promise<Buffer> {
  const pack = loadPack(kyotoCitySample);
  const data: RenderData = {
    buildingName: form?.building_name || undefined,
  };
  return renderPack(pack, data);
}
