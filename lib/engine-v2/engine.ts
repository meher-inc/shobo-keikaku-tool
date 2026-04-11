import { TemplatePackSchema, type TemplatePack } from "./types/template-pack";

/**
 * Validate and return a TemplatePack from raw JSON (e.g. loaded from
 * a .json file or a remote source). Throws a ZodError on failure.
 *
 * This is the only public entry point for Step 1. Docx rendering is
 * added in Step 2+.
 */
export function loadPack(json: unknown): TemplatePack {
  return TemplatePackSchema.parse(json);
}
