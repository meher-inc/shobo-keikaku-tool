"use client";
import { Fragment, useEffect, useRef, useState } from "react";
import { SAMPLE_PAGES_COUNT } from "../lib/sample_pages_count";
import { SPOT_PLANS, isSpotPlanId } from "../lib/spot-plans";
import { MarketingSections } from "../components/marketing-sections";
import { NoteUpdates } from "../components/note-updates";
import TodokedeSeriesNav from "../components/shared/TodokedeSeriesNav";

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
    a: "はい。京都市消防局・東京消防庁・大阪市消防局・堺市消防局・岡山市消防局・横浜市消防局・福岡市消防局・名古屋市消防局・札幌市消防局・川崎市消防局・神戸市消防局・さいたま市消防局・広島市消防局・仙台市消防局・千葉市消防局・北九州市消防局・新潟市消防局・熊本市消防局・相模原市消防局・静岡市消防局の最新様式に準拠しており、そのまま印刷して提出できます。ただし管轄消防署によっては事前相談や追加の記入を求められる場合があります。不安な方はプレミアムプラン(元消防士によるチェック付き)をご利用ください。",
  },
  {
    q: "対応している消防本部を教えてください。",
    a: "現在は京都市消防局・東京消防庁・大阪市消防局・堺市消防局・岡山市消防局・横浜市消防局・福岡市消防局・名古屋市消防局・札幌市消防局・川崎市消防局・神戸市消防局・さいたま市消防局・広島市消防局・仙台市消防局・千葉市消防局・北九州市消防局・新潟市消防局・熊本市消防局・相模原市消防局・静岡市消防局に正式対応しています。それ以外のエリアは標準様式(京都ベース)で出力されますので、ご利用前に管轄消防署の様式と照合することをお勧めします。",
  },
  {
    q: "工事中（増改築・内装改修など）の建物の消防計画にも対応していますか?",
    a: "はい。建物情報のステップで「工事中の消防計画」を選ぶと、火気管理・危険物品の管理・避難経路の確保・消防用設備等の機能停止時の代替措置などを定めた、工事中の防火対象物用の消防計画を生成します。工事概要書や火気使用工事の事前承認書などの別表も同梱されます（スタンダード以上）。工事中の消防計画の届出様式や届出要否は消防本部ごとに運用が異なるため、提出前に所轄消防署へご確認ください。",
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
          href="/contact"
          style={{ color: "var(--brand)", textDecoration: "underline" }}
        >
          法人・複数物件のご相談
        </a>
        からお問い合わせください。担当より折り返しご案内いたします。
      </>
    ),
  },
];

const PLANS = SPOT_PLANS;

// フォーム初期値。下書き復元時のリセット先としても使う。
const INITIAL_FORM = {
  postal: "",
  prefecture: "京都府", city: "京都市", ward: "", address_detail: "",
  building_name: "", use_category: "", total_area: "", num_floors: "", capacity: "",
  owner_name: "", manager_name: "", manager_qual: "甲種", manager_date: "", manager_tel: "",
  has_outsource: false, outsource_company: "",
  equipment: [] as string[], inspection_company: "",
  // 各階の設備配置（任意）。階ごとの設備・数量。
  equipment_floors: [] as { floor: string; detail: string }[],
  emergency_name: "", emergency_tel: "",
  evacuation_site: "", assembly_point: "",
  drill_months: "4月・10月", education_months: "4月・10月",
  // 自衛消防隊の編成（任意）。専用様式の別表に氏名を差し込む。
  leader_name: "", tsuhou_member: "", shoka_member: "", hinan_member: "", kyugo_member: "", anzen_member: "",
  // 工事中の消防計画（plan_kind: "normal" | "construction"）。
  // construction のとき、生成は工事中の防火対象物用テンプレートに切り替わる。
  plan_kind: "normal",
  construction_name: "", construction_type: "", construction_scope: "",
  construction_start: "", construction_end: "",
  contractor_name: "", contractor_tel: "", construction_site_manager: "",
  hot_work: false, hazmat_use: false, equipment_shutdown: "",
  occupied_during_construction: true,
};

// 工事種別の選択肢（工事中の消防計画の工事概要に反映）。
const CONSTRUCTION_TYPES = [
  "内装改修・模様替え", "増築", "改築", "修繕", "設備工事", "外壁・屋上工事", "解体", "新築", "その他",
];

// 入力内容の下書き保存キー（ブラウザの localStorage のみ。サーバには送らない）。
const DRAFT_KEY = "todokede-plan-draft-v1";

// 専門用語の補足説明（クリックで開閉するツールチップ）。
function Hint({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-block", marginLeft: 6, verticalAlign: "middle" }}>
      <button
        type="button"
        aria-label="説明を表示"
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
        style={{ width: 16, height: 16, borderRadius: 999, border: "1px solid var(--border-strong)", background: "var(--surface)", color: "var(--text-muted)", fontSize: 11, fontWeight: 700, lineHeight: "14px", cursor: "pointer", padding: 0 }}
      >
        ?
      </button>
      {open && (
        <span
          role="tooltip"
          style={{ position: "absolute", left: 0, top: 22, zIndex: 20, width: 248, padding: "10px 12px", background: "var(--text)", color: "#fff", fontSize: 12, lineHeight: 1.7, fontWeight: 400, borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.18)", textAlign: "left", whiteSpace: "normal" }}
        >
          {text}
        </span>
      )}
    </span>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", required = false, hint, error, autoComplete, inputMode }: any) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
        {label}{required && <span style={{ color: "var(--err-solid)" }}> *</span>}{hint && <Hint text={hint} />}
      </label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete} inputMode={inputMode}
        aria-required={required || undefined} aria-invalid={error ? true : undefined}
        style={{ width: "100%", padding: "12px 16px", fontSize: 16, border: error ? "1px solid var(--err-solid)" : "1px solid var(--border-strong)", borderRadius: 12, outline: "none", background: "var(--surface-input)" }} />
      {error && <p style={{ fontSize: 12, color: "var(--err-solid)", margin: "4px 0 0" }}>{error}</p>}
    </div>
  );
}

// 電話番号は数字・ハイフン・括弧・空白のみ許容（全角数字も可）。空欄は検証しない。
function telError(v: string): string | undefined {
  if (!v) return undefined;
  return /^[0-9０-９\-‐－ー()（）\s]+$/.test(v) ? undefined : "数字とハイフンで入力してください";
}

// 各ステップの必須項目（「次へ」で前進する際の検証に使用）。
const STEP_REQUIRED: Record<number, { label: string; ok: (f: typeof INITIAL_FORM) => boolean }[]> = {
  0: [
    { label: "都道府県", ok: (f) => !!f.prefecture },
    { label: "市区町村", ok: (f) => !!f.city },
  ],
  1: [
    { label: "建物名称", ok: (f) => !!f.building_name },
    { label: "用途", ok: (f) => !!f.use_category },
    { label: "延べ面積", ok: (f) => !!f.total_area },
    { label: "階数", ok: (f) => !!f.num_floors },
    { label: "収容人員", ok: (f) => !!f.capacity },
    // 工事中の消防計画を選んだ場合のみ必須になる項目。
    { label: "工事種別", ok: (f) => f.plan_kind !== "construction" || !!f.construction_type },
    { label: "着工日", ok: (f) => f.plan_kind !== "construction" || !!f.construction_start },
    { label: "完了予定日", ok: (f) => f.plan_kind !== "construction" || !!f.construction_end },
    { label: "施工者名", ok: (f) => f.plan_kind !== "construction" || !!f.contractor_name },
  ],
  2: [
    { label: "管理権原者 氏名", ok: (f) => !!f.owner_name },
    { label: "防火管理者 氏名", ok: (f) => !!f.manager_name },
    { label: "連絡先", ok: (f) => !!f.manager_tel && !telError(f.manager_tel) },
  ],
  3: [{ label: "消防用設備（1つ以上）", ok: (f) => f.equipment.length > 0 }],
  4: [
    { label: "緊急連絡先 氏名", ok: (f) => !!f.emergency_name },
    { label: "緊急連絡先 TEL", ok: (f) => !!f.emergency_tel && !telError(f.emergency_tel) },
    { label: "避難場所", ok: (f) => !!f.evacuation_site },
  ],
};

export default function Home() {
  const [step, setStep] = useState(0);
  const [stepError, setStepError] = useState("");
  const [loading, setLoading] = useState(false);
const [selectedPlan, setSelectedPlan] = useState("standard");
const [showSample, setShowSample] = useState(false);  // ← これを追加
const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [postalStatus, setPostalStatus] = useState<"idle" | "loading" | "ok" | "notfound" | "error">("idle");
  const [genError, setGenError] = useState("");
  const [form, setForm] = useState(INITIAL_FORM);
  const [draftRestored, setDraftRestored] = useState(false);
  // 購入後の編集モード（/?edit=<session_id> で起動）。聖域の order-form API と連携。
  const [editSession, setEditSession] = useState<string | null>(null);
  const [editable, setEditable] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const draftLoaded = useRef(false);
  const editMode = useRef(false);
  const stepScrollReady = useRef(false);

  // ステップ変更時にフォーム上部へスクロール（特にモバイルで新ステップ先頭を表示）。
  useEffect(() => {
    setStepError("");
    if (!stepScrollReady.current) {
      stepScrollReady.current = true;
      return;
    }
    document.getElementById("form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  // 「次へ」で前進する際に現ステップの必須項目を検証（不足時は前進せず案内）。
  function goNext() {
    const miss = (STEP_REQUIRED[step] || []).filter((r) => !r.ok(form)).map((r) => r.label);
    if (miss.length > 0) {
      setStepError(`次の項目をご入力ください：${miss.join("、")}`);
      return;
    }
    setStepError("");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  // Preselect plan when arriving from the pricing page (/?plan=standard など).
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("plan");
    if (param && isSpotPlanId(param)) {
      setSelectedPlan(param);
    }
  }, []);

  // 購入後の編集モード。/?edit=<session_id> で起動し、注文の form_data を
  // サーバ（聖域 order-form API）から取得してフォームへ読み込む。
  useEffect(() => {
    const sid = new URLSearchParams(window.location.search).get("edit");
    if (!sid) return;
    editMode.current = true;
    setEditSession(sid);
    setStep(STEPS.length - 1); // 確認・保存ステップで読込結果（成功/エラー）を表示
    (async () => {
      try {
        const res = await fetch(`/api/order-form?session_id=${encodeURIComponent(sid)}`);
        const data = await res.json();
        if (!res.ok) {
          setGenError(data.error || "購入情報の読み込みに失敗しました。");
          return;
        }
        if (data.form_data && typeof data.form_data === "object") {
          setForm({ ...INITIAL_FORM, ...data.form_data });
        }
        setEditable(data.editable !== false);
      } catch {
        setGenError("通信エラーが発生しました。時間をおいて再度お試しください。");
      }
    })();
  }, []);

  // 入力内容の下書きをブラウザから復元（マウント時）。サーバには保存しない。
  // 編集モードでは注文データを使うため復元しない。
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("edit")) {
      draftLoaded.current = true;
      return;
    }
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && typeof saved === "object") {
          const merged = { ...INITIAL_FORM, ...saved };
          setForm(merged);
          // 初期値と異なる（＝実際に入力済み）場合のみ復元バナーを出す。
          if (JSON.stringify(merged) !== JSON.stringify(INITIAL_FORM)) {
            setDraftRestored(true);
          }
        }
      }
    } catch {
      // 破損データ等は無視して通常入力にフォールバック。
    }
    draftLoaded.current = true;
  }, []);

  // 入力内容を下書きとして保存（復元完了後のみ。初回ロード前の上書きを防ぐ）。
  // 編集モードでは下書きに保存しない（注文データを汚さない）。
  useEffect(() => {
    if (!draftLoaded.current || editMode.current) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    } catch {
      // 容量超過・プライベートモード等は無視。
    }
  }, [form]);

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* noop */
    }
    setForm({ ...INITIAL_FORM, equipment: [] });
    setDraftRestored(false);
    setStep(0);
  };

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  // 郵便番号 → 住所 自動入力（所轄判定の精度向上・入力短縮）。
  // 政令市は address2 が「○○市××区」のため、所轄判定用に市と区へ分割する。
  // 失敗時は何もせず手入力にフォールバック。
  const lookupPostal = async (raw: string) => {
    const zip = (raw || "").replace(/[^0-9]/g, "");
    if (zip.length !== 7) return;
    setPostalStatus("loading");
    try {
      const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zip}`);
      const data = await res.json();
      const r = data && Array.isArray(data.results) ? data.results[0] : null;
      if (!r) { setPostalStatus("notfound"); return; }
      const a2 = String(r.address2 || "");
      const m = a2.match(/^(.+?市)(.+区)$/); // 政令市の市/区を分割（特別区は市が無いので非該当）
      const city = m ? m[1] : a2;
      const ward = m ? m[2] : "";
      setForm(f => ({
        ...f,
        prefecture: String(r.address1 || ""),
        city,
        ward,
        address_detail: String(r.address3 || "") || f.address_detail,
      }));
      setPostalStatus("ok");
    } catch {
      setPostalStatus("error");
    }
  };
  const toggleEquip = (e: string) => set("equipment", form.equipment.includes(e) ? form.equipment.filter((x: string) => x !== e) : [...form.equipment, e]);
  // 各階の設備配置（任意）の行操作
  const addFloorRow = () => set("equipment_floors", [...form.equipment_floors, { floor: "", detail: "" }]);
  const updateFloorRow = (i: number, k: "floor" | "detail", v: string) =>
    set("equipment_floors", form.equipment_floors.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)));
  const removeFloorRow = (i: number) =>
    set("equipment_floors", form.equipment_floors.filter((_, idx) => idx !== i));
  const selectedUse = USE_CATEGORIES.find(u => u.value === form.use_category);
  const isSpecific = selectedUse?.specific ?? false;
  const deptName =
    form.city === "京都市" ? "京都市消防局"
    : form.prefecture === "東京都" ? "東京消防庁"
    : form.prefecture === "大阪府" && form.city === "堺市" ? "堺市消防局"
    : form.city === "大阪市" ? "大阪市消防局"
    : form.city === "横浜市" ? "横浜市消防局"
    : form.prefecture === "神奈川県" && form.city === "川崎市" ? "川崎市消防局"
    : form.prefecture === "神奈川県" && form.city === "相模原市" ? "相模原市消防局"
    : form.prefecture === "静岡県" && form.city === "静岡市" ? "静岡市消防局"
    : form.prefecture === "福岡県" && form.city === "北九州市" ? "北九州市消防局"
    : form.prefecture === "新潟県" && form.city === "新潟市" ? "新潟市消防局"
    : form.prefecture === "熊本県" && form.city === "熊本市" ? "熊本市消防局"
    : form.city === "福岡市" ? "福岡市消防局"
    : form.city === "名古屋市" ? "名古屋市消防局"
    : form.prefecture === "北海道" && form.city === "札幌市" ? "札幌市消防局"
    : form.prefecture === "兵庫県" && form.city === "神戸市" ? "神戸市消防局"
    : form.prefecture === "埼玉県" && form.city === "さいたま市" ? "さいたま市消防局"
    : form.prefecture === "広島県" && form.city === "広島市" ? "広島市消防局"
    : form.prefecture === "宮城県" && form.city === "仙台市" ? "仙台市消防局"
    : form.prefecture === "千葉県" && form.city === "千葉市" ? "千葉市消防局"
    : form.prefecture === "岡山県" && form.city === "岡山市" ? "岡山市消防局"
    : form.prefecture === "静岡県" && form.city === "浜松市" ? "浜松市消防局"
    : form.city ? "標準様式"
    : "";

  // 専用様式はないが所轄が判明している消防本部（標準様式で作成する）。
  // 画面では所轄名を出しつつ「標準様式で作成」と明示し、専用対応と誤認させない。
  const NAMED_STANDARD_DEPTS = new Set(["浜松市消防局"]);
  const deptKind: "official" | "named-standard" | "standard" | null =
    !deptName ? null
    : deptName === "標準様式" ? "standard"
    : NAMED_STANDARD_DEPTS.has(deptName) ? "named-standard"
    : "official";

  const isConstruction = form.plan_kind === "construction";
  const checks = [
    form.building_name, form.use_category, form.total_area, form.capacity, form.owner_name, form.manager_name, form.manager_tel, form.equipment.length > 0, form.emergency_name, form.evacuation_site,
    // 工事中の消防計画では工事の基本情報も揃ってから生成できるようにする。
    ...(isConstruction ? [form.construction_type, form.construction_start, form.construction_end, form.contractor_name] : []),
  ];
  const completeness = Math.round(checks.filter(Boolean).length / checks.length * 100);

  const missing: string[] = [];
  if (!form.building_name) missing.push("建物名称");
  if (!form.use_category) missing.push("用途");
  if (!form.total_area) missing.push("延べ面積");
  if (!form.owner_name) missing.push("管理権原者");
  if (!form.manager_name) missing.push("防火管理者");
  if (form.equipment.length === 0) missing.push("消防用設備");
  if (!form.evacuation_site) missing.push("避難場所");
  if (isConstruction) {
    if (!form.construction_type) missing.push("工事種別");
    if (!form.construction_start) missing.push("着工日");
    if (!form.construction_end) missing.push("完了予定日");
    if (!form.contractor_name) missing.push("施工者名");
  }

  const currentPlan = PLANS.find(p => p.id === selectedPlan)!;

  async function handleGenerate() {
    setLoading(true);
    setGenError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, plan: selectedPlan }),
      });
      const data = await res.json();
      if (data.url) {
        // 決済に進むので下書きを消す（生成後に古い入力が残らないように）。
        try { localStorage.removeItem(DRAFT_KEY); } catch { /* noop */ }
        window.location.href = data.url;
      } else {
        setGenError("決済セッションの作成に失敗しました。時間をおいて再度お試しください。");
      }
    } catch {
      setGenError("通信エラーが発生しました。電波状況をご確認のうえ再度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  // 購入後の編集モード：修正を保存してから、追加料金なしで再生成・ダウンロードする。
  async function handleSaveAndDownload() {
    if (!editSession) return;
    setEditLoading(true);
    setGenError("");
    try {
      const res = await fetch("/api/order-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: editSession, form_data: form }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGenError(data.error || "保存に失敗しました。時間をおいて再度お試しください。");
        return;
      }
      // 修正版を再生成してダウンロード（決済は発生しない）。
      window.location.href = `/api/download?session_id=${encodeURIComponent(editSession)}`;
    } catch {
      setGenError("通信エラーが発生しました。電波状況をご確認のうえ再度お試しください。");
    } finally {
      setEditLoading(false);
    }
  }

  return (
    <>
    {/* Hero */}
    <section style={{ textAlign: "center", padding: "clamp(56px,9vw,96px) clamp(16px,4vw,24px) clamp(40px,6vw,64px)", maxWidth: 760, margin: "0 auto" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--brand-tint)", color: "var(--brand)", fontSize: 13, fontWeight: 700, padding: "8px 16px", borderRadius: 999, marginBottom: 24 }}>
        20の消防本部様式に準拠・1件 ¥4,980〜 の買い切り
      </div>
      <h1 style={{ fontSize: "clamp(30px,6vw,46px)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 16 }}>消防計画を、自動作成。</h1>
      <p style={{ fontSize: "clamp(15px,2.5vw,18px)", color: "var(--text-muted)", fontWeight: 400, lineHeight: 1.7, maxWidth: 580, margin: "0 auto" }}>
        開業前・立入検査・防火管理者の選任で「消防計画の提出」を求められた方へ。所在地と建物情報を入力するだけで、所轄の様式に沿った消防計画を約15分でWord作成。元消防士監修・買い切り（月額・更新料なし）。
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 32 }}>
        <a href="#form" style={{ background: "var(--brand)", color: "#fff", padding: "15px 36px", borderRadius: 12, fontSize: 16, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 14px rgba(46,95,158,0.25)" }}>
          作成をはじめる
        </a>
        <button
          onClick={() => setShowSample(true)}
          style={{ background: "var(--surface)", border: "2px solid var(--brand)", color: "var(--brand)", padding: "13px 32px", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer" }}
        >
          サンプルを見る
        </button>
      </div>
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 14 }}>
        実際に生成される消防計画（飲食店320㎡・別表付き）をご確認いただけます
      </p>
    </section>

    <MarketingSections />

    <div id="form" style={{ maxWidth: 640, margin: "0 auto", padding: "clamp(48px,8vw,80px) 16px 40px", scrollMarginTop: 24 }}>
      <h2 style={{ fontSize: "clamp(22px,4.5vw,30px)", fontWeight: 800, textAlign: "center", letterSpacing: "-0.01em", marginBottom: 8 }}>消防計画をつくる</h2>
      <p style={{ fontSize: 15, color: "var(--text-muted)", textAlign: "center", marginBottom: 32 }}>6ステップの入力で、提出できる計画書が完成します。</p>

      <div style={{ display: "flex", gap: 4, marginBottom: 24, padding: 4, background: "var(--surface-muted)", borderRadius: 12 }}>
        {STEPS.map((s, i) => (
          <button key={s.id} onClick={() => setStep(i)} style={{
            flex: 1, padding: "10px 4px", border: "none", cursor: "pointer", borderRadius: 10, fontSize: 12, fontWeight: 600,
            background: i === step ? "var(--surface)" : "transparent", color: i === step ? "var(--text)" : i < step ? "var(--ok-solid)" : "var(--text-muted)",
            boxShadow: i === step ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
          }}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 2 }}>{i < step ? "✓" : i + 1}</div>
            {s.title}
          </button>
        ))}
      </div>

      <div style={{ background: "var(--surface)", borderRadius: 20, padding: "32px 28px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", minHeight: 380 }}>

        {draftRestored && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "space-between", marginBottom: 20, padding: "12px 16px", background: "var(--brand-tint)", border: "1px solid var(--brand-tint-border)", borderRadius: 12 }}>
            <span style={{ fontSize: 13, color: "var(--brand)", fontWeight: 600 }}>前回の入力内容を復元しました（この端末にのみ保存）。</span>
            <button
              type="button"
              onClick={clearDraft}
              style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: 8, padding: "6px 14px", cursor: "pointer", whiteSpace: "nowrap" }}
            >
              新しく入力する
            </button>
          </div>
        )}

        {step === 0 && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>所在地</h2>
            <p style={{ fontSize: 15, color: "var(--text-muted)", marginBottom: 28 }}>消防本部を自動で特定します</p>

            {/* 郵便番号 → 住所 自動入力 */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>郵便番号</label>
              <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  aria-label="郵便番号"
                  value={form.postal}
                  onChange={(e: any) => {
                    const v = e.target.value;
                    set("postal", v);
                    if (postalStatus !== "idle") setPostalStatus("idle");
                    if (v.replace(/[^0-9]/g, "").length === 7) lookupPostal(v);
                  }}
                  placeholder="6000000（ハイフン不要）"
                  style={{ flex: 1, padding: "12px 16px", fontSize: 16, border: "1px solid var(--border-strong)", borderRadius: 12, outline: "none", background: "var(--surface-input)" }}
                />
                <button
                  type="button"
                  onClick={() => lookupPostal(form.postal)}
                  disabled={postalStatus === "loading"}
                  style={{ padding: "0 18px", fontSize: 14, fontWeight: 600, color: "#fff", background: "var(--brand)", border: "none", borderRadius: 12, cursor: "pointer", whiteSpace: "nowrap", opacity: postalStatus === "loading" ? 0.6 : 1 }}
                >
                  {postalStatus === "loading" ? "検索中…" : "住所を入力"}
                </button>
              </div>
              <p style={{ fontSize: 12, marginTop: 6, minHeight: 16, color: postalStatus === "ok" ? "var(--ok-text)" : postalStatus === "notfound" || postalStatus === "error" ? "var(--warn-text)" : "var(--text-muted)" }}>
                {postalStatus === "ok" ? "住所を自動入力しました。番地以降を追記してください。"
                  : postalStatus === "notfound" ? "該当する住所が見つかりませんでした。手入力してください。"
                  : postalStatus === "error" ? "住所の取得に失敗しました。手入力してください。"
                  : "郵便番号を入力すると都道府県・市区町村を自動で補完します。"}
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="都道府県" value={form.prefecture} onChange={(e: any) => set("prefecture", e.target.value)} required />
              <Field label="市区町村" value={form.city} onChange={(e: any) => set("city", e.target.value)} required />
            </div>
            <Field label="区" value={form.ward} onChange={(e: any) => set("ward", e.target.value)} />
            <Field label="以降の住所" value={form.address_detail} onChange={(e: any) => set("address_detail", e.target.value)} placeholder="○○通○○町123" />
            {deptKind && (
              <div role="status" aria-live="polite" style={{ padding: "16px 20px", borderRadius: 14, marginTop: 8,
                background: deptKind === "official" ? "var(--ok-bg)" : deptKind === "named-standard" ? "var(--brand-tint)" : "var(--warn-bg)",
                border: deptKind === "official" ? "1px solid var(--ok-border)" : deptKind === "named-standard" ? "1px solid var(--brand-tint-border)" : "1px solid var(--warn-border)" }}>
                <div style={{ fontSize: 13, fontWeight: 600,
                  color: deptKind === "official" ? "var(--ok-text)" : deptKind === "named-standard" ? "var(--brand)" : "var(--warn-text)" }}>
                  {deptKind === "official" ? "所轄消防本部を特定しました" : deptKind === "named-standard" ? "所轄消防本部（標準様式で作成）" : "未対応（標準様式で作成）"}
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4,
                  color: deptKind === "official" ? "var(--ok-text-strong)" : deptKind === "named-standard" ? "var(--brand-dark)" : "var(--warn-text-strong)" }}>{deptName}</div>
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>建物情報</h2>
            <p style={{ fontSize: 15, color: "var(--text-muted)", marginBottom: 28 }}>テンプレートを自動で選定します</p>

            {/* 計画の種類（通常／工事中）。construction を選ぶと工事中の防火対象物用の計画を生成する。 */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
                作成する消防計画の種類
                <Hint text="増改築・内装改修・修繕などの工事を行う建物では、通常の消防計画とは別に『工事中の消防計画』の作成・届出を求められることがあります。工事中を選ぶと、火気管理・危険物品の管理・避難経路の確保・消防用設備等の代替措置などを定めた工事中の防火対象物用の計画を生成します。" />
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {([
                  ["normal", "通常の消防計画", "営業中・使用中の建物"],
                  ["construction", "工事中の消防計画", "増改築・改修・解体等の工事を行う建物"],
                ] as [string, string, string][]).map(([val, title, desc]) => {
                  const active = form.plan_kind === val;
                  return (
                    <button key={val} onClick={() => set("plan_kind", val)} style={{
                      padding: "14px 14px", borderRadius: 12, border: "none", cursor: "pointer", textAlign: "left" as const,
                      background: active ? "var(--brand-tint)" : "var(--surface-3)",
                      outline: active ? "2px solid var(--brand)" : "1px solid transparent",
                    }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: active ? "var(--brand-dark)" : "var(--text)" }}>{title}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, lineHeight: 1.5 }}>{desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <Field label="建物名称" value={form.building_name} onChange={(e: any) => set("building_name", e.target.value)} placeholder="○○ビル" required />
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>用途（令別表第一）<span style={{ color: "var(--err-solid)" }}> *</span><Hint text="建物の使い方の区分です（消防法施行令 別表第一の項）。劇場・飲食店・物販店・宿泊・病院・福祉施設などの『特定用途』は防火管理の基準が厳しくなります。わからない場合は最も近い用途を選んでください。" /></label>
              <select value={form.use_category} onChange={(e: any) => set("use_category", e.target.value)} style={{ width: "100%", padding: "12px 16px", fontSize: 16, border: "1px solid var(--border-strong)", borderRadius: 12, background: "var(--surface-input)", cursor: "pointer" }}>
                <option value="">選択してください</option>
                {USE_CATEGORIES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
              {selectedUse && <div style={{ display: "inline-block", marginTop: 8, fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, background: isSpecific ? "var(--warn-bg)" : "var(--info-bg)", color: isSpecific ? "var(--warn-accent)" : "var(--info-text)" }}>{isSpecific ? "● 特定防火対象物" : "● 非特定防火対象物"}</div>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <Field label="延べ面積（㎡）" value={form.total_area} onChange={(e: any) => set("total_area", e.target.value)} type="number" required hint="建物すべての階の床面積の合計（㎡）です。登記事項証明書や検査済証で確認できます。" />
              <Field label="階数" value={form.num_floors} onChange={(e: any) => set("num_floors", e.target.value)} type="number" required hint="地上階数を入力します（地階がある場合は備考や以降の住所欄で補足してください）。" />
              <Field label="収容人員" value={form.capacity} onChange={(e: any) => set("capacity", e.target.value)} type="number" required hint="その建物・テナントに通常いる人数（従業員＋利用者など）の合計です。消防法令の算定基準で求めた人数を入力します。" />
            </div>

            {/* 工事中の消防計画を選んだ場合の工事情報 */}
            {form.plan_kind === "construction" && (
              <div style={{ marginTop: 8, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>工事の情報</h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>工事概要書・火気管理などの章に反映されます。</p>
                <Field label="工事名称" value={form.construction_name} onChange={(e: any) => set("construction_name", e.target.value)} placeholder="○○ビル 2階内装改修工事" hint="施工者との契約書や見積書に記載の工事件名です。未定の場合は「（建物名）改修工事」のような仮の名称でも構いません。" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>工事種別<span style={{ color: "var(--err-solid)" }}> *</span></label>
                    <select value={form.construction_type} onChange={(e: any) => set("construction_type", e.target.value)} style={{ width: "100%", padding: "12px 16px", fontSize: 16, border: "1px solid var(--border-strong)", borderRadius: 12, background: "var(--surface-input)", cursor: "pointer" }}>
                      <option value="">選択してください</option>
                      {CONSTRUCTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <Field label="工事範囲（階・部分）" value={form.construction_scope} onChange={(e: any) => set("construction_scope", e.target.value)} placeholder="2階 客席部分" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="着工日" value={form.construction_start} onChange={(e: any) => set("construction_start", e.target.value)} placeholder="令和8年8月1日" required />
                  <Field label="完了予定日" value={form.construction_end} onChange={(e: any) => set("construction_end", e.target.value)} placeholder="令和8年9月30日" required />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="施工者（元請）名" value={form.contractor_name} onChange={(e: any) => set("contractor_name", e.target.value)} placeholder="○○建設株式会社" required />
                  <Field label="施工者 連絡先" value={form.contractor_tel} onChange={(e: any) => set("contractor_tel", e.target.value)} type="tel" inputMode="tel" error={telError(form.contractor_tel)} />
                </div>
                <Field label="現場責任者 氏名" value={form.construction_site_manager} onChange={(e: any) => set("construction_site_manager", e.target.value)} hint="施工者側の現場代理人・作業所長など、工事部分の火元責任者となる方です。" />
                <Field label="機能停止予定の消防用設備等" value={form.equipment_shutdown} onChange={(e: any) => set("equipment_shutdown", e.target.value)} placeholder="自動火災報知設備（2階感知器）を○月○日〜○日停止" hint="工事に伴い自動火災報知設備・スプリンクラー等を一時停止する予定があれば記入します。停止する場合は所轄消防署への事前連絡が必要です。未定・なしの場合は空欄で構いません。" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                  {([
                    ["hot_work", "溶接・溶断など火気を使用する工事がある"],
                    ["hazmat_use", "塗料・シンナー等の危険物品を持ち込む"],
                  ] as ["hot_work" | "hazmat_use", string][]).map(([key, label]) => {
                    const active = !!form[key];
                    return (
                      <button key={key} onClick={() => set(key, !active)} style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 12, border: "none", cursor: "pointer",
                        background: active ? "var(--brand-tint)" : "var(--surface-3)", outline: active ? "2px solid var(--brand)" : "1px solid transparent",
                        fontSize: 13, fontWeight: 500, textAlign: "left" as const,
                      }}>
                        <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, background: active ? "var(--brand)" : "var(--surface)", border: active ? "none" : "2px solid var(--border-strong)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {active && <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>✓</span>}
                        </div>
                        {label}
                      </button>
                    );
                  })}
                </div>
                <div style={{ marginBottom: 4 }}>
                  <button onClick={() => set("occupied_during_construction", !form.occupied_during_construction)} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 12, border: "none", cursor: "pointer", width: "100%",
                    background: form.occupied_during_construction ? "var(--brand-tint)" : "var(--surface-3)", outline: form.occupied_during_construction ? "2px solid var(--brand)" : "1px solid transparent",
                    fontSize: 13, fontWeight: 500, textAlign: "left" as const,
                  }}>
                    <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, background: form.occupied_during_construction ? "var(--brand)" : "var(--surface)", border: form.occupied_during_construction ? "none" : "2px solid var(--border-strong)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {form.occupied_during_construction && <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>✓</span>}
                    </div>
                    営業（使用）しながら工事を行う
                  </button>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "6px 0 0" }}>チェックすると、使用部分と工事部分の区画・利用者の安全確保に関する条項が計画に追加されます。</p>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>管理者情報</h2>
            <p style={{ fontSize: 15, color: "var(--text-muted)", marginBottom: 28 }}>防火管理者の情報を入力します</p>
            <Field label="管理権原者 氏名" value={form.owner_name} onChange={(e: any) => set("owner_name", e.target.value)} required />
            <Field label="防火管理者 氏名" value={form.manager_name} onChange={(e: any) => set("manager_name", e.target.value)} required />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>資格種別 *<Hint text="防火管理者の資格区分です。特定用途で収容30人以上・延床300㎡以上などの場合は甲種、それ以外は乙種が目安です。選任済みの資格証でご確認ください。" /></label>
                <select value={form.manager_qual} onChange={(e: any) => set("manager_qual", e.target.value)} style={{ width: "100%", padding: "12px 16px", fontSize: 16, border: "1px solid var(--border-strong)", borderRadius: 12, background: "var(--surface-input)", cursor: "pointer" }}>
                  <option value="甲種">甲種</option>
                  <option value="乙種">乙種</option>
                </select>
              </div>
              <Field label="選任年月日" value={form.manager_date} onChange={(e: any) => set("manager_date", e.target.value)} placeholder="令和6年4月1日" />
            </div>
            <Field label="連絡先" value={form.manager_tel} onChange={(e: any) => set("manager_tel", e.target.value)} type="tel" inputMode="tel" autoComplete="tel" required error={telError(form.manager_tel)} />
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>消防用設備等</h2>
            <p style={{ fontSize: 15, color: "var(--text-muted)", marginBottom: 28 }}>設置されている設備を選択してください</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24 }}>
              {EQUIPMENT.map(e => {
                const active = form.equipment.includes(e);
                return (
                  <button key={e} onClick={() => toggleEquip(e)} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 12, border: "none", cursor: "pointer",
                    background: active ? "var(--brand-tint)" : "var(--surface-3)", outline: active ? "2px solid var(--brand)" : "1px solid transparent",
                    fontSize: 14, fontWeight: 500, textAlign: "left" as const,
                  }}>
                    <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, background: active ? "var(--brand)" : "var(--surface)", border: active ? "none" : "2px solid var(--border-strong)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {active && <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>✓</span>}
                    </div>
                    {e}
                  </button>
                );
              })}
            </div>
            <Field label="点検委託先" value={form.inspection_company} onChange={(e: any) => set("inspection_company", e.target.value)} placeholder="○○防災設備株式会社" />

            {/* 各階の設備配置（任意・動的入力） */}
            <div style={{ marginTop: 8, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                各階の設備配置
                <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 600, color: "var(--text-muted)", background: "var(--surface-muted)", borderRadius: 999, padding: "2px 10px", verticalAlign: "middle" }}>任意</span>
                <Hint text="階ごとの消防用設備とおおよその数量を任意で記入できます。入力すると生成する計画書の「防火対象物の概要」に各階配置として反映されます。未入力でも提出後に追記できます。" />
              </h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>例: 「1階」「消火器3本、屋内消火栓1」のように記入します。</p>
              {form.equipment_floors.map((r, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "104px 1fr 36px", gap: 8, marginBottom: 8, alignItems: "center" }}>
                  <input
                    aria-label={`設備配置 ${i + 1} 行目 階`}
                    placeholder="1階"
                    value={r.floor}
                    onChange={(e) => updateFloorRow(i, "floor", e.target.value)}
                    style={{ padding: "11px 12px", fontSize: 14, borderRadius: 10, border: "1px solid var(--border-strong)", background: "var(--surface-input)", color: "var(--text)", outline: "none", width: "100%", boxSizing: "border-box" }}
                  />
                  <input
                    aria-label={`設備配置 ${i + 1} 行目 設備・数量`}
                    placeholder="消火器3本、屋内消火栓1"
                    value={r.detail}
                    onChange={(e) => updateFloorRow(i, "detail", e.target.value)}
                    style={{ padding: "11px 12px", fontSize: 14, borderRadius: 10, border: "1px solid var(--border-strong)", background: "var(--surface-input)", color: "var(--text)", outline: "none", width: "100%", boxSizing: "border-box" }}
                  />
                  <button
                    type="button"
                    onClick={() => removeFloorRow(i)}
                    aria-label={`設備配置 ${i + 1} 行目を削除`}
                    style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid var(--border-strong)", background: "var(--surface-3)", color: "var(--text-muted)", cursor: "pointer", fontSize: 18, lineHeight: 1 }}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addFloorRow}
                style={{ marginTop: 4, padding: "9px 16px", fontSize: 13, fontWeight: 600, borderRadius: 10, border: "1px dashed var(--border-strong)", background: "transparent", color: "var(--brand)", cursor: "pointer" }}
              >
                ＋ 階を追加
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>運用情報</h2>
            <p style={{ fontSize: 15, color: "var(--text-muted)", marginBottom: 28 }}>緊急時の連絡先と避難場所</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="緊急連絡先 氏名" value={form.emergency_name} onChange={(e: any) => set("emergency_name", e.target.value)} required />
              <Field label="緊急連絡先 TEL" value={form.emergency_tel} onChange={(e: any) => set("emergency_tel", e.target.value)} type="tel" inputMode="tel" autoComplete="tel" required error={telError(form.emergency_tel)} />
            </div>
            <Field label="広域避難場所" value={form.evacuation_site} onChange={(e: any) => set("evacuation_site", e.target.value)} placeholder="○○区○○町 ○○公園" required />
            <Field label="一時集合場所" value={form.assembly_point} onChange={(e: any) => set("assembly_point", e.target.value)} placeholder="ビル北側駐車場" />

            {/* 自衛消防隊の編成（任意・専用様式の別表に反映） */}
            <div style={{ marginTop: 8, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                自衛消防隊の編成
                <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 600, color: "var(--text-muted)", background: "var(--surface-muted)", borderRadius: 999, padding: "2px 10px", verticalAlign: "middle" }}>任意</span>
                <Hint text="各班の担当者氏名です。入力すると、対応している消防本部の様式では別表「自衛消防隊の編成」に自動で差し込まれます。未入力の場合は空欄で出力され、後から記入できます。" />
              </h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>分かる範囲でご記入ください（後から追記も可能です）。</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="自衛消防隊長" value={form.leader_name} onChange={(e: any) => set("leader_name", e.target.value)} autoComplete="off" />
                <Field label="通報連絡班" value={form.tsuhou_member} onChange={(e: any) => set("tsuhou_member", e.target.value)} autoComplete="off" />
                <Field label="初期消火班" value={form.shoka_member} onChange={(e: any) => set("shoka_member", e.target.value)} autoComplete="off" />
                <Field label="避難誘導班" value={form.hinan_member} onChange={(e: any) => set("hinan_member", e.target.value)} autoComplete="off" />
                <Field label="救護班" value={form.kyugo_member} onChange={(e: any) => set("kyugo_member", e.target.value)} autoComplete="off" />
                <Field label="安全防護班" value={form.anzen_member} onChange={(e: any) => set("anzen_member", e.target.value)} autoComplete="off" />
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{editSession ? "内容を修正する" : "プランを選択"}</h2>
            <p style={{ fontSize: 15, color: "var(--text-muted)", marginBottom: 24 }}>{editSession ? "購入済みの計画書を修正し、追加料金なしで再生成できます" : "内容を確認してプランを選んでください"}</p>

            {editSession && (
              <div role="status" style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 16px", borderRadius: 12, marginBottom: 20, background: "var(--ok-bg)", border: "1px solid var(--ok-border)", color: "var(--ok-text-strong)", fontSize: 13.5, lineHeight: 1.7 }}>
                <span aria-hidden="true">✓</span>
                <span>購入済みの計画を編集しています。各ステップで内容を修正し、下の「修正版を保存してダウンロード」で再生成できます（決済は発生しません）。</span>
              </div>
            )}

            {/* 購入前の内容確認プレビュー（決済前に所轄・入力内容・作成物を確認できる） */}
            <div style={{ border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px", marginBottom: 24, background: "var(--surface-2)" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "var(--brand)", letterSpacing: "0.02em", marginBottom: 12 }}>ご入力内容の確認</div>

              {deptName && (
                <div style={{ fontSize: 14, lineHeight: 1.7, padding: "10px 14px", borderRadius: 10, marginBottom: 14, background: "var(--brand-tint)", border: "1px solid var(--brand-tint-border)", color: "var(--text)" }}>
                  {isConstruction ? (
                    <>この内容で <strong>工事中の消防計画</strong>（工事中の防火対象物用{deptKind === "official" ? <>・<strong>{deptName}</strong> 管内</> : null}）を作成します。工事中の計画の様式・届出要否は消防本部ごとに運用が異なるため、提出前に所轄消防署へご確認ください。</>
                  ) : (
                    <>
                      {deptKind === "official" && <>この内容で <strong>{deptName}</strong> の様式に準拠した消防計画を作成します。</>}
                      {deptKind === "named-standard" && <><strong>{deptName}</strong> 管内です。専用様式がないため <strong>標準様式</strong> で作成します。</>}
                      {deptKind === "standard" && <>対応エリア外のため <strong>標準様式</strong>（京都市ベース）で作成します。ご利用前に管轄の様式とご照合ください。</>}
                    </>
                  )}
                </div>
              )}

              <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 14px", margin: 0, fontSize: 13.5, lineHeight: 1.6 }}>
                {([
                  ["計画の種類", isConstruction ? "工事中の消防計画（工事中の防火対象物用）" : ""],
                  ["所在地", [form.prefecture, form.city, form.ward, form.address_detail].filter(Boolean).join("")],
                  ["建物名称", form.building_name],
                  ["工事概要", isConstruction ? [form.construction_name, form.construction_type, form.construction_scope].filter(Boolean).join(" / ") : ""],
                  ["工事期間", isConstruction ? [form.construction_start, form.construction_end].filter(Boolean).join(" 〜 ") : ""],
                  ["施工者", isConstruction ? [form.contractor_name, form.construction_site_manager && `現場責任者:${form.construction_site_manager}`, form.contractor_tel].filter(Boolean).join(" / ") : ""],
                  ["用途", form.use_category],
                  ["規模", [form.total_area && `${form.total_area}㎡`, form.num_floors && `${form.num_floors}階`, form.capacity && `${form.capacity}人`].filter(Boolean).join(" / ")],
                  ["管理権原者", form.owner_name],
                  ["防火管理者", form.manager_name && `${form.manager_name}${form.manager_qual ? `（${form.manager_qual}）` : ""}`],
                  ["連絡先", form.manager_tel],
                  ["消防用設備", form.equipment.join("、")],
                  ["各階配置", form.equipment_floors.filter(r => r.floor || r.detail).map(r => `${r.floor || "—"}: ${r.detail}`).join(" ／ ")],
                  ["自衛消防隊", [form.leader_name && `隊長:${form.leader_name}`, form.tsuhou_member && `通報:${form.tsuhou_member}`, form.shoka_member && `初期消火:${form.shoka_member}`, form.hinan_member && `避難誘導:${form.hinan_member}`, form.kyugo_member && `救護:${form.kyugo_member}`, form.anzen_member && `安全:${form.anzen_member}`].filter(Boolean).join(" / ")],
                  ["避難場所", [form.evacuation_site, form.assembly_point].filter(Boolean).join(" / ")],
                ] as [string, string][]).filter(([, v]) => v).map(([k, v]) => (
                  <Fragment key={k}>
                    <dt style={{ color: "var(--text-muted)", whiteSpace: "nowrap" }}>{k}</dt>
                    <dd style={{ margin: 0, color: "var(--text)", wordBreak: "break-word" }}>{v}</dd>
                  </Fragment>
                ))}
              </dl>

              <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)", fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.7 }}>
                {isConstruction
                  ? "作成物には次を同梱します: 入力内容の概要 ／ 提出前チェックリスト ／ 別表（工事概要書・火気使用工事 事前承認書・危険物品持込届 等） ／ 各階平面図の記入テンプレート"
                  : "作成物には次を同梱します: 入力内容の概要 ／ 提出前チェックリスト ／ 各階平面図の記入テンプレート ／ 作成後の提出のしかた"}
              </div>

              {missing.length > 0 && (
                <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: "var(--warn-bg)", border: "1px solid var(--warn-border)", color: "var(--warn-text-strong)", fontSize: 13, lineHeight: 1.7 }}>
                  未入力の項目があります: {missing.join("、")}。<br />
                  上のステップ番号から該当ステップに戻って入力すると、より完成度が高まります。
                </div>
              )}

              <div style={{ marginTop: 10, fontSize: 12.5, color: "var(--text-faint)" }}>
                修正がある場合は、決済前に上のステップへ戻って編集できます。
              </div>
            </div>

            {/* Plan selector（編集モードではプラン固定のため非表示） */}
            <div style={{ display: editSession ? "none" : "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
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
                      background: isSelected ? "var(--brand-tint)" : "var(--surface-3)",
                      outline: isSelected ? "2.5px solid var(--brand)" : "1.5px solid transparent",
                      textAlign: "left" as const,
                      transition: "all 0.15s ease",
                    }}
                  >
                    {/* Radio indicator */}
                    <div style={{
                      width: 22, height: 22, borderRadius: 11, flexShrink: 0, marginTop: 2,
                      background: isSelected ? "var(--brand)" : "var(--surface)",
                      border: isSelected ? "none" : "2px solid var(--border-strong)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {isSelected && (
                        <div style={{ width: 8, height: 8, borderRadius: 4, background: "var(--surface)" }} />
                      )}
                    </div>

                    {/* Plan info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{plan.name}</span>
                        {plan.recommended && (
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10,
                            background: "var(--brand)", color: "#fff", letterSpacing: "0.02em",
                          }}>おすすめ</span>
                        )}
                      </div>
                      <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>{plan.description}</div>
                      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4 }}>
                        {plan.features.map(f => (
                          <span key={f} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 8, background: isSelected ? "var(--brand-tint-border)" : "var(--surface-muted)", color: isSelected ? "var(--brand-dark)" : "var(--text-muted)" }}>
                            ✓ {f}
                          </span>
                        ))}
                        {plan.missing.map(m => (
                          <span key={m} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 8, background: "var(--surface-3)", color: "var(--border-strong)", textDecoration: "line-through" }}>
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Price */}
                    <div style={{ flexShrink: 0, textAlign: "right" as const }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: isSelected ? "var(--brand)" : "var(--text)", letterSpacing: "-0.02em" }}>{plan.priceLabel}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>税込</div>
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
                  background: "var(--surface)",
                  border: "2px solid var(--brand)",
                  color: "var(--brand)",
                  padding: "12px 28px",
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                サンプルをもう一度見る
              </button>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
                スタンダードプランで生成される内容のサンプルです
              </p>
            </div>
            {/* Missing items warning */}
            {missing.length > 0 && (
              <div style={{ padding: "14px 18px", borderRadius: 14, marginBottom: 20, background: "var(--warn-bg)", border: "1px solid var(--warn-border)" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--warn-text)", marginBottom: 8 }}>不足している項目</div>
                <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
                  {missing.map(m => <span key={m} style={{ fontSize: 12, padding: "3px 10px", borderRadius: 20, background: "var(--warn-bg)", color: "var(--warn-text-strong)" }}>{m}</span>)}
                </div>
              </div>
            )}

            {/* Summary */}
            <div style={{ padding: 20, borderRadius: 14, background: "var(--surface-3)", fontSize: 14, lineHeight: 2.2, marginBottom: 24 }}>
              <div><span style={{ color: "var(--text-muted)", display: "inline-block", width: 100 }}>計画の種類</span>{isConstruction ? "工事中の消防計画" : "消防計画"}</div>
              <div><span style={{ color: "var(--text-muted)", display: "inline-block", width: 100 }}>所轄</span>{deptName || "—"}</div>
              <div><span style={{ color: "var(--text-muted)", display: "inline-block", width: 100 }}>建物</span>{form.building_name || "—"}</div>
              {isConstruction && <div><span style={{ color: "var(--text-muted)", display: "inline-block", width: 100 }}>工事</span>{[form.construction_type, [form.construction_start, form.construction_end].filter(Boolean).join("〜")].filter(Boolean).join(" / ") || "—"}</div>}
              <div><span style={{ color: "var(--text-muted)", display: "inline-block", width: 100 }}>規模</span>{form.total_area || "—"}㎡ / {form.num_floors || "—"}階 / {form.capacity || "—"}人</div>
              <div><span style={{ color: "var(--text-muted)", display: "inline-block", width: 100 }}>管理権原者</span>{form.owner_name || "—"}</div>
              <div><span style={{ color: "var(--text-muted)", display: "inline-block", width: 100 }}>防火管理者</span>{form.manager_name || "—"}（{form.manager_qual}）</div>
              <div><span style={{ color: "var(--text-muted)", display: "inline-block", width: 100 }}>設備</span>{form.equipment.join("、") || "—"}</div>
            </div>

            {/* 決済エラー（alert の置き換え・スクリーンリーダーに通知） */}
            {genError && (
              <div role="alert" style={{ padding: "12px 16px", borderRadius: 12, marginBottom: 14, background: "var(--err-bg)", border: "1px solid var(--err-border)", color: "var(--err-text)", fontSize: 14, lineHeight: 1.7 }}>
                {genError}
              </div>
            )}

            {/* CTA button */}
            {editSession ? (
              <>
                <button onClick={handleSaveAndDownload} disabled={completeness < 100 || editLoading || !editable} aria-busy={editLoading} style={{
                  width: "100%", padding: 16, borderRadius: 14, border: "none", fontSize: 17, fontWeight: 600,
                  cursor: completeness === 100 && !editLoading && editable ? "pointer" : "not-allowed",
                  background: completeness === 100 && !editLoading && editable ? "var(--brand)" : "var(--border-strong)", color: "#fff",
                }}>
                  {editLoading ? (<><span className="spinner" aria-hidden="true" />保存して再生成中...</>) : "修正版を保存してダウンロード"}
                </button>
                <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", marginTop: 10 }}>
                  {editable ? "追加料金はかかりません。修正内容で計画書を再生成します。" : "編集可能期間を過ぎているため保存できません。お手数ですがお問い合わせください。"}
                </p>
              </>
            ) : (
              <>
                <button onClick={handleGenerate} disabled={completeness < 100 || loading} aria-busy={loading} style={{
                  width: "100%", padding: 16, borderRadius: 14, border: "none", fontSize: 17, fontWeight: 600,
                  cursor: completeness === 100 && !loading ? "pointer" : "not-allowed",
                  background: completeness === 100 && !loading ? "var(--brand)" : "var(--border-strong)", color: "#fff",
                }}>
                  {loading ? (<><span className="spinner" aria-hidden="true" />決済画面に移動中...</>) : `${currentPlan.priceLabel} で生成する`}
                </button>
                {completeness < 100 && <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", marginTop: 10 }}>すべての必須項目を入力すると生成できます</p>}

                {/* Trust badges */}
                <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 16, fontSize: 12, color: "var(--text-muted)" }}>
                  <span>SSL暗号化通信</span>
                  <span>Stripe安全決済</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {stepError && (
        <div role="alert" style={{ marginTop: 14, padding: "12px 16px", borderRadius: 12, background: "var(--warn-bg)", border: "1px solid var(--warn-border)", color: "var(--warn-text)", fontSize: 13, lineHeight: 1.7 }}>
          {stepError}
        </div>
      )}
      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        {step > 0 && <button onClick={() => setStep(step - 1)} style={{ flex: 1, padding: 14, borderRadius: 14, border: "none", cursor: "pointer", background: "var(--surface-muted)", color: "var(--text)", fontSize: 15, fontWeight: 600 }}>← 戻る</button>}
        {step < STEPS.length - 1 && <button onClick={goNext} style={{ flex: 2, padding: 14, borderRadius: 14, border: "none", cursor: "pointer", background: "var(--brand)", color: "#fff", fontSize: 15, fontWeight: 600 }}>次へ →</button>}
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
              background: "var(--surface)",
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
              borderBottom: "1px solid var(--border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>
                  消防計画サンプル
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  京都市・飲食店320㎡(架空事業者)
                </div>
              </div>
              <button
                onClick={() => setShowSample(false)}
                style={{
                  background: "var(--surface-3)",
                  border: "none",
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  fontSize: 16,
                  cursor: "pointer",
                  color: "var(--text)",
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
          color: "var(--text)",
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
              style={{
                borderBottom: "1px solid var(--border)",
                padding: "20px 0",
              }}
            >
              <button
                type="button"
                onClick={() => setFaqOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  textAlign: "left",
                  color: "inherit",
                  font: "inherit",
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
                      color: "var(--brand)",
                      flexShrink: 0,
                    }}
                  >
                    Q.
                  </span>
                  <span
                    style={{
                      fontSize: "clamp(14px, 3.5vw, 16px)",
                      fontWeight: 700,
                      color: "var(--text)",
                    }}
                  >
                    {item.q}
                  </span>
                </div>
                <span
                  aria-hidden="true"
                  style={{
                    fontSize: 24,
                    color: "var(--text-muted)",
                    flexShrink: 0,
                    lineHeight: 1,
                  }}
                >
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen && (
                <div
                  id={`faq-panel-${i}`}
                  role="region"
                  style={{
                    marginTop: 16,
                    padding: "clamp(14px, 4vw, 20px)",
                    background: "var(--brand-tint)",
                    borderRadius: 8,
                    display: "flex",
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      fontWeight: 900,
                      color: "var(--text)",
                      flexShrink: 0,
                    }}
                  >
                    A.
                  </span>
                  <div
                    style={{
                      fontSize: "clamp(13px, 3.5vw, 15px)",
                      lineHeight: 1.8,
                      color: "var(--text)",
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

    {/* 区切りCTA（FAQのあと） */}
    <div style={{ textAlign: "center", padding: "48px 20px 0" }}>
      <a href="#form" style={{ display: "inline-block", background: "var(--brand)", color: "#fff", padding: "16px 40px", borderRadius: 12, fontSize: 16, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 14px rgba(46,95,158,0.25)" }}>
        準備ができたら、作成をはじめる →
      </a>
    </div>

    {/* Plan comparison CTA */}
    <section style={{ maxWidth: 720, margin: "0 auto", padding: "64px 20px 0" }}>
      <div style={{
        background: "linear-gradient(135deg, var(--brand-gradient) 0%, var(--surface) 100%)",
        border: "1px solid var(--brand-tint)",
        borderRadius: 20, padding: "40px 32px", textAlign: "center",
      }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
          プランをじっくり比較したい方へ
        </h2>
        <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 24 }}>
          ライト・スタンダード・プレミアムの違いを一覧でご確認いただけます。料金は1件ごとの都度払い（買い切り）です。
        </p>
        <a
          href="/pricing"
          style={{
            display: "inline-block", padding: "14px 36px", borderRadius: 12,
            background: "var(--brand)", color: "#fff", fontSize: 15, fontWeight: 600,
            textDecoration: "none",
          }}
        >
          プランを比較する
        </a>
      </div>
    </section>

    {/* 更新情報（note.com マガジン連携） — ページ下部 */}
    <NoteUpdates />
    <TodokedeSeriesNav source="plan" currentId="shobo-keikaku" />
    </>
  );
}
