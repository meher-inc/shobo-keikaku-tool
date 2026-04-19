import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "利用規約 | トドケデ消防計画",
};

const h2style = { fontSize: 20, fontWeight: 700 as const, marginTop: 40, marginBottom: 12 };
const pstyle = { fontSize: 14 };
const olstyle = { fontSize: 14, paddingLeft: 20 };
const ulstyle = { fontSize: 14, paddingLeft: 20, listStyle: "disc" as const };

export default function TermsPage() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px 96px", lineHeight: 1.8, color: "#1A1A1A" }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 32, letterSpacing: "-0.01em" }}>
        利用規約
      </h1>

      <p style={pstyle}>
        MeHer株式会社（以下「当社」）が提供する「トドケデ消防計画」（以下「本サービス」）の利用条件を定めるものです。
      </p>

      <h2 style={h2style}>第1条（適用）</h2>
      <p style={pstyle}>本規約は、お客様と当社との間の本サービスの利用に関わる一切の関係に適用されます。</p>

      <h2 style={h2style}>第2条（利用登録）</h2>
      <ol style={olstyle}>
        <li>本規約に同意の上、当社の定める方法によって利用登録の申請を行うものとします。</li>
        <li>当社が申請を承諾した時点で、利用契約が成立します。</li>
      </ol>

      <h2 style={h2style}>第3条（サービス内容）</h2>
      <ol style={olstyle}>
        <li>本サービスは、事業所情報に基づき消防計画書を自動生成するサービスです。</li>
        <li>
          決済完了後、ただちにご利用いただけます。
        </li>
        <li>
          契約プランに応じて以下の機能をご利用いただけます。
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li><strong>ミニマムプラン</strong>：消防計画書（Word形式）の自動生成、年次更新機能、メールサポート</li>
            <li><strong>スタンダードプラン</strong>：ミニマムの全機能 + 別表9種の自動生成、提出用ガイドPDF、法改正フラグ通知、点検・訓練リマインド</li>
          </ul>
        </li>
        <li>生成される消防計画書は、お客様が最終確認・修正の上で提出するものです。内容の正確性等について当社は保証しません。</li>
      </ol>

      <h2 style={h2style}>第4条（料金およびプラン）</h2>
      <ol style={olstyle}>
        <li>本サービスの利用料金は、当社が別途定める料金表に従います。料金表はウェブサイト上（<a href="/pricing" style={{ color: "#1a56db" }}>/pricing</a>）に掲載します。</li>
        <li>本サービスは以下のプランを提供します：ミニマムプラン、スタンダードプラン。</li>
        <li>各プランには月額払いおよび年額払いがあります。年額払いは月額払いに比べ2ヶ月分相当額の割引が適用されます。</li>
        <li>表示価格はすべて消費税込みです。</li>
        <li>当社は30日前までの通知により料金を改定できるものとします。ただし、既存の契約期間中の料金は変更されません。</li>
      </ol>

      <h2 style={h2style}>第5条（支払方法）</h2>
      <ol style={olstyle}>
        <li>支払方法はクレジットカード決済（Stripe経由）とします。</li>
        <li>対応ブランド：Visa、Mastercard、JCB、American Express、Diners Club。</li>
        <li>月額プランは初回即時決済、2回目以降は毎月の契約更新日に自動決済されます。年額プランは初回一括決済、1年後の契約更新日に一括自動決済されます。</li>
      </ol>

      <h2 style={h2style}>第6条（自動更新）</h2>
      <ol style={olstyle}>
        <li>お客様が解約手続きを行わない限り、契約期間満了時に同一条件で自動更新されます。</li>
        <li>月額プランは毎月、年額プランは1年後にそれぞれ自動更新されます。</li>
        <li>自動更新時は登録されたクレジットカードに自動課金されます。</li>
        <li>決済失敗時は通知し、決済方法の更新をお願いいたします。</li>
      </ol>

      <h2 style={h2style}>第7条（解約）</h2>
      <ol style={olstyle}>
        <li><a href="mailto:plan@todokede.jp" style={{ color: "#1a56db" }}>plan@todokede.jp</a> 宛にメールで解約のお申し出をいただくことで、いつでも解約手続きが可能です。解約のお手続きを24時間以内（土日祝日を除く）に行い、完了のご連絡を差し上げます。</li>
        <li>解約手続き完了後、次回契約更新日をもって課金が停止されます。</li>
        <li>解約後も、現在の契約期間満了までは引き続きサービスをご利用いただけます。</li>
        <li>最低利用期間は設定しておりません。</li>
      </ol>

      <h2 style={h2style}>第8条（返金）</h2>
      <ol style={olstyle}>
        <li>役務の性質上、原則として既にお支払いいただいた料金の返金は行いません。</li>
        <li>ただし、以下のいずれかに該当する場合は、個別にご相談のうえ対応いたします。
          <ul style={ulstyle}>
            <li>当社の重大なシステム障害により、相当期間サービスをご利用いただけなかった場合</li>
            <li>当社に明らかな帰責事由がある場合</li>
            <li>消費者契約法等の法令により返金が必要と判断される場合</li>
          </ul>
        </li>
        <li>月の途中で解約された場合でも、日割り計算による返金は行いません。</li>
      </ol>

      <h2 style={h2style}>第9条（プラン変更）</h2>
      <ol style={olstyle}>
        <li><a href="mailto:plan@todokede.jp" style={{ color: "#1a56db" }}>plan@todokede.jp</a> 宛にメールでプラン変更のご希望をお送りいただくことで、いつでもプラン変更が可能です。</li>
        <li><strong>アップグレード</strong>（例：ミニマム → スタンダード）：変更時点で差額を日割り計算して即時適用されます。</li>
        <li><strong>ダウングレード</strong>（例：スタンダード → ミニマム）：次回更新日から新プランが適用されます。</li>
      </ol>

      <h2 style={h2style}>第10条（サービスの利用開始）</h2>
      <ol style={olstyle}>
        <li>決済完了後、ただちに本サービスをご利用いただけます。</li>
        <li>本サービスは通信販売に該当し、特定商取引法に定めるクーリングオフの適用はありません。</li>
      </ol>

      <h2 style={h2style}>第11条（解約後のデータ保持）</h2>
      <ol style={olstyle}>
        <li>解約後、お客様のデータを3ヶ月間保持します。</li>
        <li>保持期間中はPDFエクスポートが可能です（マイページへのログインが必要です）。</li>
        <li>保持期間経過後、データは完全に削除されます。当社にデータの復旧義務はありません。</li>
      </ol>

      <h2 style={h2style}>第12条（既存顧客の移行に関する特則）</h2>
      <ol style={olstyle}>
        <li>サブスクリプションモデル導入以前の単発購入ユーザーに対し、当社が定める移行特典を適用する場合があります。</li>
        <li>移行特典の内容・条件は、個別案内にて通知します。</li>
        <li>移行しない場合、既存サービスは継続しますが、サブスクリプション限定の追加機能はご利用いただけません。</li>
      </ol>

      <h2 style={h2style}>第13条（禁止事項）</h2>
      <p style={pstyle}>
        法令違反、当社・第三者の権利侵害、サービスの商業的二次利用、不正アクセス、反社会的勢力への利益供与、リバースエンジニアリング等を禁止します。
      </p>

      <h2 style={h2style}>第14条（サービスの停止）</h2>
      <p style={pstyle}>
        システム保守、天災等の不可抗力その他当社が困難と判断した場合、事前通知なくサービスを停止・中断できます。
      </p>

      <h2 style={h2style}>第15条（免責事項）</h2>
      <ol style={olstyle}>
        <li>当社は本サービスの瑕疵がないことを保証しません。</li>
        <li>生成された消防計画書が所轄消防本部に必ず受理されることを保証しません。</li>
        <li>当社の損害賠償責任の総額は過去12ヶ月分の利用料金を上限とします（故意・重過失を除く）。</li>
      </ol>

      <h2 style={h2style}>第16条（利用規約の変更）</h2>
      <p style={pstyle}>必要と判断した場合、本規約を変更できます。変更後は本サイト上に掲載した時点から効力を生じます。</p>

      <h2 style={h2style}>第17条（権利義務の譲渡禁止）</h2>
      <p style={pstyle}>お客様は、当社の書面による事前の承諾なく、利用契約上の地位または本規約に基づく権利もしくは義務を第三者に譲渡し、または担保に供することはできません。</p>

      <h2 style={h2style}>第18条（準拠法・管轄裁判所）</h2>
      <ol style={olstyle}>
        <li>本規約の準拠法は日本法とします。</li>
        <li>本サービスに関する紛争は、当社本店所在地を管轄する裁判所を第一審の専属的合意管轄裁判所とします。</li>
      </ol>

      <p style={{ fontSize: 13, color: "#666666", marginTop: 48 }}>
        制定日：2026年4月14日 / 最終更新日：2026年4月18日<br />
        MeHer株式会社
      </p>
    </div>
  );
}
