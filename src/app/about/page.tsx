import type { Metadata } from "next";
import { AboutSection } from "@/components/about/AboutSection";
import { CTASection } from "@/components/home/CTASection";

export const metadata: Metadata = {
  title: "About Us: The Team Behind Deluxify",
  description:
    "Learn about Deluxify's mission to empower African businesses with cutting-edge AI, and meet the team making it happen.",
};

export default function AboutPage() {
  return (
    <>
      <AboutSection />
      <CTASection />
    </>
  );
}
