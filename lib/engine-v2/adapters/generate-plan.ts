import { loadPack, renderPack } from "../engine";
import type { RenderData } from "../helpers/placeholder";
import kyotoCitySample from "../packs/kyoto-city.sample.json";
import { buildKyotoFull } from "./kyoto-full";

/**
 * v2 experimental adapter for /api/generate-plan.
 *
 * Takes the raw POST body from the existing v1 route (still
 * snake_case since the form shape hasn't been migrated yet) and
 * returns a docx Buffer built from either:
 *
 *   - "sample" (default)  — kyoto-city.sample.json, chapter 1 only.
 *                           This is the Step 3 behaviour; used when
 *                           the route is called with ?engine=v2 and
 *                           no pack query param.
 *   - "full"              — Kyoto full adapter: chapters 1-10,
 *                           附則, 別表等一覧, 別表 1-9. Uses a
 *                           mix of JSON pack + TS table builders +
 *                           dept logic. Called when the route is
 *                           invoked with ?engine=v2&pack=full.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyForm = any;

export type V2Pack = "sample" | "full";

export async function runV2Adapter(
  form: AnyForm,
  opts: { pack?: V2Pack } = {}
): Promise<Buffer> {
  const packName: V2Pack = opts.pack ?? "sample";

  if (packName === "full") {
    return buildKyotoFull(form);
  }

  // sample path — unchanged from Step 3.
  const loaded = loadPack(kyotoCitySample);
  const data: RenderData = {
    buildingName: form?.building_name || undefined,
  };
  return renderPack(loaded, data);
}
