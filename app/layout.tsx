import "./globals.css";
import { Noto_Sans_JP } from "next/font/google";
import Script from "next/script";
import { FunnelPageView } from "../components/funnel-page-view";
import { FUNNEL_MEASUREMENT_ID } from "../lib/analytics-schema";
import { SiteHeader, SiteFooter } from "../components/lp/SiteChrome";
import { SiteStructuredData } from "../components/StructuredData";

const noto = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

export const metadata = {
  title: "トドケデ消防計画 ｜ 元消防士が作った消防計画自動作成サービス",
  description:
    "元消防士が設計。所在地と建物情報を入力するだけで、所轄消防本部の様式に準拠した消防計画書をWord形式で自動生成します。",
  openGraph: {
    title: "トドケデ消防計画 ｜ 元消防士が作った消防計画自動作成サービス",
    description:
      "所在地と建物情報を入力するだけで、所轄消防本部の様式に準拠した消防計画書をWordで自動生成。1件¥4,980〜の買い切り。",
    url: "https://plan.todokede.jp/",
    siteName: "トドケデ消防計画",
    images: ["https://plan.todokede.jp/og-image.png"],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "トドケデ消防計画 ｜ 元消防士が作った消防計画自動作成サービス",
    description:
      "所在地と建物情報を入力するだけで、所轄消防本部の様式に準拠した消防計画書をWordで自動生成。1件¥4,980〜の買い切り。",
    images: ["https://plan.todokede.jp/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={noto.className} suppressHydrationWarning>
      <body style={{ background: "var(--bg)", color: "var(--text)", margin: 0 }}>
        {/* 構造化データ（schema.org JSON-LD）: 組織・製品情報 */}
        <SiteStructuredData />
        {/* テーマ適用（描画前に data-theme を設定し FOUC を防ぐ） */}
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem('todokede-theme');document.documentElement.setAttribute('data-theme',t==='dark'?'dark':'light');}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`}
        </Script>
        {/* Google tag (gtag.js) - Google Ads & GA4 共通 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18069681696"
          strategy="afterInteractive"
        />
        <Script id="google-tag-init" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            var safeUrl = new URL(location.href);
            var query = new URLSearchParams();
            for (var key of ['utm_source','utm_medium','utm_campaign','utm_id','utm_term','utm_content','gclid','gbraid','wbraid']) {
              var value = safeUrl.searchParams.get(key) || '';
              var isClick = ['gclid','gbraid','wbraid'].includes(key);
              if (isClick ? /^[a-zA-Z0-9_-]{1,200}$/.test(value) : /^[a-zA-Z0-9_.~-]{1,100}$/.test(value) && !/[0-9]{7,}/.test(value)) query.set(key, value);
            }
            safeUrl.search = query.toString(); safeUrl.hash = '';
            var safeRef = '';
            try { safeRef = document.referrer ? new URL(document.referrer).origin : ''; } catch (_) {}
            gtag('set', { page_location: safeUrl.href, page_referrer: safeRef });
            gtag('config', 'AW-18069681696');
            gtag('config', 'G-7611WP9PEY', { send_page_view: false });
            // NEXT_PUBLIC_GA_ID はマーケ統合プロパティ(G-TF01DPKTPQ)。
            // 既存 G-7611WP9PEY(運用分析)と並列 config 方式で並存。
            ${[...new Set([process.env.NEXT_PUBLIC_GA_ID, FUNNEL_MEASUREMENT_ID])].filter(id => id && id !== 'G-7611WP9PEY' && /^G-[A-Z0-9]+$/.test(id)).map(id => `gtag('config', '${id}', { send_page_view: false });`).join('\n')}
          `}
        </Script>

        <FunnelPageView />
        <a href="#main-content" className="skip-link">本文へスキップ</a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
        {/* トドケデAI相談員（共通ウィジェット） */}
        <Script
          src="https://chat.todokede.jp/widget.js"
          data-service="plan"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}