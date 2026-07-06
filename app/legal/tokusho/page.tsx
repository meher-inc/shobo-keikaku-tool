import type { Metadata } from "next";
import styles from "./tokusho.module.css";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記 | トドケデ消防計画",
  description:
    "トドケデ消防計画の特定商取引法に基づく表記です。販売価格、支払方法、返品・キャンセル等をご確認いただけます。",
  robots: { index: false },
};

export default function TokushoPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>特定商取引法に基づく表記</h1>
        <p className={styles.updated}>最終更新日: 2026年6月16日</p>
      </header>

      <Section heading="販売業者">
        <p>
          MeHer株式会社
        </p>
      </Section>

      <Section heading="運営統括責任者">
        <p>丸岡　峻</p>
      </Section>

      <Section heading="所在地">
        <p>
          〒600-8223
          <br />
          京都府京都市下京区七条通油小路東入大黒町227番地 第2キョートビル402
        </p>
      </Section>

      <Section heading="電話番号">
        <p>
          お客様からのご請求があった場合、遅滞なく開示いたします。
          <br />
          お問い合わせは下記メールアドレスまたはお問い合わせフォームよりお願いいたします。
        </p>
      </Section>

      <Section heading="メールアドレス">
        <p>
          <a href="mailto:plan@todokede.jp">plan@todokede.jp</a>
        </p>
      </Section>

      <Section heading="お問い合わせフォーム">
        <p>
          <a href="https://todokede.jp/contact">https://todokede.jp/contact</a>
        </p>
      </Section>

      <Section heading="適格請求書発行事業者登録番号">
        <p>T7130001074767</p>
      </Section>

      <Section heading="サービス名">
        <p>
          トドケデ消防計画（
          <a href="https://plan.todokede.jp">https://plan.todokede.jp</a>）
        </p>
      </Section>

      <Section heading="販売価格">
        <p>
          すべて<strong>税込</strong>価格で表示しています。
        </p>

        <p className={styles.note}>
          料金は1件ごとの都度払い（買い切り）です。月額料金・更新料はありません。
        </p>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>プラン</th>
              <th className={styles.priceHeader}>販売価格（税込・1件あたり）</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>ライト</td><td className={styles.price}>¥4,980</td></tr>
            <tr><td>スタンダード</td><td className={styles.price}>¥9,800</td></tr>
            <tr><td>プレミアム</td><td className={styles.price}>¥29,800</td></tr>
          </tbody>
        </table>
      </Section>

      <Section heading="商品代金以外の必要料金">
        <p><strong>なし</strong></p>
        <p>表示価格には消費税が含まれています。それ以外の追加料金は発生しません。</p>
        <p className={styles.note}>
          ※インターネット接続料金、通信費、パソコン・スマートフォン等の機器費用はお客様のご負担となります。
        </p>
      </Section>

      <Section heading="支払方法">
        <p>クレジットカード決済（Stripe 経由）</p>
        <div className={styles.cards}>
          {["Visa", "Mastercard", "JCB", "American Express", "Diners Club"].map(
            (brand) => (
              <span key={brand} className={styles.cardBadge}>
                {brand}
              </span>
            )
          )}
        </div>
        <p className={styles.note}>
          ※請求書払い・銀行振込は現時点では対応しておりません（将来的な対応を検討中）
        </p>
      </Section>

      <Section heading="支払時期">
        <p>お申込み手続き完了時に、1件ごとに即時決済されます（都度払い・買い切り）。</p>
      </Section>

      <Section heading="役務の提供時期">
        <p>決済完了後、ただちに消防計画ファイルを生成・ダウンロードいただけます。</p>
      </Section>

      <Section heading="申込みのキャンセル・返品について">
        <p>
          本サービスは、決済完了後ただちに消防計画ファイル（デジタルデータ）を生成・提供する役務です。その性質上、
          <strong>データ生成後のキャンセル・返品は承っておりません。</strong>
          決済完了前であれば、ブラウザを閉じることでお申込みを中止いただけます。
        </p>
        <p>
          ただし、生成された消防計画の内容に不備があった場合は、内容を確認のうえ
          <strong>返金または再発行</strong>で対応いたします。お客様のご都合（出力後に使用しなかった等）による返金は承っておりません。
        </p>
        <p>このほか、以下のいずれかに該当する場合は、個別にご相談のうえ対応いたします。</p>
        <ul className={styles.listDash}>
          <li>当社の重大なシステム障害により、相当期間サービスをご利用いただけなかった場合</li>
          <li>当社に明らかな帰責事由がある場合</li>
          <li>その他、消費者契約法等の法令により返金が必要と判断される場合</li>
        </ul>
      </Section>

      <Section heading="動作環境">
        <p>以下のブラウザの最新版を推奨いたします。</p>
        <ul className={styles.list}>
          <li>Google Chrome</li>
          <li>Safari</li>
          <li>Microsoft Edge</li>
          <li>Firefox</li>
          <li>Microsoft Word（生成された消防計画ファイルの閲覧・編集に使用）</li>
        </ul>
        <p className={styles.note}>
          ※Internet Explorer はサポート対象外です。
          <br />
          ※JavaScript および Cookie を有効にしてご利用ください。
        </p>
      </Section>

      <Section heading="販売数量">
        <p>特段の制限はありません。</p>
      </Section>

      <Section heading="特約事項">
        <p>
          本表記は特定商取引法に基づく法定表記です。サービスのご利用にあたっては、別途定める
          <a href="/legal/terms">利用規約</a>および
          <a href="/legal/privacy">プライバシーポリシー</a>
          も併せてご確認ください。
        </p>
      </Section>

      <Section heading="表記の変更について">
        <p>
          本表記の内容は、法令の改正・サービス内容の変更等により予告なく変更することがあります。変更後の内容は本ページに掲載した時点で効力を生じるものとします。
        </p>
      </Section>

      <footer className={styles.footer}>
        <p>&copy; 2026 MeHer株式会社</p>
        <div className={styles.footerLinks}>
          <a href="/legal/terms">利用規約</a>
          <a href="/legal/privacy">プライバシーポリシー</a>
          <a href="https://todokede.jp/contact">お問い合わせ</a>
        </div>
      </footer>
    </main>
  );
}

function Section({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionHeading}>{heading}</h2>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}
