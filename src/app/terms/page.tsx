import type { Metadata } from "next";
import { TermsContent } from "@/components/legal/TermsContent";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms and conditions governing your use of Deluxify's AI and technology services.",
};

export default function TermsPage() {
  return <TermsContent />;
}
