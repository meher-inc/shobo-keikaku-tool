"use client";

import { useMemo, useState, type FormEvent } from "react";
import type {
  FormField,
  NationalFormData,
  NationalFormPack,
} from "@/lib/engine-v2/types/national-form-pack";

interface Props {
  pack: NationalFormPack;
}

function initialFormState(pack: NationalFormPack): NationalFormData {
  const out: NationalFormData = {};
  const all: FormField[] = [
    ...(pack.headerFields ?? []),
    ...pack.submitterFields,
    ...pack.sections.flatMap((s) => s.fields),
  ];
  for (const f of all) {
    out[f.key] = f.type === "checkbox-group" ? [] : "";
  }
  return out;
}

function isMissing(field: FormField, value: string | string[] | undefined): boolean {
  if (!field.required) return false;
  if (value === undefined) return true;
  if (Array.isArray(value)) return value.length === 0;
  return value.trim() === "";
}

export function NationalForm({ pack }: Props) {
  const [data, setData] = useState<NationalFormData>(() => initialFormState(pack));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allFields = useMemo<FormField[]>(
    () => [
      ...(pack.headerFields ?? []),
      ...pack.submitterFields,
      ...pack.sections.flatMap((s) => s.fields),
    ],
    [pack]
  );

  function update(key: string, value: string | string[]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function toggleCheckbox(key: string, option: string) {
    setData((prev) => {
      const current = Array.isArray(prev[key]) ? (prev[key] as string[]) : [];
      const next = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      return { ...prev, [key]: next };
    });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const missing = allFields.filter((f) => isMissing(f, data[f.key]));
    if (missing.length > 0) {
      setError(`必須項目が未入力です: ${missing.map((m) => m.label).join(" / ")}`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/generate-national", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packName: pack.packName, form: data }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `生成に失敗しました (HTTP ${res.status})`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${pack.packName}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成に失敗しました");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      {error && <div style={styles.error}>{error}</div>}

      {pack.headerFields && pack.headerFields.length > 0 && (
        <FieldGroup title="基本情報">
          {pack.headerFields.map((f) => (
            <Field key={f.key} field={f} value={data[f.key]} onChange={update} onToggle={toggleCheckbox} />
          ))}
        </FieldGroup>
      )}

      <FieldGroup title={pack.submitterTitle}>
        {pack.submitterFields.map((f) => (
          <Field key={f.key} field={f} value={data[f.key]} onChange={update} onToggle={toggleCheckbox} />
        ))}
      </FieldGroup>

      {pack.sections.map((section) => (
        <FieldGroup
          key={section.id}
          title={section.heading ?? section.id}
          description={section.description}
        >
          {section.fields.map((f) => (
            <Field key={f.key} field={f} value={data[f.key]} onChange={update} onToggle={toggleCheckbox} />
          ))}
        </FieldGroup>
      ))}

      <button type="submit" disabled={submitting} style={styles.submit}>
        {submitting ? "生成中..." : "Wordファイルをダウンロード"}
      </button>
    </form>
  );
}

function FieldGroup({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset style={styles.fieldset}>
      <legend style={styles.legend}>{title}</legend>
      {description && <p style={styles.description}>{description}</p>}
      <div style={styles.grid}>{children}</div>
    </fieldset>
  );
}

function Field({
  field,
  value,
  onChange,
  onToggle,
}: {
  field: FormField;
  value: string | string[] | undefined;
  onChange: (key: string, value: string | string[]) => void;
  onToggle: (key: string, option: string) => void;
}) {
  const id = `f-${field.key}`;

  return (
    <div style={styles.field}>
      <label htmlFor={id} style={styles.label}>
        {field.label}
        {field.required && <span style={styles.required}> *</span>}
      </label>

      {field.type === "multiline" && (
        <textarea
          id={id}
          rows={4}
          required={field.required}
          placeholder={field.placeholder}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(field.key, e.target.value)}
          style={styles.textarea}
        />
      )}

      {field.type === "date" && (
        <input
          id={id}
          type="date"
          required={field.required}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(field.key, e.target.value)}
          style={styles.input}
        />
      )}

      {field.type === "text" && (
        <input
          id={id}
          type="text"
          required={field.required}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(field.key, e.target.value)}
          style={styles.input}
        />
      )}

      {field.type === "select" && (
        <select
          id={id}
          required={field.required}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(field.key, e.target.value)}
          style={styles.input}
        >
          <option value="">選択してください</option>
          {(field.options ?? []).map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      )}

      {field.type === "radio" && (
        <div style={styles.optionRow}>
          {(field.options ?? []).map((o) => (
            <label key={o} style={styles.optionLabel}>
              <input
                type="radio"
                name={field.key}
                value={o}
                checked={value === o}
                onChange={() => onChange(field.key, o)}
              />
              <span>{o}</span>
            </label>
          ))}
        </div>
      )}

      {field.type === "checkbox-group" && (
        <div style={styles.optionRow}>
          {(field.options ?? []).map((o) => {
            const checked = Array.isArray(value) && value.includes(o);
            return (
              <label key={o} style={styles.optionLabel}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(field.key, o)}
                />
                <span>{o}</span>
              </label>
            );
          })}
        </div>
      )}

      {field.helpText && <p style={styles.help}>{field.helpText}</p>}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: { display: "flex", flexDirection: "column", gap: 24, maxWidth: 880, margin: "0 auto" },
  fieldset: {
    border: "1px solid #e0e0e0",
    borderRadius: 8,
    padding: "16px 20px 20px",
    margin: 0,
  },
  legend: { padding: "0 8px", fontSize: 14, fontWeight: 700, color: "#1a1a1a" },
  description: { fontSize: 13, color: "#666", margin: "4px 0 12px" },
  grid: { display: "grid", gridTemplateColumns: "1fr", gap: 16 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: "#222" },
  required: { color: "#c8261e" },
  input: {
    fontSize: 14,
    padding: "8px 10px",
    border: "1px solid #c7c7cc",
    borderRadius: 4,
    background: "#fff",
    color: "#1a1a1a",
  },
  textarea: {
    fontSize: 14,
    padding: "8px 10px",
    border: "1px solid #c7c7cc",
    borderRadius: 4,
    background: "#fff",
    color: "#1a1a1a",
    resize: "vertical",
    fontFamily: "inherit",
  },
  optionRow: { display: "flex", flexWrap: "wrap", gap: "8px 14px" },
  optionLabel: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 14 },
  help: { fontSize: 12, color: "#666", margin: 0 },
  error: {
    padding: "10px 14px",
    background: "#fdecea",
    border: "1px solid #f5b7b1",
    borderRadius: 6,
    color: "#b91c1c",
    fontSize: 14,
  },
  submit: {
    marginTop: 8,
    padding: "14px 24px",
    fontSize: 16,
    fontWeight: 700,
    color: "#fff",
    background: "#E8332A",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
};
