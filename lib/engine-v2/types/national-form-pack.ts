import { z } from "zod";

/**
 * 全国統一様式（消防法施行規則別記様式・火災予防条例準拠様式）の
 * 届出書テンプレートスキーマ。
 *
 * セクションは2系統:
 *   - "key-value" (default)  ラベル列+値列の縦並び2列テーブル (大多数のセクション)
 *   - "row-table"            行ベース複数列テーブル (区分マトリクス等)
 *
 * セクション type は optional。未指定なら "key-value" として扱う (後方互換)。
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

// ── key-value section (既存) ────────────────────────────────────────────
export const KeyValueSectionSchema = z.object({
  id: z.string().min(1),
  type: z.literal("key-value").optional(),
  heading: z.string().optional(),
  description: z.string().optional(),
  fields: z.array(FormFieldSchema),
});
export type KeyValueSection = z.infer<typeof KeyValueSectionSchema>;

// ── row-table section (新規) ────────────────────────────────────────────
// 構造:
//                | columns[0].label | columns[1].label | ...
//   rows[0].label| <input>          | <input>          | ...
//   rows[1].label| <input>          | <input>          | ...
//
// データキーは `${row.key}${column.key}` で組み立てる (連結後の文字列がフラットな
// NationalFormData のキーになる)。後方互換のため key-value 形式のフィールド名と
// 衝突させないこと。
export const RowTableColumnSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  placeholder: z.string().optional(),
});
export type RowTableColumn = z.infer<typeof RowTableColumnSchema>;

export const RowTableRowSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
});
export type RowTableRow = z.infer<typeof RowTableRowSchema>;

export const RowTableSectionSchema = z.object({
  id: z.string().min(1),
  type: z.literal("row-table"),
  heading: z.string().optional(),
  description: z.string().optional(),
  rowHeaderLabel: z.string().optional(),
  columns: z.array(RowTableColumnSchema).min(1),
  rows: z.array(RowTableRowSchema).min(1),
});
export type RowTableSection = z.infer<typeof RowTableSectionSchema>;

// section は2系統の union
export const FormSectionSchema = z.union([
  KeyValueSectionSchema,
  RowTableSectionSchema,
]);
export type FormSection = z.infer<typeof FormSectionSchema>;

/** 型ガード: row-table セクションか? */
export function isRowTableSection(section: FormSection): section is RowTableSection {
  return (section as { type?: string }).type === "row-table";
}

export const DateFormatSchema = z.enum(["wareki", "seireki"]);
export type DateFormat = z.infer<typeof DateFormatSchema>;

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
  /**
   * docx 出力時の date 型フィールドのフォーマット。
   * 未指定なら wareki (和暦)。
   */
  dateFormat: DateFormatSchema.optional(),
});
export type NationalFormPack = z.infer<typeof NationalFormPackSchema>;

export type NationalFormData = Record<string, string | string[] | undefined>;
