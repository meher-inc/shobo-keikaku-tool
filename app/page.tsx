"use client";
import { useState } from "react";
import PlanForm from "../components/plan-form/PlanForm";
import { MarketingSections } from "../components/marketing-sections";
import { NoteUpdates } from "../components/note-updates";
import TodokedeSeriesNav from "../components/shared/TodokedeSeriesNav";
import { FaqStructuredData } from "../components/StructuredData";
import { FaqAnswer } from "../components/faq-answer";
import { PLAN_SELECTION_FAQ, PREMIUM_FAQS, type FaqItem } from "../lib/premium-faqs";

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
const [showSample, setShowSample] = useState(false);  // ← これを追加
const [faqOpen, setFaqOpen] = useState<number | null>(null);

  return (
    <>
    {/* FAQ 構造化データ（schema.org FAQPage）: AI・検索での引用を助ける */}
    <FaqStructuredData items={FAQ_ITEMS} />
    {/* Hero */}
    <section style={{ textAlign: "center", padding: "clamp(56px,9vw,96px) clamp(16px,4vw,24px) clamp(40px,6vw,64px)", maxWidth: 760, margin: "0 auto" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--brand-tint)", color: "var(--brand)", fontSize: 13, fontWeight: 700, padding: "8px 16px", borderRadius: 999, marginBottom: 24 }}>
        20の消防本部様式に準拠・1件 ¥4,980〜 の買い切り
      </div>
      <h1 style={{ fontSize: "clamp(30px,6vw,46px)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 16 }}>消防計画を、自動作成。</h1>
      <p style={{ fontSize: "clamp(15px,2.5vw,18px)", color: "var(--text-muted)", fontWeight: 400, lineHeight: 1.7, maxWidth: 580, margin: "0 auto" }}>
        開業前・立入検査・防火管理者の選任で「消防計画の提出」を求められた方へ。所在地と建物情報を入力するだけで、所轄の様式に沿った消防計画を約15分でWord作成。増改築・内装改修など「工事中の消防計画」にも対応。元消防士が設計・買い切り（月額・更新料なし）。
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 32 }}>
        <a href="#form" style={{ background: "var(--brand)", color: "#fff", padding: "15px 36px", borderRadius: 12, fontSize: 16, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 14px rgba(46,95,158,0.25)" }}>
          作成をはじめる
        </a>
        <button
          onClick={() => setShowSample(true)}
          style={{ background: "var(--surface)", border: "2px solid var(--brand)", color: "var(--brand)", padding: "13px 32px", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer" }}
        >
          サンプルを見る
        </button>
      </div>
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 14 }}>
        実際に生成される消防計画（飲食店320㎡・別表付き）をご確認いただけます
      </p>
    </section>

    <MarketingSections />

    <PlanForm showSample={showSample} setShowSample={setShowSample} />

    {/* FAQ Section */}
    <section
      style={{
        maxWidth: 1080,
        margin: "0 auto",
        padding: "clamp(64px, 10vw, 96px) clamp(16px, 4vw, 24px)",
      }}
    >
      <h2
        style={{
          fontSize: "clamp(24px, 5vw, 32px)",
          fontWeight: 900,
          textAlign: "center",
          marginBottom: 48,
          color: "var(--text)",
        }}
      >
        よくあるご質問
      </h2>
      <div>
        {FAQ_ITEMS.map((item, i) => {
          const isOpen = faqOpen === i;
          return (
            <div
              key={i}
              style={{
                borderBottom: "1px solid var(--border)",
                padding: "20px 0",
              }}
            >
              <button
                type="button"
                onClick={() => setFaqOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  textAlign: "left",
                  color: "inherit",
                  font: "inherit",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: 18,
                      fontWeight: 900,
                      color: "var(--brand)",
                      flexShrink: 0,
                    }}
                  >
                    Q.
                  </span>
                  <span
                    style={{
                      fontSize: "clamp(14px, 3.5vw, 16px)",
                      fontWeight: 700,
                      color: "var(--text)",
                    }}
                  >
                    {item.q}
                  </span>
                </div>
                <span
                  aria-hidden="true"
                  style={{
                    fontSize: 24,
                    color: "var(--text-muted)",
                    flexShrink: 0,
                    lineHeight: 1,
                  }}
                >
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen && (
                <div
                  id={`faq-panel-${i}`}
                  role="region"
                  style={{
                    marginTop: 16,
                    padding: "clamp(14px, 4vw, 20px)",
                    background: "var(--brand-tint)",
                    borderRadius: 8,
                    display: "flex",
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      fontWeight: 900,
                      color: "var(--text)",
                      flexShrink: 0,
                    }}
                  >
                    A.
                  </span>
                  <div
                    style={{
                      fontSize: "clamp(13px, 3.5vw, 15px)",
                      lineHeight: 1.8,
                      color: "var(--text)",
                    }}
                  >
                    <FaqAnswer item={item} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>

    {/* 区切りCTA（FAQのあと） */}
    <div style={{ textAlign: "center", padding: "48px 20px 0" }}>
      <a href="#form" style={{ display: "inline-block", background: "var(--brand)", color: "#fff", padding: "16px 40px", borderRadius: 12, fontSize: 16, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 14px rgba(46,95,158,0.25)" }}>
        準備ができたら、作成をはじめる →
      </a>
    </div>

    {/* Plan comparison CTA */}
    <section style={{ maxWidth: 720, margin: "0 auto", padding: "64px 20px 0" }}>
      <div style={{
        background: "linear-gradient(135deg, var(--brand-gradient) 0%, var(--surface) 100%)",
        border: "1px solid var(--brand-tint)",
        borderRadius: 20, padding: "40px 32px", textAlign: "center",
      }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
          プランをじっくり比較したい方へ
        </h2>
        <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 24 }}>
          ライト・スタンダード・プレミアムの違いを一覧でご確認いただけます。料金は1件ごとの都度払い（買い切り）です。
        </p>
        <a
          href="/pricing"
          style={{
            display: "inline-block", padding: "14px 36px", borderRadius: 12,
            background: "var(--brand)", color: "#fff", fontSize: 15, fontWeight: 600,
            textDecoration: "none",
          }}
        >
          プランを比較する
        </a>
      </div>
    </section>

    {/* 更新情報（note.com マガジン連携） - ページ下部 */}
    <NoteUpdates />
    <TodokedeSeriesNav source="plan" currentId="shobo-keikaku" />
    </>
  );
}
