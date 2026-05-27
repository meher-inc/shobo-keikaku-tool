"use client";

import { useMemo, useState } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type {
  OfficialFieldMeta,
  OfficialPackMeta,
  OfficialSectionMeta,
} from "@/lib/engine-v2/national/templates-official-metadata";

interface Props {
  meta: OfficialPackMeta;
  packTitle: string;
}

// ============================================================================
// Zod schema 動的生成
// ============================================================================
function buildSchema(meta: OfficialPackMeta) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const section of meta.sections) {
    for (const field of section.fields) {
      const required = field.required;
      let s: z.ZodTypeAny = z.string();
      if (field.type === "phone") {
        s = z
          .string()
          .regex(
            /^[\d\-+\s()]*$/,
            { message: "電話番号は数字とハイフンのみで入力してください" }
          );
      } else if (field.type === "number") {
        s = z
          .string()
          .regex(/^[\d,.]*$/, { message: "数値を入力してください" });
      } else if (field.type === "checkbox") {
        // チェックボックス は "true" / "false" の文字列で保持
        s = z.enum(["true", "false"]);
      }
      if (required) {
        if (field.type === "checkbox") {
          // checkbox は required でも空文字許容しない (デフォルト false)
        } else {
          s = (s as z.ZodString).min(1, { message: "必須項目です" });
        }
      } else {
        s = s.optional().or(z.literal(""));
      }
      shape[field.key] = s;
    }
  }
  return z.object(shape);
}

type FormValues = Record<string, string>;

function buildDefaults(meta: OfficialPackMeta): FormValues {
  const out: FormValues = {};
  for (const section of meta.sections) {
    for (const field of section.fields) {
      out[field.key] = field.type === "checkbox" ? "false" : "";
    }
  }
  return out;
}

// ============================================================================
// メインコンポーネント
// ============================================================================
export function NationalFormOfficial({ meta, packTitle }: Props) {
  const schema = useMemo(() => buildSchema(meta), [meta]);
  const defaults = useMemo(() => buildDefaults(meta), [meta]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    // 動的生成 schema のため zodResolver 引数型が緩い resolver を強制 cast
    resolver: zodResolver(schema) as unknown as ReturnType<typeof zodResolver>,
    defaultValues: defaults,
    mode: "onBlur",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/generate-national", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packName: meta.packName, form: values }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `生成に失敗しました (HTTP ${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${packTitle.replace(/[^\w぀-ヿ一-鿿]/g, "_")}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "生成に失敗しました");
    } finally {
      setSubmitting(false);
    }
  }

  function onInvalid(errs: FieldErrors<FormValues>) {
    const firstKey = Object.keys(errs)[0];
    if (firstKey) {
      const el = document.getElementById(`f-${firstKey}`);
      el?.focus();
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="nfo-form">
      {meta.sections.map((section) => (
        <Section key={section.id} section={section} register={register} errors={errors} />
      ))}

      {submitError && <div className="nfo-error">{submitError}</div>}

      <button type="submit" disabled={submitting} className="nfo-submit">
        {submitting ? "生成中..." : "Word ファイルをダウンロード"}
      </button>

      <style jsx>{`
        .nfo-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          width: 100%;
        }
        .nfo-error {
          padding: 12px 14px;
          background: #fdecea;
          border: 1px solid #f5b7b1;
          border-radius: 6px;
          color: #b91c1c;
          font-size: 14px;
          line-height: 1.6;
        }
        .nfo-submit {
          margin-top: 8px;
          padding: 14px 24px;
          font-size: 16px;
          font-weight: 700;
          color: #fff;
          background: #e8332a;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          min-height: 48px;
          width: 100%;
        }
        .nfo-submit:disabled {
          background: #999;
          cursor: not-allowed;
        }
        @media (min-width: 640px) {
          .nfo-submit {
            width: auto;
            align-self: flex-end;
          }
        }
      `}</style>
    </form>
  );
}

// ============================================================================
// セクション
// ============================================================================
function Section({
  section,
  register,
  errors,
}: {
  section: OfficialSectionMeta;
  register: ReturnType<typeof useForm<FormValues>>["register"];
  errors: FieldErrors<FormValues>;
}) {
  return (
    <fieldset className="nfo-fieldset">
      <legend className="nfo-legend">{section.heading}</legend>
      {section.description && (
        <p className="nfo-description">{section.description}</p>
      )}
      <div className="nfo-grid">
        {section.fields.map((field) => (
          <Field
            key={field.key}
            field={field}
            register={register}
            error={errors[field.key]?.message as string | undefined}
          />
        ))}
      </div>
      <style jsx>{`
        .nfo-fieldset {
          border: 1px solid #e0e0e0;
          border-radius: 10px;
          padding: 16px;
          margin: 0;
          background: #fff;
        }
        .nfo-legend {
          padding: 0 8px;
          font-size: 14px;
          font-weight: 700;
          color: #1a1a1a;
        }
        .nfo-description {
          font-size: 13px;
          color: #666;
          margin: 4px 0 12px;
          line-height: 1.6;
        }
        .nfo-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }
        @media (min-width: 640px) {
          .nfo-fieldset {
            padding: 20px;
          }
          .nfo-grid {
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }
        }
      `}</style>
    </fieldset>
  );
}

// ============================================================================
// フィールド
// ============================================================================
function Field({
  field,
  register,
  error,
}: {
  field: OfficialFieldMeta;
  register: ReturnType<typeof useForm<FormValues>>["register"];
  error?: string;
}) {
  const id = `f-${field.key}`;
  const reg = register(field.key);
  const isMultiline = field.type === "multiline";
  const isCheckbox = field.type === "checkbox";
  const inputType =
    field.type === "date" ? "date" :
    field.type === "phone" ? "tel" :
    field.type === "number" ? "text" :
    "text";

  return (
    <div className={`nfo-field ${isMultiline ? "nfo-field--full" : ""}`}>
      {!isCheckbox && (
        <label htmlFor={id} className="nfo-label">
          {field.label}
          {field.required ? <span className="nfo-required"> *</span> : <span className="nfo-optional">（任意）</span>}
        </label>
      )}

      {isCheckbox ? (
        <label htmlFor={id} className="nfo-checkbox-label">
          <input
            id={id}
            type="checkbox"
            className="nfo-checkbox"
            defaultChecked={false}
            onChange={(e) => reg.onChange({ target: { name: field.key, value: e.target.checked ? "true" : "false" } })}
            onBlur={reg.onBlur}
            name={reg.name}
            ref={reg.ref}
          />
          <span>
            {field.label}
            {field.required && <span className="nfo-required"> *</span>}
          </span>
        </label>
      ) : isMultiline ? (
        <textarea
          id={id}
          rows={3}
          placeholder={field.placeholder}
          className="nfo-textarea"
          {...reg}
        />
      ) : (
        <input
          id={id}
          type={inputType}
          inputMode={field.type === "phone" ? "tel" : field.type === "number" ? "decimal" : undefined}
          placeholder={field.placeholder}
          className="nfo-input"
          {...reg}
        />
      )}

      {field.helpText && <p className="nfo-help">{field.helpText}</p>}
      {error && <p className="nfo-fielderror" role="alert">{error}</p>}

      <style jsx>{`
        .nfo-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }
        .nfo-field--full {
          grid-column: 1 / -1;
        }
        .nfo-label {
          font-size: 13px;
          font-weight: 600;
          color: #222;
          line-height: 1.5;
        }
        .nfo-required {
          color: #c8261e;
        }
        .nfo-optional {
          color: #999;
          font-weight: 400;
          font-size: 11px;
        }
        .nfo-input,
        .nfo-textarea {
          font-size: 16px; /* iOS auto-zoom 防止 */
          padding: 10px 12px;
          border: 1px solid #c7c7cc;
          border-radius: 6px;
          background: #fff;
          color: #1a1a1a;
          min-height: 44px;
          width: 100%;
          box-sizing: border-box;
          font-family: inherit;
        }
        .nfo-input:focus,
        .nfo-textarea:focus {
          outline: 2px solid #e8332a;
          outline-offset: -1px;
          border-color: transparent;
        }
        .nfo-textarea {
          resize: vertical;
          line-height: 1.6;
        }
        .nfo-help {
          font-size: 12px;
          color: #666;
          margin: 0;
          line-height: 1.5;
        }
        .nfo-fielderror {
          font-size: 12px;
          color: #c8261e;
          margin: 2px 0 0;
          line-height: 1.4;
        }
        .nfo-checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #222;
          line-height: 1.5;
          padding: 8px 0;
          cursor: pointer;
          min-height: 44px;
        }
        .nfo-checkbox {
          width: 20px;
          height: 20px;
          cursor: pointer;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
