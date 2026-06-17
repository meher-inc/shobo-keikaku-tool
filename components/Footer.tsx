const BRAND = "#2E5F9E";

// トドケデシリーズ（url のあるものは提供中、ない（準備中）ものは順次提供予定）。
// 正式ラインナップは todokede-shobo/app/components/site-footer.tsx と一致させる。
const series: { name: string; url?: string; current?: boolean }[] = [
  { name: "トドケデ消防計画", url: "/", current: true },
  { name: "トドケデ消防書類作成", url: "https://docs.todokede.jp" },
  { name: "トドケデ消防書類代行" },
  { name: "トドケデ介護", url: "https://care.todokede.jp" },
  { name: "トドケデ更新管理" },
  { name: "トドケデ防火管理" },
  { name: "トドケデ訓練支援" },
  { name: "トドケデ消防設備点検" },
  { name: "トドケデ危険物" },
  { name: "トドケデBCP" },
];

export default function Footer() {
  return (
    <footer style={{ marginTop: 96, borderTop: "1px solid #e5e5e5", background: "#fff", padding: "48px 24px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", textAlign: "center", fontSize: 12, color: "#666" }}>
        <p style={{ margin: "0 0 8px", fontWeight: 700, color: "#1a1a1a" }}>MeHer株式会社</p>
        <p style={{ margin: 0 }}>元消防士が監修する消防計画作成クラウドサービス</p>

        {/* トドケデシリーズ ラインナップ */}
        <div style={{ marginTop: 36, paddingTop: 28, borderTop: "1px solid #eee" }}>
          <p style={{ margin: "0 0 16px", fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", color: "#86868b" }}>
            トドケデシリーズ
          </p>
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "10px 14px",
            }}
          >
            {series.map((s) => {
              const external = s.url?.startsWith("http");
              return (
                <li key={s.name} style={{ fontSize: 13 }}>
                  {s.url ? (
                    <a
                      href={s.url}
                      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      style={{
                        color: s.current ? BRAND : "#1d1d1f",
                        fontWeight: s.current ? 700 : 500,
                        textDecoration: "none",
                      }}
                    >
                      {s.name}
                      {s.current && (
                        <span style={{ marginLeft: 5, fontSize: 10, fontWeight: 700, color: BRAND }}>（このサイト）</span>
                      )}
                    </a>
                  ) : (
                    <span style={{ color: "#b0b0b5", fontWeight: 500 }}>
                      {s.name}
                      <span style={{ marginLeft: 5, fontSize: 10, color: "#c4c4c9" }}>準備中</span>
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
          <p style={{ marginTop: 18 }}>
            <a href="https://todokede.jp" target="_blank" rel="noopener noreferrer" style={{ color: "#666", textDecoration: "none" }}>
              トドケデ（ブランドサイト）→
            </a>
          </p>
        </div>

        <p style={{ marginTop: 32, fontSize: 11 }}>
          <a href="/mypage" style={{ color: "#666", textDecoration: "none" }}>マイページ</a>
          {" ・ "}
          <a href="/legal/tokusho" style={{ color: "#666", textDecoration: "none" }}>特定商取引法に基づく表記</a>
          {" ・ "}
          <a href="/legal/privacy" style={{ color: "#666", textDecoration: "none" }}>プライバシーポリシー</a>
          {" ・ "}
          <a href="/legal/terms" style={{ color: "#666", textDecoration: "none" }}>利用規約</a>
        </p>
        <p style={{ marginTop: 16 }}>© {new Date().getFullYear()} MeHer Inc.</p>
      </div>
    </footer>
  );
}
