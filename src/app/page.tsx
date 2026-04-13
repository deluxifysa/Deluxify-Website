import type { Metadata } from "next";
import { MorphPanel } from "@/components/ui/ai-input";
import { HeroSection } from "@/components/home/HeroSection";
import { LogoStrip } from "@/components/home/LogoStrip";
import { StatsSection } from "@/components/home/StatsSection";
import { ServicesOverview } from "@/components/home/ServicesOverview";
import { HowItWorks } from "@/components/home/HowItWorks";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { PricingSection } from "@/components/home/PricingSection";
import { CodeShowcase } from "@/components/home/CodeShowcase";
import { FAQSection } from "@/components/home/FAQSection";
import { CTASection } from "@/components/home/CTASection";

export const metadata: Metadata = {
  title: "Deluxify: AI, Technology and Automation",
  description:
    "Transform your business with AI automation, intelligent chatbots, and seamless integrations. South Africa's #1 AI solutions company.",
};

export default function HomePage() {
  return (
    <>
      <div className="fixed bottom-0 right-0 z-50">
        <MorphPanel />
      </div>
      <HeroSection />
      <LogoStrip />
      <StatsSection />
      <ServicesOverview />
      <HowItWorks />
      <TestimonialsSection />
      <PricingSection />
      <CodeShowcase />
      <FAQSection />
      <CTASection />
    </>
  );
}
