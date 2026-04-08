import type { Metadata } from "next";
import { CaseStudiesHero } from "@/components/case-studies/CaseStudiesHero";
import { CaseStudiesGrid } from "@/components/case-studies/CaseStudiesGrid";
import { CTASection } from "@/components/home/CTASection";

export const metadata: Metadata = {
  title: "Case Studies: Real Results from Real South African Businesses",
  description:
    "Explore how Deluxify has transformed businesses across South Africa with AI automation, intelligent chatbots, and system integrations.",
};

export default function CaseStudiesPage() {
  return (
    <>
      <CaseStudiesHero />
      <CaseStudiesGrid />
      <CTASection />
    </>
  );
}
