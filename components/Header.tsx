export default function Header() {
  return (
    <header style={{ borderBottom: "1px solid #e5e5e5", background: "#fff" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px" }}>
        <a href="/" style={{ display: "flex", flexDirection: "column", textDecoration: "none" }}>
          <span style={{ fontSize: 10, color: "#666", letterSpacing: "0.02em" }}>【元消防士が監修】</span>
          <span style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 24, fontWeight: 900, color: "#E8332A", lineHeight: 1, letterSpacing: "0.05em" }}>トドケデ</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>消防計画</span>
          </span>
        </a>
        <nav style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <a href="/pricing" style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", textDecoration: "none" }}>料金</a>
          <a href="/mypage" style={{ fontSize: 13, fontWeight: 600, color: "#E8332A", textDecoration: "none" }}>マイページ</a>
        </nav>
      </div>
    </header>
  );
}
