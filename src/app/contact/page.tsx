import type { Metadata } from "next";
import { ContactHero } from "@/components/contact/ContactHero";
import { ContactSection } from "@/components/contact/ContactSection";

export const metadata: Metadata = {
  title: "Contact: Book a Strategy Call",
  description:
    "Ready to transform your business with AI? Contact Deluxify to book a free demo, get a quote, or speak to an AI strategist today.",
};

export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <ContactSection />
    </>
  );
}
