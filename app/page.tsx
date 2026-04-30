"use client";
import { useState } from "react";
import { SAMPLE_PAGES_COUNT } from "../lib/sample_pages_count";

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

const FAQ_ITEMS = [
  {
    q: "出力された消防計画はそのまま消防署に提出できますか?",
    a: "はい。京都市消防局・東京消防庁・大阪市消防局・横浜市消防局・福岡市消防局の最新様式に準拠しており、そのまま印刷して提出できます。ただし管轄消防署によっては事前相談や追加の記入を求められる場合があります。不安な方はプレミアムプラン(元消防士によるチェック付き)をご利用ください。",
  },
  {
    q: "対応している消防本部を教えてください。",
    a: "現在は京都市消防局・東京消防庁・大阪市消防局・横浜市消防局・福岡市消防局に正式対応しています。それ以外のエリアは標準様式(京都ベース)で出力されますので、ご利用前に管轄消防署の様式と照合することをお勧めします。名古屋は順次対応予定です。",
  },
  {
    q: "どのプランを選べばいいかわかりません。",
    a: "迷ったらスタンダード(¥9,800)がおすすめです。消防計画本体に加えて別表すべてと記入ガイドPDFが付くので、初めて作成する方でも安心です。プレミアム(¥29,800)は「絶対に一発で通したい」「元消防士に直接見てほしい」方向けです。",
  },
  {
    q: "入力した情報は保存されますか?",
    a: "いいえ、フォームに入力された情報は決済と書類生成のためだけに使用され、サーバーに保存されません。個人情報保護の観点から、安心してご利用いただけます。",
  },
  {
    q: "決済後にダウンロードし忘れました。再ダウンロードできますか?",
    a: "決済完了メールに記載されたURLから再度アクセスできます。万一リンクが無効になっている場合は、決済時のメールアドレスを添えて plan@todokede.jp までご連絡ください。",
  },
  {
    q: "防火管理者の資格がなくても消防計画を作成できますか?",
    a: "消防計画の作成自体は誰でもできますが、提出には防火管理者の選任が必要です(特定用途で収容30人以上、延床300㎡以上の場合は甲種、それ以外は乙種)。資格取得は1〜2日の講習で可能です。お近くの消防署または日本防火・防災協会のサイトで受講できます。",
  },
  {
    q: "出力形式はWordですか?PDFですか?",
    a: "Word形式(.docx)で出力されます。消防署に提出する前に建物固有の情報を追記・修正したい場合にそのまま編集できます。印刷するだけの方は、Wordで開いてPDF保存してください。",
  },
  {
    q: "領収書は発行できますか?",
    a: "Stripe決済完了時にStripeから自動で領収書が発行されます。会社名が必要な場合は、決済画面で入力いただけます。別途MeHer株式会社発行の領収書が必要な場合は plan@todokede.jp までご連絡ください。",
  },
  {
    q: "返金は可能ですか?",
    a: "出力された消防計画の内容に不備があった場合は、内容確認のうえ返金または再発行で対応いたします。「出力してみたけど使わなかった」という理由での返金はお断りしています。",
  },
  {
    q: "法人として複数物件分まとめて購入できますか?",
    a: (
      <>
        現在は1件ずつの購入となっております。管理会社様・フランチャイズ本部様などで複数物件の一括対応をご希望の場合は、
        <a
          href="https://todokede.jp"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#E8332A", textDecoration: "underline" }}
        >
          トドケデ本体の代行サービス
        </a>
        (¥50,000〜)をご検討ください。
      </>
    ),
  },
];

const PLANS = [
  {
    id: "light",
    name: "ライト",
    price: 4980,
    priceLabel: "¥4,980",
    description: "消防計画のみ",
    features: ["消防計画Word出力", "所轄消防本部の様式に準拠"],
    missing: ["別表", "記入ガイド", "内容チェック"],
  },
  {
    id: "standard",
    name: "スタンダード",
    price: 9800,
    priceLabel: "¥9,800",
    description: "計画＋別表＋ガイド",
    badge: "おすすめ",
    features: ["消防計画Word出力", "所轄消防本部の様式に準拠", "別表すべて出力", "記入ガイドPDF付き"],
    missing: ["内容チェック"],
  },
  {
    id: "premium",
    name: "プレミアム",
    price: 29800,
    priceLabel: "¥29,800",
    description: "チェック＋修正付き",
    features: ["消防計画Word出力", "所轄消防本部の様式に準拠", "別表すべて出力", "記入ガイドPDF付き", "元消防士による内容チェック", "修正1回対応"],
    missing: [],
  },
];

function Field({ label, value, onChange, placeholder, type = "text", required = false }: any) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1d1d1f", marginBottom: 6 }}>
        {label}{required && <span style={{ color: "#ff3b30" }}> *</span>}
      </label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{ width: "100%", padding: "12px 16px", fontSize: 16, border: "1px solid #d2d2d7", borderRadius: 12, outline: "none", background: "#fbfbfd" }} />
    </div>
  );
}

export default function Home() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
const [selectedPlan, setSelectedPlan] = useState("standard");
const [showSample, setShowSample] = useState(false);  // ← これを追加
const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [form, setForm] = useState({
    prefecture: "京都府", city: "京都市", ward: "", address_detail: "",
    building_name: "", use_category: "", total_area: "", num_floors: "", capacity: "",
    owner_name: "", manager_name: "", manager_qual: "甲種", manager_date: "", manager_tel: "",
    has_outsource: false, outsource_company: "",
    equipment: [] as string[], inspection_company: "",
    emergency_name: "", emergency_tel: "",
    evacuation_site: "", assembly_point: "",
    drill_months: "4月・10月", education_months: "4月・10月",
  });

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const toggleEquip = (e: string) => set("equipment", form.equipment.includes(e) ? form.equipment.filter((x: string) => x !== e) : [...form.equipment, e]);
  const selectedUse = USE_CATEGORIES.find(u => u.value === form.use_category);
  const isSpecific = selectedUse?.specific ?? false;
  const deptName =
    form.city === "京都市" ? "京都市消防局"
    : form.prefecture === "東京都" ? "東京消防庁"
    : form.city === "大阪市" ? "大阪市消防局"
    : form.city === "横浜市" ? "横浜市消防局"
    : form.city === "福岡市" ? "福岡市消防局"
    : form.city === "名古屋市" ? "名古屋市消防局"
    : form.city ? "標準様式"
    : "";

  const checks = [form.building_name, form.use_category, form.total_area, form.capacity, form.owner_name, form.manager_name, form.manager_tel, form.equipment.length > 0, form.emergency_name, form.evacuation_site];
  const completeness = Math.round(checks.filter(Boolean).length / checks.length * 100);

  const missing: string[] = [];
  if (!form.building_name) missing.push("建物名称");
  if (!form.use_category) missing.push("用途");
  if (!form.total_area) missing.push("延べ面積");
  if (!form.owner_name) missing.push("管理権原者");
  if (!form.manager_name) missing.push("防火管理者");
  if (form.equipment.length === 0) missing.push("消防用設備");
  if (!form.evacuation_site) missing.push("避難場所");

  const currentPlan = PLANS.find(p => p.id === selectedPlan)!;

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, plan: selectedPlan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("決済セッションの作成に失敗しました");
      }
    } catch {
      alert("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px 40px" }}>

      <div style={{ textAlign: "center", padding: "48px 24px 40px" }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 8 }}>消防計画を、自動作成。</h1>
        <p style={{ fontSize: 17, color: "#86868b", fontWeight: 400 }}>建物情報を入力するだけ。所轄消防本部の様式に準拠した計画書をWordで生成します。</p>
      </div>

      {/* Hero Sample CTA */}
      <div style={{ textAlign: "center", marginBottom: 32, marginTop: -16 }}>
        <button
          onClick={() => setShowSample(true)}
          style={{
            background: "#fff",
            border: "2px solid #E8332A",
            color: "#E8332A",
            padding: "14px 32px",
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(232, 51, 42, 0.12)",
          }}
        >
          📄 まずはサンプルを見る
        </button>
        <p style={{ fontSize: 12, color: "#86868b", marginTop: 10 }}>
          実際に生成される消防計画(飲食店320㎡・別表付き)をご確認いただけます
        </p>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 24, padding: 4, background: "#e8e8ed", borderRadius: 12 }}>
        {STEPS.map((s, i) => (
          <button key={s.id} onClick={() => setStep(i)} style={{
            flex: 1, padding: "10px 4px", border: "none", cursor: "pointer", borderRadius: 10, fontSize: 12, fontWeight: 600,
            background: i === step ? "#fff" : "transparent", color: i === step ? "#1d1d1f" : i < step ? "#34c759" : "#86868b",
            boxShadow: i === step ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
          }}>
            <div style={{ fontSize: 18, marginBottom: 2 }}>{i < step ? "✓" : s.icon}</div>
            {s.title}
          </button>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 20, padding: "32px 28px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", minHeight: 380 }}>

        {step === 0 && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>所在地</h2>
            <p style={{ fontSize: 15, color: "#86868b", marginBottom: 28 }}>消防本部を自動で特定します</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="都道府県" value={form.prefecture} onChange={(e: any) => set("prefecture", e.target.value)} required />
              <Field label="市区町村" value={form.city} onChange={(e: any) => set("city", e.target.value)} required />
            </div>
            <Field label="区" value={form.ward} onChange={(e: any) => set("ward", e.target.value)} />
            <Field label="以降の住所" value={form.address_detail} onChange={(e: any) => set("address_detail", e.target.value)} placeholder="○○通○○町123" />
            {deptName && (
              <div style={{ padding: "16px 20px", borderRadius: 14, marginTop: 8, background: deptName === "標準様式" ? "#fff9f0" : "#f0faf0", border: deptName === "標準様式" ? "1px solid #ffd9a0" : "1px solid #b8e6b8" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: deptName === "標準様式" ? "#af6800" : "#1a7a1a" }}>{deptName === "標準様式" ? "⚠️ 未対応（標準様式で作成）" : "✅ 所轄消防本部を特定しました"}</div>
                <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4, color: deptName === "標準様式" ? "#8a5200" : "#0d5e0d" }}>{deptName}</div>
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>建物情報</h2>
            <p style={{ fontSize: 15, color: "#86868b", marginBottom: 28 }}>テンプレートを自動で選定します</p>
            <Field label="建物名称" value={form.building_name} onChange={(e: any) => set("building_name", e.target.value)} placeholder="○○ビル" required />
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>用途（令別表第一）<span style={{ color: "#ff3b30" }}> *</span></label>
              <select value={form.use_category} onChange={(e: any) => set("use_category", e.target.value)} style={{ width: "100%", padding: "12px 16px", fontSize: 16, border: "1px solid #d2d2d7", borderRadius: 12, background: "#fbfbfd", cursor: "pointer" }}>
                <option value="">選択してください</option>
                {USE_CATEGORIES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
              {selectedUse && <div style={{ display: "inline-block", marginTop: 8, fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, background: isSpecific ? "#fff3e0" : "#e3f2fd", color: isSpecific ? "#e65100" : "#1565c0" }}>{isSpecific ? "● 特定防火対象物" : "● 非特定防火対象物"}</div>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <Field label="延べ面積（㎡）" value={form.total_area} onChange={(e: any) => set("total_area", e.target.value)} type="number" required />
              <Field label="階数" value={form.num_floors} onChange={(e: any) => set("num_floors", e.target.value)} type="number" required />
              <Field label="収容人員" value={form.capacity} onChange={(e: any) => set("capacity", e.target.value)} type="number" required />
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>管理者情報</h2>
            <p style={{ fontSize: 15, color: "#86868b", marginBottom: 28 }}>防火管理者の情報を入力します</p>
            <Field label="管理権原者 氏名" value={form.owner_name} onChange={(e: any) => set("owner_name", e.target.value)} required />
            <Field label="防火管理者 氏名" value={form.manager_name} onChange={(e: any) => set("manager_name", e.target.value)} required />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>資格種別 *</label>
                <select value={form.manager_qual} onChange={(e: any) => set("manager_qual", e.target.value)} style={{ width: "100%", padding: "12px 16px", fontSize: 16, border: "1px solid #d2d2d7", borderRadius: 12, background: "#fbfbfd", cursor: "pointer" }}>
                  <option value="甲種">甲種</option>
                  <option value="乙種">乙種</option>
                </select>
              </div>
              <Field label="選任年月日" value={form.manager_date} onChange={(e: any) => set("manager_date", e.target.value)} placeholder="令和6年4月1日" />
            </div>
            <Field label="連絡先" value={form.manager_tel} onChange={(e: any) => set("manager_tel", e.target.value)} type="tel" required />
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>消防用設備等</h2>
            <p style={{ fontSize: 15, color: "#86868b", marginBottom: 28 }}>設置されている設備を選択してください</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24 }}>
              {EQUIPMENT.map(e => {
                const active = form.equipment.includes(e);
                return (
                  <button key={e} onClick={() => toggleEquip(e)} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 12, border: "none", cursor: "pointer",
                    background: active ? "#FDECEA" : "#f5f5f7", outline: active ? "2px solid #E8332A" : "1px solid transparent",
                    fontSize: 14, fontWeight: 500, textAlign: "left" as const,
                  }}>
                    <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, background: active ? "#E8332A" : "#fff", border: active ? "none" : "2px solid #d2d2d7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {active && <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>✓</span>}
                    </div>
                    {e}
                  </button>
                );
              })}
            </div>
            <Field label="点検委託先" value={form.inspection_company} onChange={(e: any) => set("inspection_company", e.target.value)} placeholder="○○防災設備株式会社" />
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>運用情報</h2>
            <p style={{ fontSize: 15, color: "#86868b", marginBottom: 28 }}>緊急時の連絡先と避難場所</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="緊急連絡先 氏名" value={form.emergency_name} onChange={(e: any) => set("emergency_name", e.target.value)} required />
              <Field label="緊急連絡先 TEL" value={form.emergency_tel} onChange={(e: any) => set("emergency_tel", e.target.value)} type="tel" required />
            </div>
            <Field label="広域避難場所" value={form.evacuation_site} onChange={(e: any) => set("evacuation_site", e.target.value)} placeholder="○○区○○町 ○○公園" required />
            <Field label="一時集合場所" value={form.assembly_point} onChange={(e: any) => set("assembly_point", e.target.value)} placeholder="ビル北側駐車場" />
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>プランを選択</h2>
            <p style={{ fontSize: 15, color: "#86868b", marginBottom: 24 }}>内容を確認してプランを選んでください</p>

            {/* Plan selector */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {PLANS.map(plan => {
                const isSelected = selectedPlan === plan.id;
                return (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 14,
                      padding: "18px 20px",
                      borderRadius: 16,
                      border: "none",
                      cursor: "pointer",
                      background: isSelected ? "#FDECEA" : "#f5f5f7",
                      outline: isSelected ? "2.5px solid #E8332A" : "1.5px solid transparent",
                      textAlign: "left" as const,
                      transition: "all 0.15s ease",
                    }}
                  >
                    {/* Radio indicator */}
                    <div style={{
                      width: 22, height: 22, borderRadius: 11, flexShrink: 0, marginTop: 2,
                      background: isSelected ? "#E8332A" : "#fff",
                      border: isSelected ? "none" : "2px solid #d2d2d7",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {isSelected && (
                        <div style={{ width: 8, height: 8, borderRadius: 4, background: "#fff" }} />
                      )}
                    </div>

                    {/* Plan info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: "#1d1d1f" }}>{plan.name}</span>
                        {plan.badge && (
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10,
                            background: "#E8332A", color: "#fff", letterSpacing: "0.02em",
                          }}>{plan.badge}</span>
                        )}
                      </div>
                      <div style={{ fontSize: 13, color: "#86868b", marginBottom: 8 }}>{plan.description}</div>
                      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4 }}>
                        {plan.features.map(f => (
                          <span key={f} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 8, background: isSelected ? "#FADAD6" : "#e8e8ed", color: isSelected ? "#C8261E" : "#6e6e73" }}>
                            ✓ {f}
                          </span>
                        ))}
                        {plan.missing.map(m => (
                          <span key={m} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 8, background: "#f5f5f7", color: "#c7c7cc", textDecoration: "line-through" }}>
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Price */}
                    <div style={{ flexShrink: 0, textAlign: "right" as const }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: isSelected ? "#E8332A" : "#1d1d1f", letterSpacing: "-0.02em" }}>{plan.priceLabel}</div>
                      <div style={{ fontSize: 11, color: "#86868b" }}>税込</div>
                    </div>
                  </button>
                );
              })}
            </div>
{/* Sample preview button */}
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <button
                onClick={() => setShowSample(true)}
                style={{
                  background: "#fff",
                  border: "2px solid #E8332A",
                  color: "#E8332A",
                  padding: "12px 28px",
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                📄 サンプルをもう一度見る
              </button>
              <p style={{ fontSize: 12, color: "#86868b", marginTop: 8 }}>
                スタンダードプランで生成される内容のサンプルです
              </p>
            </div>
            {/* Missing items warning */}
            {missing.length > 0 && (
              <div style={{ padding: "14px 18px", borderRadius: 14, marginBottom: 20, background: "#fffbf0", border: "1px solid #ffd9a0" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#af6800", marginBottom: 8 }}>不足している項目</div>
                <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
                  {missing.map(m => <span key={m} style={{ fontSize: 12, padding: "3px 10px", borderRadius: 20, background: "#fff0d4", color: "#8a5200" }}>{m}</span>)}
                </div>
              </div>
            )}

            {/* Summary */}
            <div style={{ padding: 20, borderRadius: 14, background: "#f5f5f7", fontSize: 14, lineHeight: 2.2, marginBottom: 24 }}>
              <div><span style={{ color: "#86868b", display: "inline-block", width: 100 }}>所轄</span>{deptName || "—"}</div>
              <div><span style={{ color: "#86868b", display: "inline-block", width: 100 }}>建物</span>{form.building_name || "—"}</div>
              <div><span style={{ color: "#86868b", display: "inline-block", width: 100 }}>規模</span>{form.total_area || "—"}㎡ / {form.num_floors || "—"}階 / {form.capacity || "—"}人</div>
              <div><span style={{ color: "#86868b", display: "inline-block", width: 100 }}>管理権原者</span>{form.owner_name || "—"}</div>
              <div><span style={{ color: "#86868b", display: "inline-block", width: 100 }}>防火管理者</span>{form.manager_name || "—"}（{form.manager_qual}）</div>
              <div><span style={{ color: "#86868b", display: "inline-block", width: 100 }}>設備</span>{form.equipment.join("、") || "—"}</div>
            </div>

            {/* CTA button */}
            <button onClick={handleGenerate} disabled={completeness < 100 || loading} style={{
              width: "100%", padding: 16, borderRadius: 14, border: "none", fontSize: 17, fontWeight: 600,
              cursor: completeness === 100 && !loading ? "pointer" : "not-allowed",
              background: completeness === 100 && !loading ? "#E8332A" : "#d2d2d7", color: "#fff",
            }}>
              {loading ? "決済画面に移動中..." : `${currentPlan.priceLabel} で生成する`}
            </button>
            {completeness < 100 && <p style={{ fontSize: 13, color: "#86868b", textAlign: "center", marginTop: 10 }}>すべての必須項目を入力すると生成できます</p>}

            {/* Trust badges */}
            <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 16, fontSize: 12, color: "#86868b" }}>
              <span>🔒 SSL暗号化通信</span>
              <span>💳 Stripe安全決済</span>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        {step > 0 && <button onClick={() => setStep(step - 1)} style={{ flex: 1, padding: 14, borderRadius: 14, border: "none", cursor: "pointer", background: "#e8e8ed", color: "#1d1d1f", fontSize: 15, fontWeight: 600 }}>← 戻る</button>}
        {step < STEPS.length - 1 && <button onClick={() => setStep(step + 1)} style={{ flex: 2, padding: 14, borderRadius: 14, border: "none", cursor: "pointer", background: "#E8332A", color: "#fff", fontSize: 15, fontWeight: 600 }}>次へ →</button>}
      </div>
{/* Sample preview modal */}
      {showSample && (
        <div
          onClick={() => setShowSample(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 16,
              width: "100%",
              maxWidth: 900,
              height: "90vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div style={{
              padding: "14px 20px",
              borderBottom: "1px solid #e5e5e5",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#1d1d1f" }}>
                  消防計画サンプル
                </div>
                <div style={{ fontSize: 12, color: "#86868b" }}>
                  京都市・飲食店320㎡(架空事業者)
                </div>
              </div>
              <button
                onClick={() => setShowSample(false)}
                style={{
                  background: "#f5f5f7",
                  border: "none",
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  fontSize: 16,
                  cursor: "pointer",
                  color: "#1d1d1f",
                }}
              >
                ✕
              </button>
            </div>
            {/* Desktop: PDF iframe */}
            <iframe
              src="/samples/sample-kyoto-standard.pdf"
              className="sample-desktop"
            />
            {/* Mobile: page images */}
            <div className="sample-mobile">
              {Array.from({ length: SAMPLE_PAGES_COUNT }, (_, i) => {
                const num = String(i + 1).padStart(2, "0");
                return (
                  <img
                    key={num}
                    src={`/samples/pages/page-${num}.png`}
                    alt={`消防計画サンプル ${i + 1}ページ`}
                    className="sample-mobile-page"
                    loading={i < 3 ? "eager" : "lazy"}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>

    {/* FAQ Section */}
    <section
      style={{
        maxWidth: 1080,
        margin: "0 auto",
        padding: "clamp(64px, 10vw, 96px) clamp(16px, 4vw, 24px)",
      }}
    >
      <h2
        style={{
          fontSize: "clamp(24px, 5vw, 32px)",
          fontWeight: 900,
          textAlign: "center",
          marginBottom: 48,
          color: "#1a1a1a",
        }}
      >
        よくあるご質問
      </h2>
      <div>
        {FAQ_ITEMS.map((item, i) => {
          const isOpen = faqOpen === i;
          return (
            <div
              key={i}
              onClick={() => setFaqOpen(isOpen ? null : i)}
              style={{
                borderBottom: "1px solid #e5e5e5",
                padding: "20px 0",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: 18,
                      fontWeight: 900,
                      color: "#E8332A",
                      flexShrink: 0,
                    }}
                  >
                    Q.
                  </span>
                  <span
                    style={{
                      fontSize: "clamp(14px, 3.5vw, 16px)",
                      fontWeight: 700,
                      color: "#1a1a1a",
                    }}
                  >
                    {item.q}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 24,
                    color: "#666",
                    flexShrink: 0,
                    lineHeight: 1,
                  }}
                >
                  {isOpen ? "−" : "+"}
                </span>
              </div>
              {isOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    marginTop: 16,
                    padding: "clamp(14px, 4vw, 20px)",
                    background: "#FDECEA",
                    borderRadius: 8,
                    display: "flex",
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      fontWeight: 900,
                      color: "#1a1a1a",
                      flexShrink: 0,
                    }}
                  >
                    A.
                  </span>
                  <div
                    style={{
                      fontSize: "clamp(13px, 3.5vw, 15px)",
                      lineHeight: 1.8,
                      color: "#1a1a1a",
                    }}
                  >
                    {item.a}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>

    {/* Subscription CTA */}
    <section style={{ maxWidth: 720, margin: "0 auto", padding: "64px 20px 0" }}>
      <div style={{
        background: "linear-gradient(135deg, #FFF5F5 0%, #FFF 100%)",
        border: "1px solid #FDECEA",
        borderRadius: 20, padding: "40px 32px", textAlign: "center",
      }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
          毎年の更新作業から解放されませんか？
        </h2>
        <p style={{ fontSize: 15, color: "#86868b", lineHeight: 1.7, marginBottom: 24 }}>
          月額プラン提供中。元消防士・現役防災士が監修する消防計画作成サービスです。
        </p>
        <a
          href="/pricing"
          style={{
            display: "inline-block", padding: "14px 36px", borderRadius: 12,
            background: "#E8332A", color: "#fff", fontSize: 15, fontWeight: 600,
            textDecoration: "none",
          }}
        >
          サブスクプランを見る
        </a>
      </div>
    </section>
    </>
  );
}
