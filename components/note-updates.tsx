"use client";

import { useEffect, useState } from "react";

const BRAND = "var(--brand)";

// 「全記事を見る」リンク先のマガジン（消防計画づくりの実務ノート）。
const MAGAZINE_URL = "https://note.com/shun_maruoka/m/m9f1348968657";

interface NoteItem {
  title: string;
  link: string;
  iso: string;
  date: string;
  thumbnail?: string;
}

const sectionStyle: React.CSSProperties = {
  maxWidth: 1080,
  margin: "0 auto",
  padding: "clamp(48px,8vw,88px) clamp(16px,4vw,24px)",
};
const headingStyle: React.CSSProperties = {
  fontSize: "clamp(22px,4.5vw,30px)",
  fontWeight: 800,
  textAlign: "center",
  color: "var(--text)",
  letterSpacing: "-0.01em",
};
const subtitleStyle: React.CSSProperties = {
  textAlign: "center",
  fontSize: 15,
  color: "var(--text-muted)",
  marginTop: 12,
};
const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
  gap: 20,
  marginTop: 40,
};
const thumbWrapStyle: React.CSSProperties = {
  aspectRatio: "16 / 10",
  background: "var(--surface-3)",
  overflow: "hidden",
};
const imgStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};
const titleStyle: React.CSSProperties = {
  fontSize: 15.5,
  fontWeight: 700,
  color: "var(--text)",
  lineHeight: 1.6,
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

/**
 * note.com マガジン「消防計画づくりの実務ノート」の最新記事を
 * サムネイル付きカードグリッドで表示する。/api/note-feed から取得する。
 */
export function NoteUpdates() {
  const [items, setItems] = useState<NoteItem[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/note-feed", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (alive) setItems(Array.isArray(d.items) ? d.items : []);
      })
      .catch(() => {
        if (alive) setItems([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  // 読み込み中はカード型スケルトンを表示（体感速度・レイアウトシフト抑制）。
  if (items === null) {
    return (
      <section style={sectionStyle} aria-hidden="true">
        <h2 style={headingStyle}>記事で学ぶ｜消防計画の実務ガイド</h2>
        <p style={subtitleStyle}>消防計画づくりの実務を、noteで詳しく解説しています。</p>
        <div style={gridStyle}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", background: "var(--surface)" }}>
              <div className="skeleton-line" style={{ aspectRatio: "16 / 10", borderRadius: 0 }} />
              <div style={{ padding: "16px 18px" }}>
                <div className="skeleton-line" style={{ height: 14, marginBottom: 8 }} />
                <div className="skeleton-line" style={{ height: 14, width: "70%" }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // 記事ゼロのときはセクションごと非表示（LPを崩さない）。
  if (items.length === 0) return null;

  const cards = items.slice(0, 6);

  return (
    <section style={sectionStyle}>
      <h2 style={headingStyle}>記事で学ぶ｜消防計画の実務ガイド</h2>
      <p style={subtitleStyle}>消防計画づくりの実務を、noteで詳しく解説しています。</p>

      <div style={gridStyle}>
        {cards.map((it) => (
          <a
            key={it.link}
            href={it.link}
            target="_blank"
            rel="noopener noreferrer"
            className="note-card"
            style={{
              display: "flex",
              flexDirection: "column",
              border: "1px solid var(--border)",
              borderRadius: 16,
              overflow: "hidden",
              background: "var(--surface)",
              textDecoration: "none",
            }}
          >
            <div style={thumbWrapStyle}>
              {it.thumbnail && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={it.thumbnail} alt="" loading="lazy" style={imgStyle} />
              )}
            </div>
            <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
              <span style={titleStyle}>{it.title}</span>
              <span style={{ marginTop: "auto", fontSize: 13.5, color: BRAND, fontWeight: 600 }}>note で読む →</span>
            </div>
          </a>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 36 }}>
        <a
          href={MAGAZINE_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            padding: "14px 32px",
            borderRadius: 12,
            border: `1.5px solid ${BRAND}`,
            color: BRAND,
            fontSize: 15,
            fontWeight: 700,
            textDecoration: "none",
            background: "var(--surface)",
          }}
        >
          noteマガジンで全記事を見る
        </a>
      </div>
    </section>
  );
}
