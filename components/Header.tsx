export default function Header() {
  return (
    <header style={{ borderBottom: "1px solid #e5e5e5", background: "rgba(255,255,255,0.9)", backdropFilter: "saturate(180%) blur(8px)", WebkitBackdropFilter: "saturate(180%) blur(8px)", position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", alignItems: "center", gap: 12, padding: "12px 24px" }}>
        <a href="/" aria-label="トドケデ消防計画" style={{ display: "inline-block", lineHeight: 0, textDecoration: "none" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-todokede.svg"
            alt="トドケデ消防計画"
            width={176}
            height={44}
            style={{ height: 44, width: 176, maxWidth: "none", display: "block" }}
          />
        </a>
        <span style={{ fontSize: 11, color: "#6e6e73", letterSpacing: "0.02em" }}>
          元消防士が監修
        </span>
      </div>
    </header>
  );
}
