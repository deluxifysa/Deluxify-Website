"use client";

import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { Target, Eye, Heart } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const pillars = [
  {
    icon: Target,
    title: "Our Mission",
    description:
      "To make AI and premium technology accessible to every South African business. delivering the tools, systems, and strategies that were previously reserved for large corporates, at a price that makes sense for ambitious SMEs and growing enterprises.",
    color: "text-[#3FE0D0]",
    bg: "bg-[#2F8F89]/10 border-[#2F8F89]/20",
  },
  {
    icon: Eye,
    title: "Our Vision",
    description:
      "To become South Africa's most trusted AI and technology partner. known for premium quality, measurable results, and a genuine commitment to our clients' long-term success. We build lasting partnerships, not one-off projects.",
    color: "text-[#3B82F6]",
    bg: "bg-[#3B82F6]/10 border-[#3B82F6]/20",
  },
  {
    icon: Heart,
    title: "Our Values",
    description:
      "Innovation, excellence, collaboration, and integrity. We are honest about what technology can and cannot do. We invest in understanding your business before we write a single line of code. And we measure our success by yours.",
    color: "text-emerald-400",
    bg: "bg-emerald-600/10 border-emerald-600/20",
  },
];

export function MissionSection() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLight = mounted && theme === "light";

  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {pillars.map((p, i) => (
            <AnimatedSection key={p.title} delay={i * 0.12}>
              <div
                className={`border p-8 h-full rounded-2xl ${p.bg} ${
                  isLight
                    ? "bg-white border-black/10 shadow-sm"
                    : "glass-card"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 ${p.bg}`}>
                  <p.icon className={`w-6 h-6 ${p.color}`} />
                </div>
                <h3 className={`text-xl font-bold mb-3 ${isLight ? "text-black" : ""}`}>{p.title}</h3>
                <p className={`text-sm leading-relaxed ${isLight ? "text-black/60" : "text-white/60"}`}>{p.description}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Story narrative */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <AnimatedSection direction="left">
            <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${isLight ? "text-black" : ""}`}>
              Born in Bloemfontein.{" "}
              <span className={isLight ? "text-black" : "gradient-text"}>Built for South African ambition.</span>
            </h2>
            <div className={`space-y-4 leading-relaxed ${isLight ? "text-black/60" : "text-white/60"}`}>
              <p>
                We started with a simple observation: South African businesses are filled with
                talented, driven people. held back by outdated systems, manual processes, and
                technology that was never built with them in mind.
              </p>
              <p>
                Deluxify was founded to close that gap. We combine AI strategy, custom software
                development, digital marketing, and managed infrastructure under one roof. so
                business owners get a single, accountable partner instead of juggling five different
                agencies.
              </p>
              <p>
                Today we serve over 150 businesses across South Africa. from entrepreneurs in
                Bloemfontein to enterprises in Johannesburg and Cape Town. all operating smarter,
                growing faster, and competing at a level they never thought possible.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection direction="right" delay={0.15}>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Founded", value: "2023" },
                { label: "Team Members", value: "28" },
                { label: "Cities Served", value: "12+" },
                { label: "Service Capabilities", value: "13+" },
              ].map((s) => (
                <div
                  key={s.label}
                  className={`p-6 text-center rounded-2xl border ${
                    isLight
                      ? "bg-white border-black/10 shadow-sm"
                      : "glass-card gradient-border"
                  }`}
                >
                  <div className={`text-3xl font-bold mb-1 ${isLight ? "text-black" : "gradient-text"}`}>{s.value}</div>
                  <div className={`text-sm ${isLight ? "text-black/50" : "text-white/50"}`}>{s.label}</div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
