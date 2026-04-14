"use client";

import { motion } from "framer-motion";
import { GradientOrb } from "@/components/ui/GradientOrb";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ContactHero() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLight = mounted && theme === "light";

  return (
    <section className="relative pt-32 pb-12 overflow-hidden">
      {!isLight && <GradientOrb className="-top-20 left-1/2 -translate-x-1/2" color="mixed" size="lg" />}

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
            Get In Touch
          </span>
          <h1 className={`text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 ${isLight ? "text-black" : ""}`}>
            Let&apos;s build something{" "}
            <span className={`font-[family-name:var(--font-caveat)] text-4xl sm:text-6xl md:text-7xl uppercase ${isLight ? "text-black" : "gradient-text"}`}>powerful.</span>
          </h1>
          <p className={`text-lg max-w-2xl mx-auto ${isLight ? "text-black/55" : "text-white/60"}`}>
            Book a strategy call, send us a message, or chat on WhatsApp.
            We&apos;ll show you exactly what&apos;s possible. with no obligation and no hard sell.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
