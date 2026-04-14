export const metadata = {
  title: "特定商取引法に基づく表記 | トドケデ消防計画",
};

export default function TokushoPage() {
  const th = {
    padding: "10px 16px",
    textAlign: "left" as const,
    fontWeight: 600,
    color: "#1A1A1A",
    background: "#f9f9f9",
    borderBottom: "1px solid #e5e5e5",
    whiteSpace: "nowrap" as const,
  };
  const td = {
    padding: "10px 16px",
    color: "#1A1A1A",
    borderBottom: "1px solid #e5e5e5",
  };
  const table = {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: 14,
    margin: "16px 0 32px",
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px 96px", lineHeight: 1.8, color: "#1A1A1A" }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 32, letterSpacing: "-0.01em" }}>
        特定商取引法に基づく表記
      </h1>

      <table style={table}>
        <tbody>
          <tr><th style={th}>販売事業者</th><td style={td}>MeHer株式会社</td></tr>
          <tr><th style={th}>運営統括責任者</th><td style={td}>丸岡 峻</td></tr>
          <tr><th style={th}>所在地</th><td style={td}>お客様からご請求があった場合、遅滞なく開示いたします</td></tr>
          <tr><th style={th}>電話番号</th><td style={td}>お客様からご請求があった場合、遅滞なく開示いたします</td></tr>
          <tr><th style={th}>メールアドレス</th><td style={td}>plan@todokede.jp</td></tr>
          <tr><th style={th}>販売URL</th><td style={td}>https://plan.todokede.jp</td></tr>
          <tr><th style={th}>提供サービス</th><td style={td}>トドケデ消防計画（消防計画自動作成サービス）</td></tr>
        </tbody>
      </table>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12 }}>販売価格</h2>

      <table style={table}>
        <thead>
          <tr>
            <th style={th}>プラン</th>
            <th style={th}>月額（税込）</th>
            <th style={th}>年額（税込）</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style={td}>ミニマム</td><td style={td}>4,980円</td><td style={td}>49,800円</td></tr>
          <tr><td style={td}>スタンダード</td><td style={td}>9,800円</td><td style={td}>98,000円</td></tr>
        </tbody>
      </table>

      <p style={{ fontSize: 14, color: "#666666" }}>価格はすべて消費税を含んだ金額です。</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12 }}>商品代金以外にお客様にご負担いただく費用</h2>
      <p style={{ fontSize: 14 }}>本サービスのご利用にあたり必要となるインターネット接続料金、通信料金等はお客様のご負担となります。</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12 }}>支払方法</h2>
      <p style={{ fontSize: 14 }}>
        クレジットカード決済（Stripe）<br />
        利用可能ブランド：Visa、Mastercard、JCB、American Express、Diners Club
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12 }}>支払時期</h2>
      <ul style={{ fontSize: 14, paddingLeft: 20 }}>
        <li>初回：お申し込み時に即時決済</li>
        <li>2回目以降：毎月または毎年、契約日に応じた自動更新による継続決済</li>
      </ul>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12 }}>サービスの提供時期</h2>
      <p style={{ fontSize: 14 }}>決済完了後、直ちにサービスのご利用が可能となります。</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12 }}>契約の自動更新について</h2>
      <p style={{ fontSize: 14 }}>本サービスは月額または年額の自動更新型サブスクリプションです。解約のお申し出がない限り、契約は同一条件で自動的に更新されます。</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12 }}>解約方法</h2>
      <p style={{ fontSize: 14 }}>
        次回課金日の前日までに、plan@todokede.jp 宛に解約のご希望をメールでお送りください。解約のお手続きを24時間以内に行い、完了のご連絡を差し上げます。
      </p>
      <p style={{ fontSize: 14 }}>解約後も、既に決済済みの期間満了日まではサービスをご利用いただけます。</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12 }}>返品・返金について</h2>
      <p style={{ fontSize: 14 }}>
        本サービスはデジタルサービスの性質上、決済完了後の返金は原則として承っておりません。
      </p>
      <p style={{ fontSize: 14 }}>ただし、以下のいずれかに該当する場合は、個別にご対応いたします。</p>
      <ul style={{ fontSize: 14, paddingLeft: 20 }}>
        <li>当社の責に帰すべき事由によりサービスの提供ができない場合</li>
        <li>当社が定める重大な不具合によりサービスを継続的にご利用いただけない場合</li>
      </ul>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12 }}>動作環境</h2>
      <ul style={{ fontSize: 14, paddingLeft: 20 }}>
        <li>最新のGoogle Chrome、Safari、Firefox、Microsoft Edge</li>
        <li>安定したインターネット接続環境</li>
        <li>Microsoft Word（生成された消防計画ファイルの閲覧・編集に使用）</li>
      </ul>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12 }}>特別条件</h2>
      <p style={{ fontSize: 14 }}>本サービスは自動更新型のサブスクリプションサービスです。お申し込みの前に本表記および利用規約を必ずご確認ください。</p>

      <p style={{ fontSize: 13, color: "#666666", marginTop: 48 }}>制定日：2026年4月14日 / 最終更新日：2026年4月14日</p>
    </div>
  );
}
