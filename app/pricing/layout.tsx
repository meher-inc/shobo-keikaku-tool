import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "料金プラン | トドケデ消防計画",
  description:
    "年額¥49,800のミニマムプラン、年額¥98,000のスタンダードプラン。元消防士が設計した消防計画クラウドサービス。",
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
