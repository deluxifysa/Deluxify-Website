"use client";

import { motion } from "framer-motion";
import { GradientOrb } from "@/components/ui/GradientOrb";
import { BarChart3 } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function CaseStudiesHero() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLight = mounted && theme === "light";

  return (
    <section className="relative pt-32 pb-16 overflow-hidden">
      {!isLight && <GradientOrb className="-top-20 left-1/3" color="blue" size="lg" />}

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
            <BarChart3 className="w-3 h-3" />
            Proven Results
          </span>
          <h1 className={`text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-balance ${isLight ? "text-black" : ""}`}>
            Real businesses.{" "}
            <span className={isLight ? "text-black" : "gradient-text"}>Measurable results.</span>
          </h1>
          <p className={`text-lg md:text-xl max-w-3xl mx-auto leading-relaxed ${isLight ? "text-black/55" : "text-white/60"}`}>
            Every case study below is a before-and-after story. with the exact metrics,
            the timeline, and the impact on revenue, efficiency, and growth.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
