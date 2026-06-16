"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "料金は月額ですか？買い切りですか？",
    answer:
      "1件ごとの都度払い（買い切り）です。月額料金・更新料はかかりません。消防計画が必要になったときに、必要な分だけお支払いいただけます。",
  },
  {
    question: "プランはどう選べばいいですか？",
    answer:
      "迷ったらスタンダード（¥9,800）がおすすめです。消防計画本体に加えて別表すべてと記入ガイドPDFが付きます。プレミアム（¥29,800）は元消防士による内容チェックと修正1回対応が付き、「一発で通したい」方向けです。",
  },
  {
    question: "支払い方法は何がありますか？",
    answer:
      "クレジットカード（Visa、Mastercard、JCB、American Express）に対応しています。決済はStripeを通じて安全に処理されます。",
  },
  {
    question: "領収書は発行できますか？",
    answer:
      "決済完了時にStripeから自動で領収書が発行されます。会社名が必要な場合は決済画面で入力いただけます。別途MeHer株式会社発行の領収書が必要な場合は plan@todokede.jp までご連絡ください。",
  },
  {
    question: "対応している消防本部を教えてください。",
    answer:
      "現在は東京消防庁・大阪市消防局・横浜市消防局・名古屋市消防局・京都市消防局・福岡市消防局・札幌市消防局・川崎市消防局・神戸市消防局・さいたま市消防局・広島市消防局・仙台市消防局・千葉市消防局・北九州市消防局・新潟市消防局・熊本市消防局・相模原市消防局に正式対応しています。政令指定都市の様式に順次対応を進めています。対応エリア外は標準様式で出力されますので、ご利用前に管轄消防署の様式と照合することをお勧めします。",
  },
  {
    question: "消費税は別途必要ですか？",
    answer:
      "いいえ、表示価格は全て税込価格です。追加の消費税はかかりません。",
  },
  {
    question: "出力形式はWordですか？PDFですか？",
    answer:
      "Word形式（.docx）で出力されます。提出前に建物固有の情報を追記・修正してそのまま編集できます。印刷するだけの方はWordで開いてPDF保存してください。",
  },
  {
    question: "返金は可能ですか？",
    answer:
      "出力された消防計画の内容に不備があった場合は、内容確認のうえ返金または再発行で対応いたします。「出力したが使わなかった」という理由での返金はお断りしています。",
  },
  {
    question: "決済後にダウンロードし忘れました。再ダウンロードできますか？",
    answer:
      "決済完了メールに記載されたURLから再度アクセスできます。リンクが無効になっている場合は、決済時のメールアドレスを添えて plan@todokede.jp までご連絡ください。",
  },
]

export function FAQSection() {
  return (
    <section className="bg-white px-4 py-20 md:px-8">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-12 text-center text-2xl font-bold text-gray-900">
          よくあるご質問
        </h2>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-gray-900 hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
