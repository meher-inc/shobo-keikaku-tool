import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "消防計画 自動作成ツール｜plan.todokede.jp",
  description: "元京都市消防局職員が開発。建物情報を入力するだけで、所轄消防本部の様式に準拠した消防計画をWordで自動生成。京都市・東京消防庁対応。",
  openGraph: {
    title: "消防計画 自動作成ツール｜plan.todokede.jp",
    description: "元消防士が開発。手書き・コピペから卒業。Wordで一発出力、消防署に通る消防計画を数分で。",
    url: "https://plan.todokede.jp",
    siteName: "plan.todokede.jp",
    images: [
      {
        url: "https://plan.todokede.jp/og-image.png",
        width: 1200,
        height: 630,
        alt: "消防計画 自動作成ツール",
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "消防計画 自動作成ツール｜plan.todokede.jp",
    description: "元消防士が開発した消防計画の自動生成ツール。Wordで一発出力。",
    images: ["https://plan.todokede.jp/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}