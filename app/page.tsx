"use client";
import { useState } from "react";

const USE_CATEGORIES = [
  { value: "1-イ", label: "1項イ 劇場等", specific: true },
  { value: "2-イ", label: "2項イ キャバレー等", specific: true },
  { value: "3-イ", label: "3項イ 料理店等", specific: true },
  { value: "3-ロ", label: "3項ロ 飲食店", specific: true },
  { value: "4", label: "4項 百貨店・物販店", specific: true },
  { value: "5-イ", label: "5項イ 旅館・ホテル", specific: true },
  { value: "5-ロ", label: "5項ロ 共同住宅等", specific: false },
  { value: "6-イ", label: "6項イ 病院等", specific: true },
  { value: "6-ロ", label: "6項ロ 福祉施設等", specific: true },
  { value: "7", label: "7項 学校", specific: false },
  { value: "8", label: "8項 図書館等", specific: false },
  { value: "10", label: "10項 車両停車場等", specific: false },
  { value: "12-イ", label: "12項イ 工場等", specific: false },
  { value: "14", label: "14項 倉庫", specific: false },
  { value: "15", label: "15項 事務所等", specific: false },
  { value: "16-イ", label: "16項イ 特定複合用途", specific: true },
  { value: "16-ロ", label: "16項ロ 非特定複合用途", specific: false },
];

const EQUIPMENT = [
  "消火器", "屋内消火栓", "スプリンクラー設備", "自動火災報知設備",
  "漏電火災警報器", "非常警報設備", "避難器具", "誘導灯",
  "連結送水管", "排煙設備"
];

const STEPS = [
  { id: "location", title: "所在地", icon: "📍" },
  { id: "building", title: "建物", icon: "🏢" },
  { id: "management", title: "管理者", icon: "👤" },
  { id: "equipment", title: "設備", icon: "🔧" },
  { id: "operations", title: "運用", icon: "📋" },
  { id: "confirm", title: "生成", icon: "✅" },
];

export default function Home() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    prefecture: "京都府", city: "京都市", ward: "", address_detail: "",
    building_name: "", use_category: "", total_area: "", num_floors: "", capacity: "",
    owner_name: "", manager_name: "", manager_qual: "甲種", manager_date: "", manager_tel: "",
    has_outsource: false, outsource_company: "",
    equipment: [] as string[], inspection_company: "", security_company: "",
    daily_check: "毎日終業時", periodic_months: "4月と10月",
    drill_months: "4月・10月", education_months: "4月・10月",
    emergency_name: "", emergency_tel: "",
    evacuation_site: "", assembly_point: "",
  });

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const toggleEquip = (e: string) =>
    set("equipment", form.equipment.includes(e) ? form.equipment.filter(x => x !== e) : [...form.equipment, e]);

  const selectedUse = USE_CATEGORIES.find(u => u.value === form.use_category);
  const isSpecific = selectedUse?.specific ?? false;
  const deptName = form.city === "京都市" ? "京都市消防局" :
    form.prefecture === "東京都" ? "東京消防庁" : form.city ? "標準様式" : "";

  const completeness = (() => {
    const checks = [form.building_name, form.use_category, form.total_area, form.capacity,
      form.owner_name, form.manager_name, form.manager_tel,
      form.equipment.length > 0, form.emergency_name, form.evacuation_site];
    return Math.round(checks.filter(Boolean).length / checks.length * 100);
  })();

  const missing: string[] = [];
  if (!form.building_name) missing.push("建物名称");
  if (!form.use_category) missing.push("用途");
  if (!form.total_area) missing.push("延べ面積");
  if (!form.owner_name) missing.push("管理権原者");
  if (!form.manager_name) missing.push("防火管理者");
  if (form.equipment.length === 0) missing.push("消防用設備");
  if (!form.evacuation_site) missing.push("避難場所");

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) { alert("エラーが発生しました"); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `消防計画_${form.building_name}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch { alert("通信エラーが発生しました"); }
    finally { setLoading(false); }
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;600;700;800;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Noto Sans JP', 'Hiragino Sans', sans-serif;
          background: #f5f5f7;
          color: #1d1d1f;
          min-height: 100vh;
        }
        input, select { font-family: inherit; }
      `}</style>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px 40px" }}>

        {/* Hero Header */}
        <div style={{
          textAlign: "center",
          padding: "48px 24px 40px",
          marginBottom: 32,
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔥</div>
          <h1 style={{
            fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em",
            lineHeight: 1.2, marginBottom: 8
          }}>
            消防計画を、自動作成。
          </h1>
          <p style={{ fontSize: 17, color: "#86868b", fontWeight: 400, lineHeight: 1.5 }}>
            建物情報を入力するだけ。所轄消防本部の<br />
            様式に準拠した計画書をWordで生成します。
          </p>
        </div>

        {/* Step Indicator */}
        <div style={{
          display: "flex", gap: 4, marginBottom: 24, padding: "4px",
          background: "#e8e8ed", borderRadius: 12,
        }}>
          {STEPS.map((s, i) => (
            <button key={s.id} onClick={() => setStep(i)} style={{
              flex: 1, padding: "10px 4px", border: "none", cursor: "pointer",
              borderRadius: 10, fontSize: 12, fontWeight: 600,
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              background: i === step ? "#fff" : "transparent",
              color: i === step ? "#1d1d1f" : i < step ? "#34c759" : "#86868b",
              boxShadow: i === step ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            }}>
              <div style={{ fontSize: 18, marginBottom: 2 }}>{i < step ? "✓" : s.icon}</div>
              {s.title}
            </button>
          ))}
        </div>

        {/* Card */}
        <div style={{
          background: "#fff", borderRadius: 20, padding: "32px 28px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.04)",
          minHeight: 380,
        }}>

          {step === 0 && <StepLocation form={form} set={set} deptName={deptName} />}
          {step === 1 && <StepBuilding form={form} set={set} selectedUse={selectedUse} isSpecific={isSpecific} />}
          {step === 2 && <StepManagement form={form} set={set} />}
          {step === 3 && <StepEquipment form={form} set={set} toggleEquip={toggleEquip} />}
          {step === 4 && <StepOperations form={form} set={set} />}
          {step === 5 && <StepConfirm form={form} deptName={deptName} selectedUse={selectedUse}
            completeness={completeness} missing={missing} loading={loading} onGenerate={handleGenerate} />}

        </div>

        {/* Navigation */}
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} style={{
              flex: 1, padding: 14, borderRadius: 14, border: "none", cursor: "pointer",
              background: "#e8e8ed", color: "#1d1d1f", fontSize: 15, fontWeight: 600,
              transition: "all 0.2s",
            }}>
              ← 戻る
            </button>
          )}
          {step < STEPS.length - 1 && (
            <button onClick={() => setStep(step + 1)} style={{
              flex: 2, padding: 14, borderRadius: 14, border: "none", cursor: "pointer",
              background: "#0071e3", color: "#fff", fontSize: 15, fontWeight: 600,
              transition: "all 0.2s",
            }}>
              次へ →
            </button>
          )}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 32, textAlign: "center", padding: "16px 0",
        }}>
          <p style={{ fontSize: 12, color: "#86868b" }}>
            作成が難しい場合は
            <a href="https://todokede.jp" style={{ color: "#0071e3", fontWeight: 600, textDecoration: "none" }}> トドケデ代行サービス</a>
            にご相談ください
          </p>
          <p style={{ fontSize: 11, color: "#d2d2d7", marginTop: 8 }}>© 2026 MeHer株式会社</p>
        </div>
      </div>
    </>
  );
}

/* ===== INPUT COMPONENT ===== */
function Field({ label, value, onChange, placeholder, type = "text", required = false }: any) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{
        display: "block", fontSize: 13, fontWeight: 600, color: "#1d1d1f",
        marginBottom: 6, letterSpacing: "-0.01em",
      }}>
        {label}{required && <span style={{ color: "#ff3b30" }}> *</span>}
      </label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{
          width: "100%", padding: "12px 16px", fontSize: 16,
          border: "1px solid #d2d2d7", borderRadius: 12,
          outline: "none", transition: "all 0.2s",
          background: "#fbfbfd",
        }}
        onFocus={e => { e.target.style.borderColor = "#0071e3"; e.target.style.boxShadow = "0 0 0 3px rgba(0,113,227,0.12)"; }}
        onBlur={e => { e.target.style.borderColor = "#d2d2d7"; e.target.style.boxShadow = "none"; }}
      />
    </div>
  );
}

/* ===== STEP COMPONENTS ===== */
function StepLocation({ form, set, deptName }: any) {
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4, letterSpacing: "-0.02em" }}>所在地</h2>
      <p style={{ fontSize: 15, color: "#86868b", marginBottom: 28 }}>消防本部を自動で特定します</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="都道府県" value={form.prefecture} onChange={(e: any) => set("prefecture", e.target.value)} required />
        <Field label="市区町村" value={form.city} onChange={(e: any) => set("city", e.target.value)} required />
      </div>
      <Field label="区" value={form.ward} onChange={(e: any) => set("ward", e.target.value)} />
      <Field label="以降の住所" value={form.address_detail} onChange={(e: any) => set("address_detail", e.target.value)} placeholder="○○通○○町123" />
      {deptName && (
        <div style={{
          padding: "16px 20px", borderRadius: 14, marginTop: 8,
          background: deptName === "標準様式" ? "#fff9f0" : "#f0faf0",
          border: `1px solid ${deptName === "標準様式" ? "#ffd9a0" : "#b8e6b8"}`,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: deptName === "標準様式" ? "#af6800" : "#1a7a1a" }}>
            {deptName === "標準様式" ? "⚠️ 未対応（標準様式で作成）" : "✅ 所轄消防本部を特定しました"}
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4, color: deptName === "標準様式" ? "#8a5200" : "#0d5e0d" }}>
            {deptName}
          </div>
        </div>
      )}
    </div>
  );
}

function StepBuilding({ form, set, selectedUse, isSpecific }: any) {
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4, letterSpacing: "-0.02em" }}>建物情報</h2>
      <p style={{ fontSize: 15, color: "#86868b", marginBottom: 28 }}>テンプレートを自動で選定します</p>
      <Field label="建物名称" value={form.building_name} onChange={(e: any) => set("building_name", e.target.value)} placeholder="○○ビル" required />
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1d1d1f", marginBottom: 6 }}>
          用途（令別表第一）<span style={{ color: "#ff3b30" }}> *</span>
        </label>
        <select value={form.use_category} onChange={(e: any) => set("use_category", e.target.value)}
          style={{
            width: "100%", padding: "12px 16px", fontSize: 16, appearance: "none",
            border: "1px solid #d2d2d7", borderRadius: 12, outline: "none",
            background: "#fbfbfd url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2386868b' stroke-width='2' fill='none'/%3E%3C/svg%3E\") right 16px center no-repeat",
            cursor: "pointer",
          }}>
          <option value="">選択してください</option>
          {USE_CATEGORIES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
        </select>
        {selectedUse && (
          <div style={{
            display: "inline-block", marginTop: 8, fontSize: 12, fontWeight: 600,
            padding: "4px 12px", borderRadius: 20,
            background: isSpecific ? "#fff3e0" : "#e3f2fd",
            color: isSpecific ? "#e65100" : "#1565c0",
          }}>
            {isSpecific ? "● 特定防火対象物" : "● 非特定防火対象物"}
          </div>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <Field label="延べ面積（㎡）" value={form.total_area} onChange={(e: any) => set("total_area", e.target.value)} type="number" required />
        <Field label="階数" value={form.num_floors} onChange={(e: any) => set("num_floors", e.target.value)} type="number" required />
        <Field label="収容人員" value={form.capacity} onChange={(e: any) => set("capacity", e.target.value)} type="number" required />
      </div>
    </div>
  );
}

function StepManagement({ form, set }: any) {
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4, letterSpacing: "-0.02em" }}>管理者情報</h2>
      <p style={{ fontSize: 15, color: "#86868b", marginBottom: 28 }}>防火管理者の情報を入力します</p>
      <Field label="管理権原者 氏名" value={form.owner_name} onChange={(e: any) => set("owner_name", e.target.value)} required />
      <Field label="防火管理者 氏名" value={form.manager_name} onChange={(e: any) => set("manager_name", e.target.value)} required />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>資格種別 *</label>
          <select value={form.manager_qual} onChange={(e: any) => set("manager_qual", e.target.value)}
            style={{ width: "100%", padding: "12px 16px", fontSize: 16, border: "1px solid #d2d2d7", borderRadius: 12, background: "#fbfbfd", appearance: "none", cursor: "pointer" }}>
            <option value="甲種">甲種</option><option value="乙種">乙種</option>
          </select>
        </div>
        <Field label="選任年月日" value={form.manager_date} onChange={(e: any) => set("manager_date", e.target.value)} placeholder="令和6年4月1日" />
      </div>
      <Field label="連絡先" value={form.manager_tel} onChange={(e: any) => set("manager_tel", e.target.value)} type="tel" required />
      <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, cursor: "pointer", padding: "12px 0" }}>
        <div style={{
          width: 22, height: 22, borderRadius: 6, border: form.has_outsource ? "none" : "2px solid #d2d2d7",
          background: form.has_outsource ? "#0071e3" : "#fff", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s", flexShrink: 0,
        }} onClick={() => set("has_outsource", !form.has_outsource)}>
          {form.has_outsource && <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>✓</span>}
        </div>
        <span onClick={() => set("has_outsource", !form.has_outsource)}>防火管理業務の一部を委託している</span>
      </label>
      {form.has_outsource && <Field label="委託先名称" value={form.outsource_company} onChange={(e: any) => set("outsource_company", e.target.value)} />}
    </div>
  );
}

function StepEquipment({ form, set, toggleEquip }: any) {
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4, letterSpacing: "-0.02em" }}>消防用設備等</h2>
      <p style={{ fontSize: 15, color: "#86868b", marginBottom: 28 }}>設置されている設備を選択してください</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24 }}>
        {EQUIPMENT.map(e => {
          const active = form.equipment.includes(e);
          return (
            <button key={e} onClick={() => toggleEquip(e)} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "12px 14px", borderRadius: 12, border: "none", cursor: "pointer",
              background: active ? "#e8f4fd" : "#f5f5f7",
              outline: active ? "2px solid #0071e3" : "1px solid transparent",
              fontSize: 14, fontWeight: 500, textAlign: "left",
              transition: "all 0.2s",
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                background: active ? "#0071e3" : "#fff",
                border: active ? "none" : "2px solid #d2d2d7",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {active && <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>✓</span>}
              </div>
              {e}
            </button>
          );
        })}
      </div>
      <Field label="点検委託先" value={form.inspection_company} onChange={(e: any) => set("inspection_company", e.target.value)} placeholder="○○防災設備株式会社" />
    </div>
  );
}

function StepOperations({ form, set }: any) {
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4, letterSpacing: "-0.02em" }}>運用情報</h2>
      <p style={{ fontSize: 15, color: "#86868b", marginBottom: 28 }}>緊急時の連絡先と避難場所を設定します</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="緊急連絡先 氏名" value={form.emergency_name} onChange={(e: any) => set("emergency_name", e.target.value)} required />
        <Field label="緊急連絡先 TEL" value={form.emergency_tel} onChange={(e: any) => set("emergency_tel", e.target.value)} type="tel" required />
      </div>
      <Field label="広域避難場所" value={form.evacuation_site} onChange={(e: any) => set("evacuation_site", e.target.value)} placeholder="○○区○○町 ○○公園" required />
      <Field label="一時集合場所" value={form.assembly_point} onChange={(e: any) => set("assembly_point", e.target.value)} placeholder="ビル北側駐車場" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="訓練実施月" value={form.drill_months} onChange={(e: any) => set("drill_months", e.target.value)} />
        <Field label="防災教育実施月" value={form.education_months} onChange={(e: any) => set("education_months", e.target.value)} />
      </div>
    </div>
  );
}

function StepConfirm({ form, deptName, selectedUse, completeness, missing, loading, onGenerate }: any) {
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4, letterSpacing: "-0.02em" }}>生成</h2>
      <p style={{ fontSize: 15, color: "#86868b", marginBottom: 28 }}>内容を確認して消防計画を生成します</p>

      {/* Progress ring */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ position: "relative", display: "inline-block", width: 100, height: 100 }}>
          <svg width="100" height="100" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="50" cy="50" r="42" fill="none" stroke="#f5f5f7" strokeWidth="6" />
            <circle cx="50" cy="50" r="42" fill="none"
              stroke={completeness === 100 ? "#34c759" : "#ff9500"}
              strokeWidth="6" strokeLinecap="round"
              strokeDasharray={`${completeness * 2.64} 264`}
              style={{ transition: "stroke-dasharray 0.6s ease" }}
            />
          </svg>
          <div style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            fontSize: 24, fontWeight: 700, color: completeness === 100 ? "#34c759" : "#ff9500",
          }}>
            {completeness}%
          </div>
        </div>
      </div>

      {missing.length > 0 && (
        <div style={{
          padding: "14px 18px", borderRadius: 14, marginBottom: 20,
          background: "#fffbf0", border: "1px solid #ffd9a0",
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#af6800", marginBottom: 8 }}>不足している項目</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {missing.map((m: string) => (
              <span key={m} style={{
                fontSize: 12, padding: "3px 10px", borderRadius: 20,
                background: "#fff0d4", color: "#8a5200", fontWeight: 500,
              }}>{m}</span>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div style={{
        padding: "20px", borderRadius: 14, background: "#f5f5f7",
        fontSize: 14, lineHeight: 2.2, marginBottom: 24,
      }}>
        {[
          ["所轄", deptName || "—"],
          ["建物", `${form.building_name || "—"} / ${selectedUse?.label || "—"}`],
          ["規模", `${form.total_area || "—"}㎡ / ${form.num_floors || "—"}階 / ${form.capacity || "—"}人`],
          ["管理権原者", form.owner_name || "—"],
          ["防火管理者", `${form.manager_name || "—"}（${form.manager_qual}）`],
          ["設備", form.equipment.join("、") || "—"],
        ].map(([k, v]) => (
          <div key={k as string} style={{ display: "flex" }}>
            <span style={{ color: "#86868b", width: 100, flexShrink: 0, fontWeight: 500 }}>{k}</span>
            <span style={{ fontWeight: 500 }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Generate Button */}
      <button onClick={onGenerate} disabled={completeness < 100 || loading}
        style={{
          width: "100%", padding: "16px", borderRadius: 14, border: "none",
          fontSize: 17, fontWeight: 600, cursor: completeness === 100 && !loading ? "pointer" : "not-allowed",
          background: completeness === 100 && !loading ? "#0071e3" : "#d2d2d7",
          color: "#fff", transition: "all 0.3s",
          boxShadow: completeness === 100 ? "0 4px 16px rgba(0,113,227,0.25)" : "none",
        }}>
        {loading ? "生成中..." : "Wordファイルを生成"}
      </button>
      {completeness < 100 && (
        <p style={{ fontSize: 13, color: "#86868b", textAlign: "center", marginTop: 10 }}>
          すべての必須項目を入力すると生成できます
        </p>
      )}
    </div>
  );
}
