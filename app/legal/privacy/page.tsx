export const metadata = {
  title: "プライバシーポリシー | トドケデ消防計画",
};

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px 96px", lineHeight: 1.8, color: "#1A1A1A" }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 32, letterSpacing: "-0.01em" }}>
        プライバシーポリシー
      </h1>

      <p style={{ fontSize: 14 }}>
        MeHer株式会社（以下「当社」）は、「トドケデ消防計画」におけるお客様の個人情報の取扱いについて以下のとおりプライバシーポリシーを定めます。
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12 }}>1. 個人情報の定義</h2>
      <p style={{ fontSize: 14 }}>
        個人情報保護法に定める個人情報、すなわち生存する個人に関する情報であって、氏名等により特定の個人を識別できるもの、または個人識別符号が含まれるものをいいます。
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12 }}>2. 取得する個人情報の項目</h2>

      <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>2.1 お客様から直接ご提供いただく情報</h3>
      <ul style={{ fontSize: 14, paddingLeft: 20 }}>
        <li>氏名、会社名、部署名</li>
        <li>メールアドレス</li>
        <li>事業所の住所、電話番号</li>
        <li>消防計画作成に必要な事業所情報（業種、建物情報、防火管理者情報、消防設備情報等）</li>
        <li>クレジットカード情報（決済代行会社Stripeが取得し、当社はトークン化された情報のみを保持します）</li>
      </ul>

      <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>2.2 自動的に取得する情報</h3>
      <ul style={{ fontSize: 14, paddingLeft: 20 }}>
        <li>IPアドレス</li>
        <li>ブラウザ種別、OS種別</li>
        <li>本サービスの利用履歴、アクセスログ</li>
        <li>Cookieおよびこれに類する技術によって取得される情報</li>
      </ul>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12 }}>3. 個人情報の利用目的</h2>
      <ol style={{ fontSize: 14, paddingLeft: 20 }}>
        <li>本サービスの提供、運営、維持、改善のため</li>
        <li>本サービスに関する各種ご連絡、お知らせのため</li>
        <li>お問い合わせへの対応のため</li>
        <li>利用料金の請求、決済のため</li>
        <li>本サービスに関する新機能、新サービス、法改正情報等のご案内のため</li>
        <li>本サービスの利用状況の統計分析、品質向上のため</li>
        <li>利用規約に違反する行為への対応のため</li>
        <li>その他、本サービスに付随する業務のため</li>
      </ol>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12 }}>4. 個人情報の第三者提供</h2>
      <p style={{ fontSize: 14 }}>法令に基づく場合等を除き、お客様の同意なく第三者に個人情報を提供しません。</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12 }}>5. 個人情報の取扱いの委託</h2>
      <p style={{ fontSize: 14 }}>主な委託先：</p>
      <ul style={{ fontSize: 14, paddingLeft: 20 }}>
        <li>Stripe, Inc.（決済処理）</li>
        <li>Supabase Inc.（データベース運用）</li>
        <li>Vercel Inc.（アプリケーションホスティング）</li>
        <li>Resend, Inc.（メール配信）</li>
      </ul>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12 }}>6. 個人情報の安全管理</h2>
      <p style={{ fontSize: 14 }}>不正アクセス、漏洩等を防止するため、適切な安全管理措置を講じます。</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12 }}>7. 個人情報の開示・訂正・削除</h2>
      <p style={{ fontSize: 14 }}>ご自身の個人情報の開示等のご請求は plan@todokede.jp までお申し出ください。</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12 }}>8. Cookieの利用について</h2>
      <p style={{ fontSize: 14 }}>最適なサービス提供のためCookieを使用することがあります。ブラウザ設定により拒否可能ですが、一部機能が利用できなくなる場合があります。</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12 }}>9. プライバシーポリシーの変更</h2>
      <p style={{ fontSize: 14 }}>本ポリシーを変更する場合、本サイト上に掲載した時点から効力を生じます。</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12 }}>10. お問い合わせ窓口</h2>
      <p style={{ fontSize: 14 }}>MeHer株式会社 / plan@todokede.jp</p>

      <p style={{ fontSize: 13, color: "#666666", marginTop: 48 }}>制定日：2026年4月14日 / 最終更新日：2026年4月14日</p>
    </div>
  );
}
