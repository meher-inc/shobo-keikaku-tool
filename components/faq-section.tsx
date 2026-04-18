"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "月額プランはいつでも解約できますか？",
    answer:
      "はい、いつでも解約可能です。解約後も契約期間の終了までサービスをご利用いただけます。違約金や解約手数料は一切かかりません。",
  },
  {
    question: "プランの途中変更はできますか？",
    answer:
      "はい、いつでもプラン変更が可能です。アップグレードの場合は即時反映、ダウングレードの場合は次回更新日から適用されます。",
  },
  {
    question: "年額プランの方がどれくらいお得ですか？",
    answer:
      "年額プランは月額プランと比較して2ヶ月分お得になります。長期的にご利用いただく場合は年額プランがおすすめです。",
  },
  {
    question: "支払い方法は何がありますか？",
    answer:
      "クレジットカード（Visa、Mastercard、JCB、American Express）に対応しています。法人のお客様は請求書払いもご利用いただけます。",
  },
  {
    question: "無料トライアルはありますか？",
    answer:
      "はい、ミニマムプランで14日間の無料トライアルをご用意しています。クレジットカード登録なしでお試しいただけます。",
  },
  {
    question: "管轄消防署が対応地域外の場合は？",
    answer:
      "現在、全国の消防署に対応しています。特殊な書式が必要な場合はサポートまでお問い合わせください。",
  },
  {
    question: "消費税は別途必要ですか？",
    answer:
      "いいえ、表示価格は全て税込価格です。追加の消費税はかかりません。",
  },
  {
    question: "法人での複数アカウント利用は？",
    answer:
      "複数事業所の管理については、将来的に法人向けプランで対応を予定しています。詳しくは support@todokede.jp までお問い合わせください。",
  },
  {
    question: "データのバックアップ・エクスポートは？",
    answer:
      "全てのデータは自動的にバックアップされています。また、いつでもPDF形式でエクスポートが可能です。解約時もデータのエクスポートをサポートいたします。",
  },
  {
    question: "既に単発で購入済みですが、どうなりますか？",
    answer:
      "単発でご購入済みのお客様には、特別な移行プランをご用意しています。詳しくはページ下部のお問い合わせよりご連絡ください。",
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
