"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import LogoLoop from "@/components/ui/LogoLoop";
import {
  SiOpenai, SiGoogle, SiMeta, SiSalesforce, SiHubspot,
  SiShopify, SiSlack, SiStripe, SiZapier, SiNotion,
  SiWoocommerce, SiXero, SiMailchimp, SiTwilio,
} from "react-icons/si";

const logos = [
  { node: <SiOpenai />,      title: "OpenAI" },
  { node: <SiGoogle />,      title: "Google" },
  { node: <SiMeta />,        title: "Meta" },
  { node: <SiSalesforce />,  title: "Salesforce" },
  { node: <SiHubspot />,     title: "HubSpot" },
  { node: <SiShopify />,     title: "Shopify" },
  { node: <SiSlack />,       title: "Slack" },
  { node: <SiStripe />,      title: "Stripe" },
  { node: <SiZapier />,      title: "Zapier" },
  { node: <SiNotion />,      title: "Notion" },
  { node: <SiWoocommerce />, title: "WooCommerce" },
  { node: <SiXero />,        title: "Xero" },
  { node: <SiMailchimp />,   title: "Mailchimp" },
  { node: <SiTwilio />,      title: "Twilio" },
];

export function LogoStrip() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isLight = mounted && theme === "light";

  return (
    <section
      className={`py-14 border-y overflow-hidden transition-colors duration-300 ${
        isLight
          ? "border-black/[0.08] bg-white/60"
          : "border-white/5 bg-surface-900/30"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
        <p
          className={`text-sm font-medium uppercase tracking-widest ${
            isLight ? "text-black/70" : "text-white/30"
          }`}
        >
          Integrates with the tools your business already uses
        </p>
      </div>
      <LogoLoop
        logos={logos}
        speed={60}
        direction="left"
        logoHeight={32}
        gap={56}
        hoverSpeed={0}
        scaleOnHover
        fadeOut
        fadeOutColor={isLight ? "#F8F8F8" : "#0B0B0C"}
        ariaLabel="Technology integrations"
        className={isLight ? "text-black/80" : "text-white/30"}
      />
    </section>
  );
}
