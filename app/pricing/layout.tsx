import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "料金プラン | トドケデ消防計画",
  description:
    "1件4,980円（税込）〜の買い切りで、月額料金・更新料はありません。全国20消防本部の様式に対応した、元消防士が設計する消防計画のクラウド型サービスです。",
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
