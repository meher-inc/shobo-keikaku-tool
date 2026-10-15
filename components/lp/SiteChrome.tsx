"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LegacyHeader from "../Header";
import LegacyFooter from "../Footer";

export function SiteHeader() {
  const path=usePathname();
  if (path !== "/") return <LegacyHeader />;
  return <header className="lp-header" data-lp-section="ヘッダー"><div className="lp-container lp-header-inner">
    <Link className="lp-wordmark" href="/" aria-label="トドケデ 消防計画"><strong>トドケデ</strong><span>消防計画</span></Link>
    <nav aria-label="メインナビゲーション"><a href="#how-it-works">使い方</a><a href="#pricing">料金</a><a href="#departments">対応消防本部</a><a href="#faq">よくある質問</a><Link href="/mypage">マイページ</Link></nav>
    <a className="lp-button lp-button-primary" href="#form">作成をはじめる</a>
  </div></header>;
}

const series=[
  {name:"トドケデ 消防計画",href:"/"},
  {name:"トドケデ消防書類作成",href:"https://docs.todokede.jp/"},
  {name:"トドケデ消防書類代行",href:"https://daikou.todokede.jp/"},
  {name:"トドケデ介護",href:"https://care.todokede.jp/"},
  {name:"トドケデコンサルティング",href:"https://meher-inc.co.jp/business/consulting"},
];

export function SiteFooter() {
  const path=usePathname();
  if(path!=="/") return <LegacyFooter />;
  return <footer className="lp-footer lp-section" data-lp-section="フッター"><div className="lp-container">
    <p className="lp-footer-message">消防のことは、トドケデに。</p><p><strong>MeHer株式会社</strong></p><p>元消防士が設計した消防計画作成クラウドサービス</p>
    <nav aria-label="トドケデシリーズ"><p>トドケデシリーズ</p><ul>{series.map(item=><li key={item.href}>{item.href.startsWith("https") ? <a href={item.href} target="_blank" rel="noopener noreferrer">{item.name}</a> : <Link href={item.href}>{item.name}（このサイト）</Link>}</li>)}</ul></nav>
    <div className="lp-footer-guide"><a href="https://guide.plan.todokede.jp/" target="_blank" rel="noopener noreferrer">実務ガイド ↗</a><a href="https://services.todokede.jp" target="_blank" rel="noopener noreferrer">全てのトドケデサービス ↗</a></div>
    <nav aria-label="運営情報"><ul><li><Link href="/contact">法人のご相談</Link></li><li><Link href="/mypage">マイページ</Link></li><li><Link href="/legal/tokusho">特定商取引法に基づく表記</Link></li><li><Link href="/legal/privacy">プライバシーポリシー</Link></li><li><Link href="/legal/terms">利用規約</Link></li></ul></nav>
    <p className="lp-copyright">© {new Date().getFullYear()} MeHer株式会社</p>
  </div></footer>;
}
