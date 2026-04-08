import type { Metadata } from "next";
import { ServicesHero } from "@/components/services/ServicesHero";
import { ServiceDetail } from "@/components/services/ServiceDetail";
import { CTASection } from "@/components/home/CTASection";

export const metadata: Metadata = {
  title: "Services: AI, Development, Marketing and Infrastructure",
  description:
    "Explore Deluxify's full suite of AI services: workflow automation, intelligent chatbots, system integrations, and AI consulting for South African businesses.",
};

export default function ServicesPage() {
  return (
    <>
      <ServicesHero />
      <ServiceDetail />
      <CTASection />
    </>
  );
}
