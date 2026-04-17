"use client"

import { useState } from "react"
import { HeroSection } from "@/components/hero-section"
import { PricingToggle } from "@/components/pricing-toggle"
import { PricingCards } from "@/components/pricing-cards"
import { FeatureTable } from "@/components/feature-table"
import { FAQSection } from "@/components/faq-section"
import { FooterSection } from "@/components/footer-section"

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <main className="min-h-screen bg-gray-50">
      <HeroSection />
      <PricingToggle isYearly={isYearly} setIsYearly={setIsYearly} />
      <PricingCards isYearly={isYearly} />
      <FeatureTable />
      <FAQSection />
      <FooterSection />
    </main>
  )
}
