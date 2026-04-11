import { loadPack, renderPack } from "../engine";
import type { RenderData } from "../helpers/placeholder";
import { toRenderData } from "./to-render-data";
import kyotoCitySample from "../packs/kyoto-city.sample.json";
import kyotoCityFull from "../templates/kyoto-city.full.json";

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
 *   - "full"              — kyoto-city.templates full.json, chapters
 *                           1-3 + 附則. Used when ?engine=v2&pack=full.
 *
 * TODO(step4b): restore as table node when table builder lands —
 * kyoto-city.full.json's ch3-reports section is a text-paragraph
 * degradation of the v1 第3章 table (種別/届出時期/届出者). The
 * text representation ships the same content line by line but
 * loses the table layout. Once engine-v2 grows a table BodyNode
 * and a matching builder, ch3-reports should be migrated back to
 * a table node to recover v1 fidelity.
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
    const loaded = loadPack(kyotoCityFull);
    const data = toRenderData((form ?? {}) as Record<string, unknown>);

    // The 附則 section uses the eraDate computed fn, which reads
    // creationDateIso. Default to "now" if the caller didn't
    // supply one — v1's route.ts does the same thing.
    if (!data.creationDateIso) {
      data.creationDateIso = new Date().toISOString();
    }

    return renderPack(loaded, data);
  }

  // sample path — unchanged from Step 3.
  const loaded = loadPack(kyotoCitySample);
  const data: RenderData = {
    buildingName: form?.building_name || undefined,
  };
  return renderPack(loaded, data);
}
