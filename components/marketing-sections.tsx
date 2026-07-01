import { SPOT_PLANS } from "../lib/spot-plans";
import { NEWLY_ADDED_DEPTS } from "../lib/updates";

const BRAND = "var(--brand)";

const features = [
  {
    title: "所轄消防本部の様式に準拠",
    body: "建物の所在地から所轄を自動判定し、その様式に沿った消防計画をそのまま提出できる形で生成します。",
  },
  {
    title: "入力ガイドつきで迷わない",
    body: "防火管理者・収容人員・設備など、必要項目をステップごとにご案内。専門知識がなくても入力できます。",
  },
  {
    title: "Word出力で提出も編集も自在",
    body: "Word形式（.docx）で出力。建物固有の情報を追記してから印刷・PDF化し、そのまま窓口へ提出いただけます。",
  },
];

const steps = [
  { n: 1, title: "建物情報を入力", body: "所在地・用途・規模・防火管理者・設備などを順に入力します。" },
  { n: 2, title: "プランを選んで決済", body: "ライト／スタンダード／プレミアムから選び、1件ごとの都度払いで決済します。" },
  { n: 3, title: "Wordをダウンロード", body: "決済後ただちに消防計画を生成。Wordでダウンロードしてご提出ください。" },
];

// 「安心して提出できる理由」= 事実に基づく reason to believe（誇張・保証なし）。
const reasons = [
  {
    title: "元消防士が監修",
    body: "消防の実務を知る元消防士が様式と記載内容を監修。現場の目線で「提出に必要な形」に整えています。",
  },
  {
    title: "所轄の様式に自動準拠",
    body: "所在地から所轄消防本部を自動判定し、20本部の最新様式＋標準様式で作成。様式さがしが要りません。",
  },
  {
    title: "元消防士による事前チェック",
    body: "「一発で通したい」方はプレミアムへ。元消防士が内容を確認し、1回の修正まで対応します。",
  },
  {
    title: "購入後も作り直せる",
    body: "作成後の再ダウンロードに対応。購入から14日間は、入力を修正して追加料金なしで作り直せます。",
  },
];

// 他の作り方との比較（アンカリング）。行政書士の費用は一般的な相場【仮説】。
const comparison = [
  {
    name: "行政書士に依頼",
    highlight: false,
    rows: [["費用", "数万円〜※相場"], ["所要時間", "数日〜数週間"], ["様式さがし", "任せられる"], ["専門知識", "不要"]],
  },
  {
    name: "自分でゼロから作成",
    highlight: false,
    rows: [["費用", "0円"], ["所要時間", "数日"], ["様式さがし", "自分で探す"], ["専門知識", "必要"]],
  },
  {
    name: "トドケデ消防計画",
    highlight: true,
    rows: [["費用", "¥4,980〜 買い切り"], ["所要時間", "約15分"], ["様式さがし", "所轄を自動判定"], ["専門知識", "入力ガイドで不要"]],
  },
];

const supportedDepts = [
  "東京消防庁",
  "大阪市消防局",
  "堺市消防局",
  "岡山市消防局",
  "横浜市消防局",
  "名古屋市消防局",
  "京都市消防局",
  "福岡市消防局",
  "札幌市消防局",
  "川崎市消防局",
  "神戸市消防局",
  "さいたま市消防局",
  "広島市消防局",
  "仙台市消防局",
  "千葉市消防局",
  "北九州市消防局",
  "新潟市消防局",
  "熊本市消防局",
  "相模原市消防局",
  "静岡市消防局",
];

function formatPrice(n: number): string {
  return `¥${n.toLocaleString("ja-JP")}`;
}

export function MarketingSections() {
  return (
    <div>
      {/* 安心して提出できる理由（reason to believe） */}
      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "clamp(40px,7vw,72px) clamp(16px,4vw,24px) clamp(8px,2vw,16px)" }}>
        <h2 style={sectionHeading}>はじめてでも、安心して提出できる理由</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16, marginTop: 40 }}>
          {reasons.map((r) => (
            <div key={r.title} style={{ ...card, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span aria-hidden="true" style={{ width: 30, height: 30, flexShrink: 0, borderRadius: 8, background: "var(--brand-tint)", color: BRAND, fontWeight: 800, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</span>
                <h3 style={{ fontSize: 15.5, fontWeight: 700, color: "var(--text)", lineHeight: 1.4 }}>{r.title}</h3>
              </div>
              <p style={{ fontSize: 13.5, lineHeight: 1.8, color: "var(--text-muted)" }}>{r.body}</p>
            </div>
          ))}
        </div>
        <p style={{ textAlign: "center", fontSize: 14, marginTop: 24 }}>
          <a href="/shobo-keikaku-no-kakikata" style={{ color: BRAND, fontWeight: 600, textDecoration: "underline" }}>
            はじめての方へ：消防計画の書き方をわかりやすく解説 →
          </a>
        </p>
      </section>

      {/* 特長 */}
      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "clamp(48px,8vw,88px) clamp(16px,4vw,24px)" }}>
        <h2 style={sectionHeading}>入力するだけで、提出できる計画書に</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20, marginTop: 40 }}>
          {features.map((f) => (
            <div key={f.title} style={card}>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: "var(--text)" }}>{f.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--text-muted)" }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ご利用の流れ */}
      <section style={{ background: "var(--surface-2)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "clamp(48px,8vw,88px) clamp(16px,4vw,24px)" }}>
          <h2 style={sectionHeading}>ご利用の流れ</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20, marginTop: 40 }}>
            {steps.map((s) => (
              <div key={s.n} style={{ ...card, background: "var(--surface)" }}>
                <div style={{ width: 36, height: 36, borderRadius: 18, background: BRAND, color: "#fff", fontWeight: 800, fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  {s.n}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "var(--text)" }}>{s.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--text-muted)" }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 対応エリア（政令市訴求） */}
      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "clamp(48px,8vw,88px) clamp(16px,4vw,24px)" }}>
        <h2 style={sectionHeading}>対応している消防本部</h2>
        <p style={{ textAlign: "center", fontSize: 15, color: "var(--text-muted)", marginTop: 12 }}>
          2026年6月、政令指定都市の対応を拡大し、計{supportedDepts.length}本部に対応しました。対応エリア外は標準様式で出力されます。
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12, marginTop: 32 }}>
          {supportedDepts.map((d) => {
            const isNew = NEWLY_ADDED_DEPTS.has(d);
            return (
              <span
                key={d}
                style={{
                  position: "relative",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--text)",
                  background: "var(--brand-tint)",
                  borderRadius: 999,
                  padding: "10px 20px",
                  outline: isNew ? `1.5px solid ${BRAND}` : "none",
                }}
              >
                {d}
                {isNew && (
                  <span style={{ position: "absolute", top: -8, right: -6, fontSize: 9, fontWeight: 800, color: "#fff", background: BRAND, borderRadius: 999, padding: "1px 6px", letterSpacing: "0.04em" }}>
                    NEW
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </section>

      {/* 他の作り方との比較（価格・時間アンカリング） */}
      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "clamp(48px,8vw,88px) clamp(16px,4vw,24px)" }}>
        <h2 style={sectionHeading}>他の作り方と、比べてみてください</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16, marginTop: 40 }}>
          {comparison.map((c) => (
            <div
              key={c.name}
              style={{
                ...card,
                position: "relative",
                background: c.highlight ? "var(--brand-tint)" : "var(--surface)",
                outline: c.highlight ? `2px solid ${BRAND}` : "1px solid var(--surface-muted)",
              }}
            >
              {c.highlight && (
                <span style={{ position: "absolute", top: -12, left: 20, background: BRAND, color: "#fff", fontSize: 12, fontWeight: 700, padding: "3px 12px", borderRadius: 999 }}>
                  いちばん手軽
                </span>
              )}
              <h3 style={{ fontSize: 16, fontWeight: 700, color: c.highlight ? BRAND : "var(--text)", marginBottom: 14 }}>{c.name}</h3>
              <dl style={{ display: "flex", flexDirection: "column", gap: 10, margin: 0 }}>
                {c.rows.map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline", borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                    <dt style={{ fontSize: 12.5, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{k}</dt>
                    <dd style={{ margin: 0, fontSize: 14, fontWeight: c.highlight ? 700 : 600, color: "var(--text)", textAlign: "right" }}>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
        <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-faint)", marginTop: 20 }}>
          ※金額・時間は一般的な目安です。行政書士へ依頼した場合の費用は依頼先により異なります。
        </p>
      </section>

      {/* 料金（スポット3プラン要約） */}
      <section style={{ background: "var(--surface-2)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "clamp(48px,8vw,88px) clamp(16px,4vw,24px)" }}>
          <h2 style={sectionHeading}>料金</h2>
          <p style={{ textAlign: "center", fontSize: 15, color: "var(--text-muted)", marginTop: 12 }}>
            1件ごとの都度払い（買い切り）。月額料金・更新料はかかりません。
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20, marginTop: 40 }}>
            {SPOT_PLANS.map((p) => (
              <div
                key={p.id}
                style={{
                  ...card,
                  background: "var(--surface)",
                  position: "relative",
                  outline: p.recommended ? `2px solid ${BRAND}` : "1px solid var(--surface-muted)",
                }}
              >
                {p.recommended && (
                  <span style={{ position: "absolute", top: -12, left: 20, background: BRAND, color: "#fff", fontSize: 12, fontWeight: 700, padding: "3px 12px", borderRadius: 999 }}>
                    おすすめ
                  </span>
                )}
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--text)" }}>{p.name}</h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4, marginBottom: 14 }}>{p.description}</p>
                <div style={{ fontSize: 28, fontWeight: 800, color: p.recommended ? BRAND : "var(--text)", letterSpacing: "-0.02em" }}>
                  {formatPrice(p.price)}
                  <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-muted)" }}> /件（税込）</span>
                </div>
                <ul style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                  {p.features.map((f) => (
                    <li key={f} style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", gap: 8 }}>
                      <span style={{ color: BRAND, fontWeight: 700 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <a href="/pricing" style={{ fontSize: 14, fontWeight: 600, color: BRAND, textDecoration: "underline" }}>
              プランの詳しい比較を見る
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

const sectionHeading: React.CSSProperties = {
  fontSize: "clamp(22px,4.5vw,30px)",
  fontWeight: 800,
  textAlign: "center",
  color: "var(--text)",
  letterSpacing: "-0.01em",
};

const card: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--surface-muted)",
  borderRadius: 16,
  padding: "24px 22px",
};
