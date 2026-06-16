import { SPOT_PLANS } from "../lib/spot-plans";

const BRAND = "#2E5F9E";

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

const supportedDepts = [
  "東京消防庁",
  "大阪市消防局",
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
];

function formatPrice(n: number): string {
  return `¥${n.toLocaleString("ja-JP")}`;
}

export function MarketingSections() {
  return (
    <div>
      {/* 特長 */}
      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "clamp(48px,8vw,88px) clamp(16px,4vw,24px)" }}>
        <h2 style={sectionHeading}>入力するだけで、提出できる計画書に</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20, marginTop: 40 }}>
          {features.map((f) => (
            <div key={f.title} style={card}>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: "#1d1d1f" }}>{f.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.8, color: "#6e6e73" }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ご利用の流れ */}
      <section style={{ background: "#f9f9fb" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "clamp(48px,8vw,88px) clamp(16px,4vw,24px)" }}>
          <h2 style={sectionHeading}>ご利用の流れ</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20, marginTop: 40 }}>
            {steps.map((s) => (
              <div key={s.n} style={{ ...card, background: "#fff" }}>
                <div style={{ width: 36, height: 36, borderRadius: 18, background: BRAND, color: "#fff", fontWeight: 800, fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  {s.n}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "#1d1d1f" }}>{s.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: "#6e6e73" }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 対応エリア（政令市訴求） */}
      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "clamp(48px,8vw,88px) clamp(16px,4vw,24px)" }}>
        <h2 style={sectionHeading}>対応している消防本部</h2>
        <p style={{ textAlign: "center", fontSize: 15, color: "#6e6e73", marginTop: 12 }}>
          政令指定都市の様式に順次対応しています。対応エリア外は標準様式で出力されます。
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12, marginTop: 32 }}>
          {supportedDepts.map((d) => (
            <span key={d} style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f", background: "#EEF4FA", borderRadius: 999, padding: "10px 20px" }}>
              {d}
            </span>
          ))}
        </div>
      </section>

      {/* 料金（スポット3プラン要約） */}
      <section style={{ background: "#f9f9fb" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "clamp(48px,8vw,88px) clamp(16px,4vw,24px)" }}>
          <h2 style={sectionHeading}>料金</h2>
          <p style={{ textAlign: "center", fontSize: 15, color: "#6e6e73", marginTop: 12 }}>
            1件ごとの都度払い（買い切り）。月額料金・更新料はかかりません。
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20, marginTop: 40 }}>
            {SPOT_PLANS.map((p) => (
              <div
                key={p.id}
                style={{
                  ...card,
                  background: "#fff",
                  position: "relative",
                  outline: p.recommended ? `2px solid ${BRAND}` : "1px solid #e8e8ed",
                }}
              >
                {p.recommended && (
                  <span style={{ position: "absolute", top: -12, left: 20, background: BRAND, color: "#fff", fontSize: 12, fontWeight: 700, padding: "3px 12px", borderRadius: 999 }}>
                    おすすめ
                  </span>
                )}
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1d1d1f" }}>{p.name}</h3>
                <p style={{ fontSize: 13, color: "#86868b", marginTop: 4, marginBottom: 14 }}>{p.description}</p>
                <div style={{ fontSize: 28, fontWeight: 800, color: p.recommended ? BRAND : "#1d1d1f", letterSpacing: "-0.02em" }}>
                  {formatPrice(p.price)}
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#86868b" }}> /件（税込）</span>
                </div>
                <ul style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                  {p.features.map((f) => (
                    <li key={f} style={{ fontSize: 13, color: "#6e6e73", display: "flex", gap: 8 }}>
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
  color: "#1a1a1a",
  letterSpacing: "-0.01em",
};

const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e8e8ed",
  borderRadius: 16,
  padding: "24px 22px",
};
