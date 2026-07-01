"use client";

import { usePathname } from "next/navigation";

/**
 * ヘッダーに常時表示する「作成をはじめる」CTA。
 * どのページ・どのスクロール位置からでも作成フォーム（#form）へ確実に誘導する。
 * - トップページ内では既定のフラグメント遷移に頼らず scrollIntoView で確実にスクロール。
 * - それ以外のページからは /#form へ遷移し、読み込み後にフォームへ移動する。
 */
export default function StartCtaButton() {
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      const form = document.getElementById("form");
      if (form) {
        e.preventDefault();
        form.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", "/#form");
      }
    }
    // トップ以外のページでは href="/#form" のまま遷移させる。
  };

  return (
    <a href="/#form" onClick={handleClick} className="header-cta" style={{ marginLeft: "auto" }}>
      作成をはじめる
    </a>
  );
}
