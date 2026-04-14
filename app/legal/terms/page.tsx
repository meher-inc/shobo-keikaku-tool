export const metadata = {
  title: "利用規約 | トドケデ消防計画",
};

export default function TermsPage() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px 96px", lineHeight: 1.8, color: "#1A1A1A" }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 32, letterSpacing: "-0.01em" }}>
        利用規約
      </h1>

      <p style={{ fontSize: 14 }}>
        MeHer株式会社（以下「当社」）が提供する「トドケデ消防計画」の利用条件を定めるものです。
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12 }}>第1条（適用）</h2>
      <p style={{ fontSize: 14 }}>本規約は、お客様と当社との間の本サービスの利用に関わる一切の関係に適用されます。</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12 }}>第2条（利用登録）</h2>
      <ol style={{ fontSize: 14, paddingLeft: 20 }}>
        <li>本規約に同意の上、当社の定める方法によって利用登録の申請を行うものとします。</li>
        <li>当社が申請を承諾した時点で、利用契約が成立します。</li>
      </ol>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12 }}>第3条（サービス内容）</h2>
      <ol style={{ fontSize: 14, paddingLeft: 20 }}>
        <li>本サービスは、事業所情報に基づき消防計画書を自動生成するサービスです。</li>
        <li>
          契約プランに応じて以下の機能をご利用いただけます。
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li><strong>ミニマムプラン</strong>：消防計画書（Word形式）の自動生成、年次更新ドラフト機能、メールサポート</li>
            <li><strong>スタンダードプラン</strong>：ミニマムの全機能 + 別表9種の自動生成、提出用ガイドPDF、法改正フラグ通知、点検・訓練リマインド</li>
          </ul>
        </li>
        <li>生成される消防計画書は、お客様が最終確認・修正の上で提出するものです。内容の正確性等について当社は保証しません。</li>
      </ol>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12 }}>第4条（料金および支払方法）</h2>
      <ol style={{ fontSize: 14, paddingLeft: 20 }}>
        <li>利用料金は各プランの月額または年額（税込）とし、当社ウェブサイトに記載する金額とします。</li>
        <li>Stripeを通じてクレジットカードにより支払うものとします。</li>
        <li>月額プランは毎月同日、年額プランは毎年同日に自動更新・決済されます。</li>
      </ol>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12 }}>第5条（契約期間および更新）</h2>
      <p style={{ fontSize: 14 }}>解約のお申し出がない場合、同一条件で自動的に更新されます。</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12 }}>第6条（解約）</h2>
      <ol style={{ fontSize: 14, paddingLeft: 20 }}>
        <li>次回課金日の前日までに plan@todokede.jp へメールにて申し出ることで解約できます。</li>
        <li>解約後も決済済み期間満了日まで利用できます。</li>
        <li>日割り計算による返金は行いません。</li>
      </ol>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12 }}>第7条（禁止事項）</h2>
      <p style={{ fontSize: 14 }}>
        法令違反、当社・第三者の権利侵害、サービスの商業的二次利用、不正アクセス、反社会的勢力への利益供与、リバースエンジニアリング等を禁止します。
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12 }}>第8条（サービスの停止）</h2>
      <p style={{ fontSize: 14 }}>
        システム保守、天災等の不可抗力その他当社が困難と判断した場合、事前通知なくサービスを停止・中断できます。
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12 }}>第9条（免責事項）</h2>
      <ol style={{ fontSize: 14, paddingLeft: 20 }}>
        <li>当社は本サービスの瑕疵がないことを保証しません。</li>
        <li>生成された消防計画書が所轄消防本部に必ず受理されることを保証しません。</li>
        <li>当社の損害賠償責任の総額は過去12ヶ月分の利用料金を上限とします（故意・重過失を除く）。</li>
      </ol>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12 }}>第10条（利用規約の変更）</h2>
      <p style={{ fontSize: 14 }}>必要と判断した場合、通知なく本規約を変更できます。変更後は掲載時点から効力を生じます。</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12 }}>第11条〜第13条</h2>
      <p style={{ fontSize: 14 }}>
        権利義務の譲渡禁止。準拠法は日本法。紛争は当社本店所在地を管轄する裁判所を専属的合意管轄とします。
      </p>

      <p style={{ fontSize: 13, color: "#666666", marginTop: 48 }}>
        制定日：2026年4月14日 / 最終更新日：2026年4月14日<br />
        MeHer株式会社
      </p>
    </div>
  );
}
