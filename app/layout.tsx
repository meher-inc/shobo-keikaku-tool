import "./globals.css";
import { Noto_Sans_JP } from "next/font/google";
import Header from "../components/Header";
import Footer from "../components/Footer";

const noto = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

export const metadata = {
  title: "消防計画 自動作成ツール | plan.todokede.jp",
  description: "元消防士が開発。消防計画を数分でWord出力。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={noto.className}>
      <body style={{ background: "#fff", color: "#1a1a1a", margin: 0 }}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}