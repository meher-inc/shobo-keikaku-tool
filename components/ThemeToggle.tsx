"use client";

import { useEffect, useState } from "react";

// ライト/ダーク切替（data-theme を <html> に設定し localStorage に保存）。
export default function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    // 初期状態は <html data-theme> から読む（FOUC防止スクリプトが設定済み）。
    setDark(document.documentElement.getAttribute("data-theme") === "dark");
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    try {
      localStorage.setItem("todokede-theme", next ? "dark" : "light");
    } catch {
      /* noop */
    }
  }

  // マウント前はラベルが定まらないため、アイコンのみで描画（レイアウトは固定）。
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "ライトモードに切り替え" : "ダークモードに切り替え"}
      title={dark ? "ライトモードに切り替え" : "ダークモードに切り替え"}
      style={{
        marginLeft: "auto",
        width: 36,
        height: 36,
        borderRadius: 999,
        border: "1px solid var(--border)",
        background: "var(--surface)",
        color: "var(--text-muted)",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {dark ? (
        // 太陽（ライトへ）
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
        </svg>
      ) : (
        // 月（ダークへ）
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  );
}
