import "./globals.css";
import { Noto_Sans_JP } from "next/font/google";
import Script from "next/script";
import Header from "../components/Header";
import Footer from "../components/Footer";

const noto = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

export const metadata = {
  title: "トドケデ消防計画 ｜ 元消防士が作った消防計画自動作成サービス",
  description:
    "元消防士が監修。所在地と建物情報を入力するだけで、所轄消防本部の様式に準拠した消防計画書をWord形式で自動生成します。",
  openGraph: {
    title: "トドケデ消防計画 ｜ 元消防士が作った消防計画自動作成サービス",
    description:
      "所在地と建物情報を入力するだけで、所轄消防本部の様式に準拠した消防計画書をWordで自動生成。年額¥49,800〜。",
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
      "所在地と建物情報を入力するだけで、所轄消防本部の様式に準拠した消防計画書をWordで自動生成。年額¥49,800〜。",
    images: ["https://plan.todokede.jp/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={noto.className}>
      <body style={{ background: "#fff", color: "#1a1a1a", margin: 0 }}>
        {/* Google tag (gtag.js) - Google Ads & GA4 共通 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18069681696"
          strategy="afterInteractive"
        />
        <Script id="google-tag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-18069681696');
            gtag('config', 'G-7611WP9PEY');
          `}
        </Script>

        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}