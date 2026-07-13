// schema.org 構造化データ（JSON-LD）。検索・生成AIが製品と提供内容を
// 正しく解釈・引用できるようにする。サーバ描画され初期HTMLに含まれる。

const BASE = "https://plan.todokede.jp";

/** サイト共通: 組織 + ソフトウェア（製品）情報。全ページで出す。 */
export function SiteStructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${BASE}/#org`,
        name: "MeHer株式会社",
        url: "https://services.todokede.jp",
        logo: `${BASE}/logo-todokede.svg`,
      },
      {
        "@type": "WebSite",
        "@id": `${BASE}/#website`,
        url: `${BASE}/`,
        name: "トドケデ消防計画",
        inLanguage: "ja",
        publisher: { "@id": `${BASE}/#org` },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${BASE}/#app`,
        name: "トドケデ消防計画",
        url: `${BASE}/`,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description:
          "所在地と建物情報を入力するだけで、所轄消防本部の様式に沿った消防計画をWord形式で自動作成するクラウド型サービス。全国20の消防本部の様式に対応。",
        offers: {
          "@type": "Offer",
          price: "4980",
          priceCurrency: "JPY",
          description: "1件ごとの買い切り（月額・更新料なし）",
        },
        provider: { "@id": `${BASE}/#org` },
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** FAQ ページ用。表示中のFAQ（文字列回答）と一致させて渡すこと。 */
export function FaqStructuredData({ items }: { items: { q: string; a: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
