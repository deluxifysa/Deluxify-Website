"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function CTASection() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLight = mounted && theme === "light";

  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Background orb — black tinted in light mode */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl pointer-events-none"
        style={{
          background: isLight
            ? "radial-gradient(circle, rgba(0,0,0,0.06), transparent 70%)"
            : "radial-gradient(circle, rgba(47,143,137,0.2), rgba(63,97,224,0.15), transparent 70%)",
        }}
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className={`p-6 sm:p-10 md:p-16 rounded-2xl border transition-colors duration-300 ${
              isLight
                ? "bg-white border-black/10 shadow-[0_8px_48px_rgba(0,0,0,0.08)]"
                : "glass-card gradient-border"
            }`}
          >
            <span
              className="section-tag mb-6 mx-auto"
              style={isLight ? {
                backgroundColor: "rgba(0,0,0,0.06)",
                color: "#0B0B0C",
                border: "1px solid rgba(0,0,0,0.18)",
              } : undefined}
            >
              Your Next Move
            </span>

            <h2 className={`text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight mb-6 text-balance ${isLight ? "text-black" : ""}`}>
              Ready to build something
              <span className={isLight ? " text-black" : " gradient-text"}> powerful?</span>
            </h2>

            <p className={`text-lg max-w-2xl mx-auto mb-10 leading-relaxed ${isLight ? "text-black/55" : "text-white/60"}`}>
              Join 150+ South African businesses that chose Deluxify as their technology partner.
              One strategy call is all it takes to see exactly what&apos;s possible for your business.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact" className="btn-primary text-base px-8 py-4 group">
                Book a Strategy Call
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/services" className="btn-secondary text-base px-8 py-4 group">
                <Calendar className="w-5 h-5" />
                Explore Services
              </Link>
            </div>

            <p className={`mt-6 text-sm ${isLight ? "text-black/40" : "text-white/30"}`}>
              No obligation &nbsp;·&nbsp; No hard sell &nbsp;·&nbsp; Just clarity on what AI can do for you
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
