"use client";

import Link from "next/link";
import { useState } from "react";
import PlanForm from "../components/plan-form/PlanForm";
import { FaqStructuredData } from "../components/StructuredData";
import { FaqAnswer } from "../components/faq-answer";
import { PLAN_SELECTION_FAQ, PREMIUM_FAQS, type FaqItem } from "../lib/premium-faqs";
import TodokedeSeriesNav from "../components/shared/TodokedeSeriesNav";
import IsoHero from "../components/illustrations/IsoHero";
import MobileCta from "../components/lp/MobileCta";
import ProductStructuredData from "../components/lp/ProductStructuredData";
import { EvidenceBand, Concerns, Benefits, Reasons, Flow, Departments, Comparison, Testimonials, Pricing, FinalCta } from "../components/lp/Sections";

const FAQ_ITEMS: FaqItem[] = [
  {
    q: "消防計画を自動で作成できるツールはありますか?",
    a: "はい。トドケデ消防計画は、所在地と建物情報を入力するだけで、所轄消防本部の様式に沿った消防計画をWord形式で自動作成できるクラウド型サービスです。元消防士が設計し、東京消防庁・大阪市消防局など全国20の消防本部の様式に対応。1件¥4,980からの買い切りで、月額・更新料はかかりません。作成後の再ダウンロードに対応しています。購入から14日間は、ご自身で入力を直して追加料金なしで作り直せます。",
  },
  {
    q: "出力された消防計画はそのまま消防署に提出できますか?",
    a: "はい。京都市消防局・東京消防庁・大阪市消防局・堺市消防局・岡山市消防局・横浜市消防局・福岡市消防局・名古屋市消防局・札幌市消防局・川崎市消防局・神戸市消防局・さいたま市消防局・広島市消防局・仙台市消防局・千葉市消防局・北九州市消防局・新潟市消防局・熊本市消防局・相模原市消防局・静岡市消防局の最新様式に準拠しており、そのまま印刷して提出できます。ただし管轄消防署によっては事前相談や追加の記入を求められる場合があります。不安な方はプレミアムプラン(元消防士によるチェック付き)をご利用ください。提出前に内容をご確認いただき、必要に応じて入力を直して作り直してください。受理の可否は所轄消防本部が判断します。",
  },
  {
    q: "対応している消防本部を教えてください。",
    a: "現在は京都市消防局・東京消防庁・大阪市消防局・堺市消防局・岡山市消防局・横浜市消防局・福岡市消防局・名古屋市消防局・札幌市消防局・川崎市消防局・神戸市消防局・さいたま市消防局・広島市消防局・仙台市消防局・千葉市消防局・北九州市消防局・新潟市消防局・熊本市消防局・相模原市消防局・静岡市消防局に正式対応しています。それ以外のエリアは標準様式(京都ベース)で出力されますので、ご利用前に管轄消防署の様式と照合することをお勧めします。",
  },
  {
    q: "工事中（増改築・内装改修など）の建物の消防計画にも対応していますか?",
    a: "はい。建物情報のステップで「工事中の消防計画」を選ぶと、火気管理・危険物品の管理・避難経路の確保・消防用設備等の機能停止時の代替措置などを定めた、工事中の防火対象物用の消防計画を生成します。工事概要書や火気使用工事の事前承認書などの別表も同梱されます（スタンダード以上）。工事中の消防計画の届出様式や届出要否は消防本部ごとに運用が異なるため、提出前に所轄消防署へご確認ください。",
  },
  PLAN_SELECTION_FAQ,
  ...PREMIUM_FAQS,
  {
    q: "入力した情報は保存されますか?",
    a: "はい。フォームに入力された情報は、決済・書類生成に加えて、購入後の再ダウンロードや、ご自身で入力を直して期間内に追加料金なしで作り直せるようにするため、決済記録とあわせてサーバーに保存されます。保存期間は決済関連記録として取引完了日から7年間（法人税法等に基づく帳簿保存義務）で、詳細はプライバシーポリシーをご確認ください。削除をご希望の場合は、プライバシーポリシー記載のお問い合わせ先までご連絡ください。",
  },
  {
    q: "決済後にダウンロードし忘れました。再ダウンロードできますか?",
    a: "決済完了メールに記載されたURLから再度アクセスできます。万一リンクが無効になっている場合は、決済時のメールアドレスを添えて plan@todokede.jp までご連絡ください。",
  },
  {
    q: "防火管理者の資格がなくても消防計画を作成できますか?",
    a: "消防計画の作成自体は誰でもできますが、提出には防火管理者の選任が必要です(特定用途で収容30人以上、延床300㎡以上の場合は甲種、それ以外は乙種)。資格取得は1〜2日の講習で可能です。お近くの消防署または日本防火・防災協会のサイトで受講できます。",
  },
  {
    q: "出力形式はWordですか?PDFですか?",
    a: "Word形式(.docx)で出力されます。消防署に提出する前に建物固有の情報を追記・修正したい場合にそのまま編集できます。印刷するだけの方は、Wordで開いてPDF保存してください。",
  },
  {
    q: "領収書は発行できますか?",
    a: "Stripe決済完了時にStripeから自動で領収書が発行されます。会社名が必要な場合は、決済画面で入力いただけます。別途MeHer株式会社発行の領収書が必要な場合は plan@todokede.jp までご連絡ください。",
  },
  {
    q: "返金は可能ですか?",
    a: "出力された消防計画の内容に不備があった場合は、内容確認のうえ返金または再発行で対応いたします。「出力してみたけど使わなかった」という理由での返金はお断りしています。",
  },
  {
    q: "法人として複数物件分まとめて購入できますか?",
    a: "現在は1件ずつの購入となっております。管理会社様・フランチャイズ本部様などで複数物件の一括対応をご希望の場合は、法人・複数物件のご相談からお問い合わせください。担当より折り返しご案内いたします。",
    link: { text: "法人・複数物件のご相談", href: "/contact" },
  },
];

export default function Home() {
  const [showSample,setShowSample]=useState(false);
  return <div className="lp-renewal">
    <FaqStructuredData items={FAQ_ITEMS} /><ProductStructuredData />
    <section className="lp-hero lp-section lp-white" data-lp-section="ファーストビュー"><div className="lp-container lp-hero-grid">
      <div className="lp-hero-labels"><span>元消防士が設計</span><span>20の消防本部様式に準拠</span><span>1件 ¥4,980〜 の買い切り</span></div>
      <h1>消防計画を、自動作成。</h1><div className="lp-hero-art"><IsoHero /></div>
      <div className="lp-hero-copy"><p>開業前・立入検査・防火管理者の選任で「消防計画の提出」を求められた方へ。所在地と建物情報を入力するだけで、所轄の様式に沿った消防計画を約15分でWord作成。</p><div className="lp-hero-actions"><a className="lp-button lp-button-primary" href="#form">作成をはじめる</a><button className="lp-button lp-button-secondary" type="button" onClick={()=>setShowSample(true)}>サンプルを見る</button></div><p className="lp-fine-print">実際に生成される消防計画（飲食店320㎡・別表付き）をご確認いただけます</p>
      <p className="lp-hero-scope">増改築・内装改修など「工事中の消防計画」にも対応。元消防士が設計・買い切り（月額・更新料なし）。</p></div>
    </div></section>
    <EvidenceBand /><Concerns /><Benefits /><Reasons /><Flow /><Departments /><Comparison /><Testimonials /><Pricing />
    <section className="lp-section lp-white lp-form-section" data-lp-section="消防計画をつくる"><PlanForm showSample={showSample} setShowSample={setShowSample} /></section>
    <section id="faq" className="lp-section lp-muted lp-faq" data-lp-section="よくある質問"><div className="lp-reading"><h2>よくあるご質問</h2><div className="lp-faq-list">{FAQ_ITEMS.map(item=><details key={item.q}><summary><span>Q.</span>{item.q}</summary><div className="lp-faq-answer"><span>A.</span><p><FaqAnswer item={item} /></p></div></details>)}</div></div></section>
    <section className="lp-section lp-white lp-guide" data-lp-section="記事で学ぶ"><div className="lp-reading"><h2>記事で学ぶ｜消防計画の実務ガイド</h2><p>消防計画づくりの実務を、noteで詳しく解説しています。</p><div className="lp-guide-links"><a href="https://guide.plan.todokede.jp/" target="_blank" rel="noopener noreferrer">実務ガイド ↗</a><a href="https://note.com/shun_maruoka/m/m9f1348968657" target="_blank" rel="noopener noreferrer">全記事を見る →</a><Link href="/shobo-keikaku-no-kakikata">はじめての方へ：消防計画の書き方をわかりやすく解説 →</Link></div></div></section>
    <FinalCta /><div className="lp-series" data-lp-section="トドケデシリーズ"><TodokedeSeriesNav source="plan" currentId="shobo-keikaku" /></div><MobileCta />
  </div>;
}
