import { z } from "zod";

/**
 * Template pack schema (v2).
 *
 * A TemplatePack is the JSON-serializable description of a single fire
 * department's 消防計画 template. It replaces the hand-written
 * lib/generate_*_full.js generators that are currently duplicated
 * per department.
 *
 * This file only defines the schema + inferred types. Docx rendering
 * lives in lib/engine-v2/builders (Step 2+).
 */

export const TextNodeSchema = z.object({
  type: z.literal("text"),
  value: z.string(),
});
export type TextNode = z.infer<typeof TextNodeSchema>;

export const PlaceholderNodeSchema = z.object({
  type: z.literal("placeholder"),
  key: z.string().min(1),
  fallback: z.string().optional(),
});
export type PlaceholderNode = z.infer<typeof PlaceholderNodeSchema>;

export const BodyNodeSchema = z.discriminatedUnion("type", [
  TextNodeSchema,
  PlaceholderNodeSchema,
]);
export type BodyNode = z.infer<typeof BodyNodeSchema>;

export const SectionSchema = z.object({
  id: z.string().min(1),
  heading: z.string(),
  body: z.array(BodyNodeSchema),
});
export type Section = z.infer<typeof SectionSchema>;

export const ChapterSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  sections: z.array(SectionSchema),
});
export type Chapter = z.infer<typeof ChapterSchema>;

// Appendices are a placeholder for Step 2+. For now accept any shape
// but require the field to exist (empty array is fine).
export const AppendixSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
}).passthrough();
export type Appendix = z.infer<typeof AppendixSchema>;

export const ScaleSchema = z.enum(["small", "medium", "large"]);
export type Scale = z.infer<typeof ScaleSchema>;

// semver-ish: major.minor.patch with optional -suffix (e.g. "2.0.0-sample").
const SEMVER_RE = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

export const TemplatePackSchema = z.object({
  version: z.string().regex(SEMVER_RE, "version must be semver-ish (e.g. 2.0.0)"),
  deptId: z.string().min(1),
  deptName: z.string().min(1),
  scale: ScaleSchema,
  chapters: z.array(ChapterSchema),
  appendices: z.array(AppendixSchema),
});
export type TemplatePack = z.infer<typeof TemplatePackSchema>;
