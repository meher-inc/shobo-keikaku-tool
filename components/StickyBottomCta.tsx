"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * 画面下部に追従する常時CTAバー（バクラク型）。
 * 初回訪問者がどのスクロール位置からでも「消防計画を作成」へ進めるようにする。
 * - ヒーローを過ぎたら表示、フォーム(#form)が視界に入る／最下部では非表示（重複回避）。
 * - トップページ内は scrollIntoView でフォームへ確実にスクロール。他ページからは /#form へ遷移。
 * - 表示中は body に .bottom-cta-visible を付与し、AI相談FABをバーの上へ退避させる。
 */
export default function StickyBottomCta() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const update = () => {
      const scrolledPastHero = window.scrollY > 480;
      const doc = document.documentElement;
      const nearBottom = window.innerHeight + window.scrollY > doc.scrollHeight - 140;

      let formInView = false;
      const form = document.getElementById("form");
      if (form) {
        const r = form.getBoundingClientRect();
        formInView = r.top < window.innerHeight * 0.9 && r.bottom > 0;
      }
      setShow(scrolledPastHero && !formInView && !nearBottom);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("bottom-cta-visible", show);
    // AI相談FAB（外部ウィジェット #tdkd-fab）をバーの上へ退避（inline!importantで確実に）。
    const fab = document.getElementById("tdkd-fab");
    if (fab) {
      fab.style.setProperty("transition", "bottom 0.28s ease");
      fab.style.setProperty("bottom", show ? "84px" : "20px", "important");
    }
    return () => document.body.classList.remove("bottom-cta-visible");
  }, [show]);

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
    <div className={`sticky-bottom-cta${show ? " is-visible" : ""}`} aria-hidden={!show}>
      <div className="sticky-bottom-cta__inner">
        <span className="sticky-bottom-cta__msg">
          所在地を入力するだけ。所轄の様式に沿った消防計画を作成できます。
        </span>
        <a href="/#form" onClick={handleClick} className="sticky-bottom-cta__btn">
          消防計画を作成する →
        </a>
      </div>
    </div>
  );
}
