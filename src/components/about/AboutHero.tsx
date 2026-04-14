"use client";

import { motion } from "framer-motion";
import { GradientOrb } from "@/components/ui/GradientOrb";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function AboutHero() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLight = mounted && theme === "light";

  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {!isLight && (
        <>
          <GradientOrb className="-top-20 right-0 translate-x-1/3" color="purple" size="lg" />
          <GradientOrb className="top-1/2 left-0 -translate-x-1/2" color="blue" size="md" />
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
            Who We Are
          </span>
          <h1 className={`text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 leading-[1.05] ${isLight ? "text-black" : ""}`}>
            Bloemfontein roots.{" "}
            <span className={isLight ? "text-black" : "gradient-text"}>Global standards.</span>
          </h1>
          <p className={`text-xl leading-relaxed max-w-2xl mx-auto ${isLight ? "text-black/55" : "text-white/60"}`}>
            Deluxify is South Africa&apos;s premium AI and technology partner. making intelligent,
            enterprise-grade digital systems accessible to every ambitious business, regardless of size.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
