export default function Footer() {
  return (
    <footer style={{ marginTop: 96, borderTop: "1px solid #e5e5e5", background: "#fff", padding: "40px 24px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", textAlign: "center", fontSize: 12, color: "#666" }}>
        <p style={{ margin: "0 0 8px", fontWeight: 700, color: "#1a1a1a" }}>MeHer株式会社</p>
        <p style={{ margin: 0 }}>元消防士が監修する消防の届出代行サービス</p>
        <p style={{ marginTop: 16 }}>
          <a href="https://todokede.jp" style={{ color: "#666", textDecoration: "none" }}>トドケデ本体</a>
          {" ・ "}
          <a href="/" style={{ color: "#666", textDecoration: "none" }}>トドケデ消防計画</a>
        </p>
        <p style={{ marginTop: 16 }}>© {new Date().getFullYear()} MeHer Inc.</p>
      </div>
    </footer>
  );
}