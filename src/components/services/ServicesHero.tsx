"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { GradientOrb } from "@/components/ui/GradientOrb";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ServicesHero() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLight = mounted && theme === "light";

  return (
    <section className="relative pt-32 pb-16 overflow-hidden">
      {!isLight && <GradientOrb className="-top-20 left-1/2 -translate-x-1/2" color="blue" size="lg" />}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span
            className="section-tag mb-6 mx-auto"
            style={isLight ? {
              backgroundColor: "rgba(0,0,0,0.06)",
              color: "#0B0B0C",
              border: "1px solid rgba(0,0,0,0.18)",
            } : undefined}
          >
            <Sparkles className="w-3 h-3" />
            Our Services
          </span>
          <h1 className={`text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-balance ${isLight ? "text-black" : ""}`}>
            Every service your business needs{" "}
            <span className={isLight ? "text-black" : "gradient-text"}>under one roof.</span>
          </h1>
          <p className={`text-lg md:text-xl max-w-3xl mx-auto leading-relaxed ${isLight ? "text-black/55" : "text-white/60"}`}>
            AI and automation. Custom development. Digital marketing. Managed infrastructure.
            One premium partner. fully accountable for your results.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
