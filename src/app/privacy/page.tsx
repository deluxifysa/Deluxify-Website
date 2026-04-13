import type { Metadata } from "next";
import { PrivacyContent } from "@/components/legal/PrivacyContent";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Deluxify collects, uses, and protects your personal information in compliance with POPIA.",
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
