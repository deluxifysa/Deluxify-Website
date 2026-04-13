import type { Metadata } from "next";
import { CareersHero } from "@/components/careers/CareersHero";
import { CareersValues } from "@/components/careers/CareersValues";
import { CareersOpenRoles } from "@/components/careers/CareersOpenRoles";
import { CTASection } from "@/components/home/CTASection";

export const metadata: Metadata = {
  title: "Careers: Join the Deluxify Team",
  description:
    "Help us build the AI-powered future of African business. Explore open roles at Deluxify — a fast-moving team doing serious work.",
};

export default function CareersPage() {
  return (
    <>
      <CareersHero />
      <CareersValues />
      <CareersOpenRoles />
      <CTASection />
    </>
  );
}
