import { Packer } from "docx";
import { TemplatePackSchema, type TemplatePack } from "./types/template-pack";
import { buildDocument } from "./builders/document";
import type { RenderData } from "./helpers/placeholder";

/**
 * Validate and return a TemplatePack from raw JSON (e.g. loaded from
 * a .json file or a remote source). Throws a ZodError on failure.
 */
export function loadPack(json: unknown): TemplatePack {
  return TemplatePackSchema.parse(json);
}

/**
 * Render a TemplatePack to a docx Buffer, substituting placeholders
 * from the given data map. This is the Step 2 entry point used by
 * callers that want the final binary.
 */
export async function renderPack(pack: TemplatePack, data: RenderData): Promise<Buffer> {
  const doc = buildDocument(pack, data);
  return Packer.toBuffer(doc);
}
