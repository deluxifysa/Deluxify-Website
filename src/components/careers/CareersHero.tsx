"use client";

import { motion } from "framer-motion";
import { GradientOrb } from "@/components/ui/GradientOrb";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function CareersHero() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLight = mounted && theme === "light";

  return (
    <section className="relative pt-32 pb-16 overflow-hidden">
      {!isLight && (
        <>
          <GradientOrb className="-top-20 left-1/2 -translate-x-1/2" color="mixed" size="lg" />
          <GradientOrb className="top-1/2 right-0 translate-x-1/3" color="blue" size="md" />
        </>
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl mx-auto"
        >
          <span
            className="section-tag mb-6 mx-auto"
            style={isLight ? {
              backgroundColor: "rgba(0,0,0,0.06)",
              color: "#0B0B0C",
              border: "1px solid rgba(0,0,0,0.18)",
            } : undefined}
          >
            Careers at Deluxify
          </span>
          <h1 className={`text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.05] ${isLight ? "text-black" : ""}`}>
            Build the future of{" "}
            <span className={`font-[family-name:var(--font-caveat)] text-6xl md:text-7xl lg:text-8xl uppercase ${isLight ? "text-black" : "gradient-text"}`}>
              African AI.
            </span>
          </h1>
          <p className={`text-lg md:text-xl leading-relaxed max-w-2xl mx-auto ${isLight ? "text-black/55" : "text-white/60"}`}>
            We&apos;re a small, fast-moving team doing serious work. If you love building things that actually matter,
            we&apos;d love to hear from you when the time is right.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
