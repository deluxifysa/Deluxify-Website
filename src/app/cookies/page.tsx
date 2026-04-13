import type { Metadata } from "next";
import { CookiesContent } from "@/components/legal/CookiesContent";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How Deluxify uses cookies and similar tracking technologies on our website.",
};

export default function CookiesPage() {
  return <CookiesContent />;
}
