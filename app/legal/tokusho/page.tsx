import type { Metadata } from "next";
import styles from "./tokusho.module.css";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記 | トドケデ消防計画",
  description:
    "トドケデ消防計画の特定商取引法に基づく表記です。販売価格、支払方法、解約方法等をご確認いただけます。",
  robots: { index: false },
};

export default function TokushoPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>特定商取引法に基づく表記</h1>
        <p className={styles.updated}>最終更新日: 2026年4月25日</p>
      </header>

      <Section heading="販売業者">
        <p>
          MeHer株式会社
          <br />
          <span className={styles.note}>
            ※2026年11月中に「株式会社トドケデ」へ商号変更予定
          </span>
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
          <a href="mailto:support@todokede.jp">support@todokede.jp</a>
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

        <h3 className={styles.sub}>月額プラン</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>プラン</th>
              <th className={styles.priceHeader}>月額（税込）</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>ミニマム</td><td className={styles.price}>¥4,980</td></tr>
            <tr><td>スタンダード</td><td className={styles.price}>¥9,800</td></tr>
            <tr><td>プロ</td><td className={styles.price}>¥19,800</td></tr>
          </tbody>
        </table>

        <h3 className={styles.sub}>年額プラン（2ヶ月分お得）</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>プラン</th>
              <th className={styles.priceHeader}>年額（税込）</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>ミニマム</td><td className={styles.price}>¥49,800</td></tr>
            <tr><td>スタンダード</td><td className={styles.price}>¥98,000</td></tr>
            <tr><td>プロ</td><td className={styles.price}>¥198,000</td></tr>
          </tbody>
        </table>

        <div className={styles.campaign}>
          <p className={styles.campaignTitle}>
            既存顧客限定移行プラン（キャンペーン期間限定）
          </p>
          <p>
            2026年5月1日までに単発購入（¥9,800）された方は、以下のいずれかをお選びいただけます。
          </p>
          <ul className={styles.campaignList}>
            <li>
              <strong>初月無料スタンダード</strong>: 初月 ¥0、2ヶ月目以降 月額 ¥9,800（税込）
            </li>
            <li>
              <strong>年額特別プラン</strong>: スタンダード年額 ¥69,800（税込、通常¥98,000から約3割引）
            </li>
          </ul>
          <p className={styles.campaignPeriod}>
            キャンペーン期間: 移行案内送信日から2週間
          </p>
        </div>
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
        <h3 className={styles.sub}>月額プラン</h3>
        <dl className={styles.detail}>
          <dt>初回</dt>
          <dd>お申込み手続き完了時に即時決済</dd>
          <dt>2回目以降</dt>
          <dd>毎月の契約更新日に自動決済</dd>
        </dl>

        <h3 className={styles.sub}>年額プラン</h3>
        <dl className={styles.detail}>
          <dt>初回</dt>
          <dd>お申込み手続き完了時に一括決済</dd>
          <dt>更新時</dt>
          <dd>1年後の契約更新日に一括自動決済</dd>
        </dl>

        <h3 className={styles.sub}>
          既存顧客移行プラン「初月無料スタンダード」の場合
        </h3>
        <dl className={styles.detail}>
          <dt>初回決済</dt>
          <dd>¥0（決済手続きのみ実行、課金はなし）</dd>
          <dt>2回目以降</dt>
          <dd>申込日の翌月同日より月額 ¥9,800（税込）を自動決済</dd>
        </dl>
      </Section>

      <Section heading="役務の提供時期">
        <p>決済完了後、ただちにサービスのご利用が可能になります。</p>
      </Section>

      <Section heading="自動更新について">
        <p>
          本サービスは
          <strong>継続課金型のサブスクリプションサービス</strong>
          です。お客様からの解約手続きがない限り、契約は自動的に更新されます。
        </p>
        <ul className={styles.list}>
          <li>月額プラン: 毎月の契約更新日に自動更新</li>
          <li>年額プラン: 1年後の契約更新日に自動更新</li>
        </ul>
      </Section>

      <Section heading="解約方法">
        <p>
          <a href="/mypage">マイページ</a>
          または Stripe カスタマーポータルから、いつでも解約手続きが可能です。
        </p>
        <ul className={styles.list}>
          <li>
            解約手続き完了後、
            <strong>次回の契約更新日をもって課金が停止</strong>されます
          </li>
          <li>
            解約手続き後も、現在の契約期間満了までは引き続きサービスをご利用いただけます
          </li>
        </ul>
      </Section>

      <Section heading="返金について">
        <p>
          役務の性質上、
          <strong>
            原則として既にお支払いいただいた料金の返金は承っておりません。
          </strong>
        </p>
        <p>
          ただし、以下のいずれかに該当する場合は、個別にご相談のうえ対応いたします。
        </p>
        <ul className={styles.listDash}>
          <li>当社の重大なシステム障害により、相当期間サービスをご利用いただけなかった場合</li>
          <li>当社に明らかな帰責事由がある場合</li>
          <li>その他、消費者契約法等の法令により返金が必要と判断される場合</li>
        </ul>
        <h3 className={styles.sub}>日割り計算について</h3>
        <p>
          月の途中で解約された場合でも、
          <strong>日割り計算による返金は行っておりません</strong>
          。次回更新日までは引き続きサービスをご利用いただけます。
        </p>
      </Section>

      <Section heading="最低利用期間">
        <p>設定しておりません。月額プランは解約手続き後、次回更新日をもって終了いたします。</p>
      </Section>

      <Section heading="プラン変更について">
        <p>
          <a href="/mypage">マイページ</a>
          または Stripe カスタマーポータルから、いつでもプラン変更が可能です。
        </p>
        <ul className={styles.list}>
          <li>
            <strong>アップグレード</strong>（例: ミニマム → スタンダード）:
            変更時点で差額を日割り計算して即時適用
          </li>
          <li>
            <strong>ダウングレード</strong>（例: スタンダード → ミニマム）:
            次回更新日から新プラン適用
          </li>
        </ul>
      </Section>

      <Section heading="動作環境">
        <p>以下のブラウザの最新版を推奨いたします。</p>
        <ul className={styles.list}>
          <li>Google Chrome</li>
          <li>Safari</li>
          <li>Microsoft Edge</li>
          <li>Firefox</li>
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
