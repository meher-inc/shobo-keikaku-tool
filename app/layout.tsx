import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "消防計画 自動作成ツール｜トドケデ",
  description: "建物情報を入力するだけで消防計画を自動生成",
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