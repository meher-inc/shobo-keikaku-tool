import { HeroSection } from "@/components/hero-section"
import { PricingCards } from "@/components/pricing-cards"
import { FeatureTable } from "@/components/feature-table"
import { FAQSection } from "@/components/faq-section"
import { FooterSection } from "@/components/footer-section"

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <HeroSection />
      <PricingCards />
      <FeatureTable />
      <FAQSection />
      <FooterSection />
    </main>
  )
}
