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

      <h2 style={h2style}>第2条（利用契約の成立）</h2>
      <ol style={olstyle}>
        <li>お客様は、本規約に同意の上、当社の定める方法により消防計画の作成をお申込みいただきます。</li>
        <li>お申込みに対する決済が完了した時点で、当該お申込みにかかる利用契約が成立します。</li>
      </ol>

      <h2 style={h2style}>第3条（サービス内容）</h2>
      <ol style={olstyle}>
        <li>本サービスは、事業所情報に基づき消防計画書を自動生成し、Word形式で提供するサービスです。</li>
        <li>決済完了後、ただちに消防計画ファイルを生成・ダウンロードいただけます。</li>
        <li>
          お選びいただくプランに応じて、以下の内容を提供します。
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li><strong>ライト</strong>：消防計画書（Word形式）の自動生成、所轄消防本部の様式に準拠</li>
            <li><strong>スタンダード</strong>：ライトの内容 + 別表すべての出力、記入ガイドPDF</li>
            <li><strong>プレミアム</strong>：スタンダードの内容 + 元消防士による内容チェック、修正1回対応</li>
          </ul>
        </li>
        <li>生成される消防計画書は、お客様が最終確認・修正の上で提出するものです。内容の正確性等について当社は保証しません。</li>
      </ol>

      <h2 style={h2style}>第4条（料金およびプラン）</h2>
      <ol style={olstyle}>
        <li>本サービスの利用料金は、当社が別途定める料金表に従います。料金表はウェブサイト上（<a href="/pricing" style={{ color: "#1a56db" }}>/pricing</a>）に掲載します。</li>
        <li>本サービスは以下のプランを提供します：ライト、スタンダード、プレミアム。</li>
        <li>料金は1件ごとの都度払い（買い切り）です。月額料金・更新料はありません。</li>
        <li>表示価格はすべて消費税込みです。</li>
        <li>当社は料金を改定できるものとします。改定後の料金は、ウェブサイト上に掲載した時点以降のお申込みに適用されます。</li>
      </ol>

      <h2 style={h2style}>第5条（支払方法）</h2>
      <ol style={olstyle}>
        <li>支払方法はクレジットカード決済（Stripe経由）とします。</li>
        <li>対応ブランド：Visa、Mastercard、JCB、American Express、Diners Club。</li>
        <li>料金は、お申込み手続き完了時に1件ごとに即時決済されます。</li>
      </ol>

      <h2 style={h2style}>第6条（申込みのキャンセル）</h2>
      <ol style={olstyle}>
        <li>本サービスは、決済完了後ただちに消防計画ファイル（デジタルデータ）を生成・提供する役務です。その性質上、データ生成後のキャンセル・返品は承っておりません。</li>
        <li>決済完了前であれば、ブラウザを閉じることでお申込みを中止いただけます。</li>
      </ol>

      <h2 style={h2style}>第7条（返金）</h2>
      <ol style={olstyle}>
        <li>生成された消防計画の内容に不備があった場合は、内容を確認のうえ返金または再発行で対応いたします。</li>
        <li>お客様のご都合（出力後に使用しなかった等）による返金は承っておりません。</li>
        <li>次のいずれかに該当する場合は、個別にご相談のうえ対応いたします。
          <ul style={ulstyle}>
            <li>当社の重大なシステム障害により、相当期間サービスをご利用いただけなかった場合</li>
            <li>当社に明らかな帰責事由がある場合</li>
            <li>消費者契約法等の法令により返金が必要と判断される場合</li>
          </ul>
        </li>
      </ol>

      <h2 style={h2style}>第8条（サービスの利用開始）</h2>
      <ol style={olstyle}>
        <li>決済完了後、ただちに本サービスをご利用いただけます。</li>
        <li>本サービスは通信販売に該当し、特定商取引法に定めるクーリングオフの適用はありません。</li>
      </ol>

      <h2 style={h2style}>第9条（再ダウンロード・データの取扱い）</h2>
      <ol style={olstyle}>
        <li>生成された消防計画ファイルは、決済完了メールに記載のURLから再度ダウンロードいただけます。リンクが無効になっている場合は、決済時のメールアドレスを添えてお問い合わせください。</li>
        <li>お客様の入力情報は、決済および消防計画の生成・提供の目的の範囲で取り扱います。詳細は<a href="/legal/privacy" style={{ color: "#1a56db" }}>プライバシーポリシー</a>に定めます。</li>
      </ol>

      <h2 style={h2style}>第10条（禁止事項）</h2>
      <p style={pstyle}>
        法令違反、当社・第三者の権利侵害、サービスの商業的二次利用、不正アクセス、反社会的勢力への利益供与、リバースエンジニアリング等を禁止します。
      </p>

      <h2 style={h2style}>第11条（サービスの停止）</h2>
      <p style={pstyle}>
        システム保守、天災等の不可抗力その他当社が困難と判断した場合、事前通知なくサービスを停止・中断できます。
      </p>

      <h2 style={h2style}>第12条（免責事項）</h2>
      <ol style={olstyle}>
        <li>当社は本サービスの瑕疵がないことを保証しません。</li>
        <li>生成された消防計画書が所轄消防本部に必ず受理されることを保証しません。</li>
        <li>当社の損害賠償責任の総額は、当該お申込みにかかる購入代金を上限とします（故意・重過失を除く）。</li>
      </ol>

      <h2 style={h2style}>第13条（利用規約の変更）</h2>
      <p style={pstyle}>必要と判断した場合、本規約を変更できます。変更後は本サイト上に掲載した時点から効力を生じます。</p>

      <h2 style={h2style}>第14条（権利義務の譲渡禁止）</h2>
      <p style={pstyle}>お客様は、当社の書面による事前の承諾なく、利用契約上の地位または本規約に基づく権利もしくは義務を第三者に譲渡し、または担保に供することはできません。</p>

      <h2 style={h2style}>第15条（準拠法・管轄裁判所）</h2>
      <ol style={olstyle}>
        <li>本規約の準拠法は日本法とします。</li>
        <li>本サービスに関する紛争は、当社本店所在地を管轄する裁判所を第一審の専属的合意管轄裁判所とします。</li>
      </ol>

      <p style={{ fontSize: 13, color: "#666666", marginTop: 48 }}>
        制定日：2026年4月14日 / 最終更新日：2026年6月16日<br />
        MeHer株式会社
      </p>
    </div>
  );
}
