import { loadPack, renderPack } from "../engine";
import type { RenderData } from "../helpers/placeholder";
import kyotoCitySample from "../packs/kyoto-city.sample.json";
import { buildKyotoFull } from "./kyoto-full";
import { buildTokyoFull } from "./tokyo-full";

/**
 * v2 experimental adapter for /api/generate-plan.
 *
 * Takes the raw POST body from the existing v1 route (still
 * snake_case since the form shape hasn't been migrated yet) and
 * returns a docx Buffer built from one of:
 *
 *   - "sample" (default)     — kyoto-city.sample.json, chapter 1
 *                              only. Step 3 behaviour.
 *   - "full"                 — Kyoto full (10 chapters + 別表 1-9).
 *   - "tokyo-full"           — Tokyo TFD full (11 chapters +
 *                              帰宅困難者対策 + 別表 1-11). Step 5.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyForm = any;

export type V2Pack = "sample" | "full" | "tokyo-full";

export async function runV2Adapter(
  form: AnyForm,
  opts: { pack?: V2Pack } = {}
): Promise<Buffer> {
  const packName: V2Pack = opts.pack ?? "sample";

  if (packName === "full") {
    return buildKyotoFull(form);
  }

  if (packName === "tokyo-full") {
    return buildTokyoFull(form);
  }

  // sample path — unchanged from Step 3.
  const loaded = loadPack(kyotoCitySample);
  const data: RenderData = {
    buildingName: form?.building_name || undefined,
  };
  return renderPack(loaded, data);
}
