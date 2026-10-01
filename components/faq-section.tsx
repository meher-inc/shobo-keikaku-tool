"use client"

import { FaqStructuredData } from "./StructuredData"
import { FaqAnswer } from "./faq-answer"
import { PLAN_SELECTION_FAQ, PREMIUM_FAQS, type FaqItem } from "../lib/premium-faqs"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs: FaqItem[] = [
  {
    q: "料金は月額ですか？買い切りですか？",
    a:
      "1件ごとの都度払い（買い切り）です。月額料金・更新料はかかりません。消防計画が必要になったときに、必要な分だけお支払いいただけます。",
  },
  { ...PLAN_SELECTION_FAQ, q: "プランはどう選べばいいですか？" },
  ...PREMIUM_FAQS,
  {
    q: "支払い方法は何がありますか？",
    a:
      "クレジットカード（Visa、Mastercard、JCB、American Express）に対応しています。決済はStripeを通じて安全に処理されます。",
  },
  {
    q: "領収書は発行できますか？",
    a:
      "決済完了時にStripeから自動で領収書が発行されます。会社名が必要な場合は決済画面で入力いただけます。別途MeHer株式会社発行の領収書が必要な場合は plan@todokede.jp までご連絡ください。",
  },
  {
    q: "対応している消防本部を教えてください。",
    a:
      "現在は東京消防庁・大阪市消防局・堺市消防局・岡山市消防局・横浜市消防局・名古屋市消防局・京都市消防局・福岡市消防局・札幌市消防局・川崎市消防局・神戸市消防局・さいたま市消防局・広島市消防局・仙台市消防局・千葉市消防局・北九州市消防局・新潟市消防局・熊本市消防局・相模原市消防局・静岡市消防局に正式対応しています。政令指定都市の様式に順次対応を進めています。対応エリア外は標準様式で出力されますので、ご利用前に管轄消防署の様式と照合することをお勧めします。",
  },
  {
    q: "消費税は別途必要ですか？",
    a:
      "いいえ、表示価格は全て税込価格です。追加の消費税はかかりません。",
  },
  {
    q: "出力形式はWordですか？PDFですか？",
    a:
      "Word形式（.docx）で出力されます。提出前に建物固有の情報を追記・修正してそのまま編集できます。印刷するだけの方はWordで開いてPDF保存してください。",
  },
  {
    q: "返金は可能ですか？",
    a:
      "出力された消防計画の内容に不備があった場合は、内容確認のうえ返金または再発行で対応いたします。「出力したが使わなかった」という理由での返金はお断りしています。",
  },
  {
    q: "決済後にダウンロードし忘れました。再ダウンロードできますか？",
    a:
      "決済完了メールに記載されたURLから再度アクセスできます。リンクが無効になっている場合は、決済時のメールアドレスを添えて plan@todokede.jp までご連絡ください。",
  },
]

export function FAQSection() {
  return (
    <>
      <FaqStructuredData items={faqs} />
      <section className="bg-white px-4 py-20 md:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-12 text-center text-2xl font-bold text-gray-900">
            よくあるご質問
          </h2>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-gray-900 hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  <FaqAnswer item={faq} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </>
  )
}
