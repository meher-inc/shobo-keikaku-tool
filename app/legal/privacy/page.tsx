import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー | トドケデ消防計画",
};

const h2style = { fontSize: 20, fontWeight: 700 as const, marginTop: 40, marginBottom: 12 };
const h3style = { fontSize: 16, fontWeight: 600 as const, marginTop: 24, marginBottom: 8 };
const pstyle = { fontSize: 14 };
const ulstyle = { fontSize: 14, paddingLeft: 20 };
const olstyle = { fontSize: 14, paddingLeft: 20 };
const thstyle = { padding: "10px 16px", textAlign: "left" as const, fontWeight: 600, background: "#f9f9f9", borderBottom: "1px solid #e5e5e5" };
const tdstyle = { padding: "10px 16px", borderBottom: "1px solid #e5e5e5", fontSize: 14 };
const tablestyle = { width: "100%", borderCollapse: "collapse" as const, margin: "16px 0" };

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px 96px", lineHeight: 1.8, color: "#1A1A1A" }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 32, letterSpacing: "-0.01em" }}>
        プライバシーポリシー
      </h1>

      <p style={pstyle}>
        MeHer株式会社（以下「当社」といいます）は、当社が運営する「トドケデ消防計画」（以下「本サービス」といいます）におけるお客様の個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」といいます）を定めます。
      </p>

      <h2 style={h2style}>1. 個人情報の定義</h2>
      <p style={pstyle}>
        本ポリシーにおいて「個人情報」とは、個人情報の保護に関する法律（以下「個人情報保護法」といいます）に定める個人情報、すなわち生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日その他の記述等により特定の個人を識別することができるもの、または個人識別符号が含まれるものをいいます。
      </p>

      <h2 style={h2style}>2. 取得する個人情報の項目</h2>
      <p style={pstyle}>当社は、本サービスの提供にあたり、お客様から以下の情報を取得します。</p>

      <h3 style={h3style}>2.1 お客様から直接ご提供いただく情報</h3>
      <ul style={ulstyle}>
        <li>氏名、会社名、部署名</li>
        <li>メールアドレス</li>
        <li>事業所の住所、電話番号</li>
        <li>消防計画作成に必要な事業所情報（業種、建物情報、防火管理者情報、消防設備情報等）</li>
        <li>クレジットカード情報（決済代行会社Stripeが取得し、当社はトークン化された情報のみを保持します）</li>
      </ul>

      <h3 style={h3style}>2.2 自動的に取得する情報</h3>
      <ul style={ulstyle}>
        <li>IPアドレス</li>
        <li>ブラウザ種別、OS種別</li>
        <li>本サービスの利用履歴、アクセスログ</li>
        <li>Cookieおよびこれに類する技術によって取得される情報</li>
      </ul>

      <h2 style={h2style}>3. 個人情報の利用目的</h2>
      <p style={pstyle}>当社は、取得した個人情報を以下の目的で利用します。</p>
      <ol style={olstyle}>
        <li>本サービスの提供、運営、維持、改善のため</li>
        <li>本サービスに関する各種ご連絡、お知らせのため</li>
        <li>お問い合わせへの対応のため</li>
        <li>利用料金の請求、決済のため</li>
        <li>本サービスに関する新機能、新サービス、法改正情報等のご案内のため</li>
        <li>本サービスの利用状況の統計分析、品質向上のため</li>
        <li>利用規約に違反する行為への対応のため</li>
        <li>その他、本サービスに付随する業務のため</li>
      </ol>

      <h2 style={h2style}>4. 個人情報の第三者提供</h2>
      <p style={pstyle}>当社は、次に掲げる場合を除いて、あらかじめお客様の同意を得ることなく、第三者に個人情報を提供することはありません。</p>
      <ol style={olstyle}>
        <li>法令に基づく場合</li>
        <li>人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき</li>
        <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき</li>
        <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき</li>
      </ol>

      <h2 style={h2style}>5. 個人情報の取扱いの委託</h2>
      <p style={pstyle}>当社は、利用目的の達成に必要な範囲内において、個人情報の取扱いの全部または一部を第三者に委託することがあります。この場合、委託先との間で個人情報の取扱いに関する契約を締結するなど、委託先の適切な監督を行います。</p>
      <p style={pstyle}>主な委託先：</p>
      <ul style={ulstyle}>
        <li>Stripe, Inc.（決済処理）</li>
        <li>Supabase Inc.（データベース運用）</li>
        <li>Vercel Inc.（アプリケーションホスティング）</li>
        <li>Resend, Inc.（メール配信）</li>
        <li>Google LLC（ウェブサイトのアクセス解析、広告効果測定／Google Analytics 4、Google Adsコンバージョントラッキング）</li>
      </ul>

      <h2 style={h2style}>6. 個人情報の国外移転</h2>
      <p style={pstyle}>前条に定める委託先は、いずれも日本国外に拠点を有する事業者であり、当社がこれらの委託先に個人情報の取扱いを委託することにより、お客様の個人情報が以下の国または地域に移転されます。</p>
      <table style={tablestyle}>
        <thead>
          <tr>
            <th style={thstyle}>委託先</th>
            <th style={thstyle}>移転先の国・地域</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style={tdstyle}>Stripe, Inc.</td><td style={tdstyle}>アメリカ合衆国</td></tr>
          <tr><td style={tdstyle}>Supabase Inc.</td><td style={tdstyle}>アメリカ合衆国（一部シンガポール）</td></tr>
          <tr><td style={tdstyle}>Vercel Inc.</td><td style={tdstyle}>アメリカ合衆国</td></tr>
          <tr><td style={tdstyle}>Resend, Inc.</td><td style={tdstyle}>アメリカ合衆国</td></tr>
          <tr><td style={tdstyle}>Google LLC</td><td style={tdstyle}>アメリカ合衆国</td></tr>
        </tbody>
      </table>
      <p style={pstyle}>当社は、これらの国における個人情報保護に関する制度について合理的な情報を収集するとともに、各委託先との契約において、日本の個人情報保護法に準じた適切な安全管理措置が講じられていることを確認したうえで委託を行っています。</p>
      <p style={pstyle}>各国の個人情報保護制度に関する詳細は、個人情報保護委員会の公表資料をご参照ください。</p>

      <h2 style={h2style}>7. 個人情報の安全管理</h2>
      <p style={pstyle}>当社は、個人情報への不正アクセス、紛失、破壊、改ざん、漏洩等を防止するため、適切な安全管理措置を講じます。</p>

      <h2 style={h2style}>8. 個人情報の保存期間</h2>
      <p style={pstyle}>当社は、利用目的の達成に必要な期間に限り個人情報を保有し、以下に定める期間が経過した後は、遅滞なく消去または匿名化します。</p>
      <table style={tablestyle}>
        <thead>
          <tr>
            <th style={thstyle}>対象</th>
            <th style={thstyle}>保存期間</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style={tdstyle}>契約中のアカウント情報・事業所情報</td><td style={tdstyle}>契約期間中（常時保存）</td></tr>
          <tr><td style={tdstyle}>解約後のアカウント情報</td><td style={tdstyle}>解約日から3年間</td></tr>
          <tr><td style={tdstyle}>決済関連記録（領収書・請求記録等）</td><td style={tdstyle}>取引完了日から7年間（法人税法等に基づく帳簿保存義務）</td></tr>
          <tr><td style={tdstyle}>お問い合わせ履歴</td><td style={tdstyle}>対応完了日から3年間</td></tr>
        </tbody>
      </table>
      <p style={pstyle}>ただし、法令に基づく保存義務がある場合、または紛争対応等の正当な理由がある場合は、当該目的が達成されるまでの間、上記期間を超えて保存することがあります。</p>

      <h2 style={h2style}>9. 個人情報の開示、訂正、利用停止、削除</h2>
      <p style={pstyle}>お客様は、当社に対して、ご自身の個人情報の開示、訂正、追加、削除、利用停止、第三者提供の停止を請求することができます。ご請求は、本ポリシー末尾のお問い合わせ先までお申し出ください。</p>

      <h2 style={h2style}>10. Cookieおよび外部送信について</h2>
      <p style={pstyle}>当社は、本サービスの提供・改善のため、以下のCookieおよび外部送信（情報収集モジュール）を利用しています。本サービスをご利用いただく際、お客様のブラウザから以下の事業者へ情報が送信される場合があります。</p>

      <h3 style={h3style}>10.1 Google Analytics 4</h3>
      <ul style={ulstyle}>
        <li>送信先：Google LLC（米国）</li>
        <li>送信される情報：ページURL、リファラー、デバイス・ブラウザ情報、IPアドレス、Cookie識別子（クライアントID）</li>
        <li>利用目的：ウェブサイトの利用状況の分析、サービスの改善</li>
        <li>
          詳細・オプトアウト：
          <a href="https://policies.google.com/technologies/partner-sites?hl=ja" target="_blank" rel="noopener noreferrer">https://policies.google.com/technologies/partner-sites?hl=ja</a>
          （Google Analyticsオプトアウトアドオン：
          <a href="https://tools.google.com/dlpage/gaoptout?hl=ja" target="_blank" rel="noopener noreferrer">https://tools.google.com/dlpage/gaoptout?hl=ja</a>
          ）
        </li>
      </ul>

      <h3 style={h3style}>10.2 Google Adsコンバージョントラッキング</h3>
      <ul style={ulstyle}>
        <li>送信先：Google LLC（米国）</li>
        <li>送信される情報：広告クリック後の購入完了情報、購入金額、取引ID、Cookie識別子</li>
        <li>利用目的：広告効果の測定および最適化</li>
        <li>
          詳細・オプトアウト：
          <a href="https://policies.google.com/privacy?hl=ja" target="_blank" rel="noopener noreferrer">https://policies.google.com/privacy?hl=ja</a>
          （広告のパーソナライズ設定：
          <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer">https://adssettings.google.com/</a>
          ）
        </li>
      </ul>

      <h3 style={h3style}>10.3 オプトアウトの方法</h3>
      <p style={pstyle}>上記のCookieおよび情報送信を停止したい場合は、ブラウザの設定（第三者Cookieのブロック等）または上記リンクのオプトアウト手段をご利用ください。</p>

      <h2 style={h2style}>11. プライバシーポリシーの変更</h2>
      <p style={pstyle}>当社は、法令の変更または事業上の必要に応じて、本ポリシーを変更することがあります。変更後のプライバシーポリシーは、本サイト上に掲載した時点から効力を生じるものとします。</p>

      <h2 style={h2style}>12. お問い合わせ窓口</h2>
      <p style={pstyle}>本ポリシーに関するお問い合わせ、個人情報の取扱いに関するご請求等は、以下の窓口までご連絡ください。</p>
      <p style={pstyle}>MeHer株式会社<br />メールアドレス：plan@todokede.jp</p>

      <p style={{ fontSize: 13, color: "#666666", marginTop: 48 }}>制定日：2026年4月14日 / 最終更新日：2026年4月19日</p>
    </div>
  );
}
