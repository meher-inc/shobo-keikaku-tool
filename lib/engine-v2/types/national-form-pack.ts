import { z } from "zod";

/**
 * 全国統一様式（消防法施行規則別記様式・火災予防条例準拠様式）の
 * 届出書テンプレートスキーマ。
 *
 * 既存 TemplatePackSchema は消防計画書（章立て・長文）専用なので、
 * 届出書（A4 1枚・ラベル+値の表形式）は別系統として定義する。
 *
 * Phase 1 で扱うのは 7 書類:
 *   - fire-manager-appointment        (別記様式第1号の2の2)
 *   - fire-plan-notification          (別記様式第1号の2)
 *   - self-defense-org-establishment  (別記様式第1号の2の2の3の3)
 *   - building-use-start              (東京消防庁 第3号様式の2)
 *   - building-construction-plan      (東京消防庁 第3号様式)
 *   - equipment-construction-start    (別記様式第1号の7)
 *   - equipment-installation          (別記様式第1号の2の3)
 */

export const FormFieldTypes = [
  "text",
  "multiline",
  "date",
  "radio",
  "checkbox-group",
  "select",
] as const;

export const FormFieldSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(FormFieldTypes),
  required: z.boolean().optional(),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  options: z.array(z.string()).optional(),
  maxLength: z.number().int().positive().optional(),
});
export type FormField = z.infer<typeof FormFieldSchema>;

export const FormSectionSchema = z.object({
  id: z.string().min(1),
  heading: z.string().optional(),
  description: z.string().optional(),
  fields: z.array(FormFieldSchema),
});
export type FormSection = z.infer<typeof FormSectionSchema>;

export const NationalFormPackSchema = z.object({
  version: z.literal("1.0"),
  packName: z.string().min(1),
  title: z.string().min(1),
  legalRef: z.string().min(1),
  summary: z.string().optional(),
  preamble: z.string().min(1),
  submitToTemplate: z.string().min(1),
  submitterTitle: z.string().min(1),
  submitterFields: z.array(FormFieldSchema),
  headerFields: z.array(FormFieldSchema).optional(),
  sections: z.array(FormSectionSchema),
  footnotes: z.array(z.string()),
  /**
   * 複雑度の高い書類（Phase 3：危険物関係許可申請等）に true を設定すると、
   * フォーム上に「行政書士に相談する」ボタンと説明文を表示する。
   * 専門的な判断が必要な書類向けの導線フラグ。
   */
  consultProfessional: z.boolean().optional(),
});
export type NationalFormPack = z.infer<typeof NationalFormPackSchema>;

export type NationalFormData = Record<string, string | string[] | undefined>;
