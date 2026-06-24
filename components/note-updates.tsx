"use client";

import { useEffect, useState } from "react";

const BRAND = "#2E5F9E";

// 「もっと見る」リンク先（著者の note。全記事が見られる）。
const MAGAZINE_URL = "https://note.com/shun_maruoka";

interface NoteItem {
  title: string;
  link: string;
  iso: string;
  date: string;
}

/**
 * note.com マガジン「消防計画づくりの実務ノート」の最新記事を
 * LP の更新情報セクションとして表示する。/api/note-feed から取得する。
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

  // 取得中・記事ゼロのときはセクションごと非表示（LPを崩さない）。
  if (!items || items.length === 0) return null;

  return (
    <section style={{ maxWidth: 1080, margin: "0 auto", padding: "clamp(40px,7vw,72px) clamp(16px,4vw,24px)" }}>
      <div style={{ background: "#EEF4FA", border: "1px solid #DCE8F5", borderRadius: 16, padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: BRAND, letterSpacing: "0.04em" }}>note更新情報</span>
          <span style={{ fontSize: 12, color: "#6e6e73" }}>消防計画づくりの実務ノート</span>
          <span style={{ flex: 1, height: 1, background: "#DCE8F5" }} />
        </div>

        <ul style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {items.map((it, i) => (
            <li key={it.link}>
              <a
                href={it.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "baseline",
                  flexWrap: "wrap",
                  textDecoration: "none",
                  padding: "10px 0",
                  borderTop: i === 0 ? "none" : "1px solid #DCE8F5",
                }}
              >
                <time style={{ fontSize: 13, color: "#6e6e73", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                  {it.date}
                </time>
                {i === 0 && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", background: BRAND, borderRadius: 999, padding: "2px 10px", whiteSpace: "nowrap" }}>
                    NEW
                  </span>
                )}
                <span style={{ flex: 1, minWidth: 220, fontSize: 15, fontWeight: 600, color: "#1d1d1f", lineHeight: 1.6 }}>
                  {it.title}
                </span>
                <span style={{ fontSize: 13, color: BRAND, fontWeight: 600, whiteSpace: "nowrap" }}>note で読む →</span>
              </a>
            </li>
          ))}
        </ul>

        <div style={{ marginTop: 12, textAlign: "right" }}>
          <a
            href={MAGAZINE_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 13, fontWeight: 600, color: BRAND, textDecoration: "underline" }}
          >
            実務ノートをもっと見る
          </a>
        </div>
      </div>
    </section>
  );
}
