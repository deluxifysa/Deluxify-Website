"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GradientOrb } from "@/components/ui/GradientOrb";
import { cn } from "@/lib/utils";

type Section = {
  heading: string;
  content: React.ReactNode;
};

type Props = {
  badge: string;
  title: string;
  subtitle: string;
  lastUpdated: string;
  sections: Section[];
};

export function LegalPage({ badge, title, subtitle, lastUpdated, sections }: Props) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLight = mounted && theme === "light";

  return (
    <div className="relative min-h-screen pt-28 pb-24 overflow-hidden">
      {!isLight && (
        <GradientOrb className="-top-20 left-1/2 -translate-x-1/2" color="mixed" size="lg" />
      )}

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12"
        >
          <span
            className="section-tag mb-4 inline-flex"
            style={isLight ? {
              backgroundColor: "rgba(0,0,0,0.06)",
              color: "#0B0B0C",
              border: "1px solid rgba(0,0,0,0.18)",
            } : undefined}
          >
            {badge}
          </span>
          <h1 className={`text-4xl md:text-5xl font-bold tracking-tight mt-4 mb-4 ${isLight ? "text-black" : ""}`}>
            {title}
          </h1>
          <p className={`text-lg leading-relaxed mb-3 ${isLight ? "text-black/55" : "text-white/55"}`}>
            {subtitle}
          </p>
          <p className={`text-sm ${isLight ? "text-black/35" : "text-white/35"}`}>
            Last updated: {lastUpdated}
          </p>
        </motion.div>

        {/* Compliance badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "flex flex-wrap gap-2 mb-10 p-4 rounded-2xl",
            isLight ? "bg-black/04 border border-black/08" : "bg-white/04 border border-white/08"
          )}
        >
          {["POPIA Compliant", "CPA Aligned", "ECTA Compliant", "South African Law"].map((tag) => (
            <span
              key={tag}
              className={cn(
                "text-xs font-medium px-3 py-1 rounded-full",
                isLight
                  ? "bg-black text-white"
                  : "bg-gradient-to-r from-[#2F8F89]/20 to-[#3B82F6]/20 border border-[#3FE0D0]/20 text-[#3FE0D0]"
              )}
            >
              {tag}
            </span>
          ))}
        </motion.div>

        {/* Sections */}
        <div className="space-y-10">
          {sections.map((section, i) => (
            <motion.div
              key={section.heading}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2 className={cn(
                "text-lg font-bold mb-3 pb-2 border-b",
                isLight ? "text-black border-black/10" : "text-white border-white/10"
              )}>
                {i + 1}. {section.heading}
              </h2>
              <div className={cn(
                "text-sm leading-relaxed space-y-3",
                isLight ? "text-black/65" : "text-white/60"
              )}>
                {section.content}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact box */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={cn(
            "mt-14 p-6 rounded-2xl",
            isLight ? "bg-white border border-black/10 shadow-sm" : "glass-card"
          )}
        >
          <p className={`text-xs font-semibold uppercase tracking-widest mb-3 ${isLight ? "text-black/40" : "text-white/40"}`}>
            Questions about this document?
          </p>
          <p className={`text-sm mb-3 ${isLight ? "text-black/65" : "text-white/60"}`}>
            Contact our Information Officer at Deluxify (Pty) Ltd:
          </p>
          <div className={`text-sm space-y-1 ${isLight ? "text-black/80" : "text-white/80"}`}>
            <p><span className={isLight ? "text-black/40" : "text-white/40"}>Email: </span>
              <a href="mailto:privacy@deluxify.co.za" className={isLight ? "text-black underline" : "text-[#3FE0D0] hover:underline"}>
                privacy@deluxify.co.za
              </a>
            </p>
            <p><span className={isLight ? "text-black/40" : "text-white/40"}>Address: </span>Bloemfontein, Free State, South Africa</p>
            <p><span className={isLight ? "text-black/40" : "text-white/40"}>Regulator: </span>
              <a href="https://inforegulator.org.za" target="_blank" rel="noopener noreferrer" className={isLight ? "text-black underline" : "text-[#3FE0D0] hover:underline"}>
                Information Regulator of South Africa
              </a>
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
