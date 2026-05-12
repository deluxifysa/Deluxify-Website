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
  { node: <SiOpenai />,      title: "Motaung Electrical" },
  { node: <SiGoogle />,      title: "Coastal Pharmacy" },
  { node: <SiMeta />,        title: "DuPlessis Logistics" },
  { node: <SiSalesforce />,  title: "Ayesha's Boutique" },
  { node: <SiHubspot />,     title: "Fynbos Accounting" },
  { node: <SiShopify />,     title: "Cape Print Co." },
  { node: <SiSlack />,       title: "Joburg Legal Assist" },
  { node: <SiStripe />,      title: "Ndlovu Consulting" },
  { node: <SiZapier />,      title: "Motaung Electrical" },
  { node: <SiNotion />,      title: "Coastal Pharmacy" },
  { node: <SiWoocommerce />, title: "DuPlessis Logistics" },
  { node: <SiXero />,        title: "Fynbos Accounting" },
  { node: <SiMailchimp />,   title: "Cape Print Co." },
  { node: <SiTwilio />,      title: "Ndlovu Consulting" },
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
          Trusted by growing South African businesses
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
