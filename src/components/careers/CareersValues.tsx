"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Zap, Users, Globe, TrendingUp, Heart, Lightbulb } from "lucide-react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { cn } from "@/lib/utils";

const values = [
  {
    icon: Zap,
    title: "Move fast, ship real things",
    desc: "We don't theorise. We build, test, and improve. Speed with intention is our default mode.",
  },
  {
    icon: Lightbulb,
    title: "Curiosity over comfort",
    desc: "The best answers come from asking better questions. We hire people who never stop learning.",
  },
  {
    icon: Globe,
    title: "Africa-first thinking",
    desc: "We build for our context — the infrastructure, the languages, the market realities.",
  },
  {
    icon: Users,
    title: "Small team, big output",
    desc: "Every person here has real ownership and real impact. No busy work, no hand-holding.",
  },
  {
    icon: TrendingUp,
    title: "Raise the floor, then the ceiling",
    desc: "We grow together. Your growth is part of Deluxify's growth — not separate from it.",
  },
  {
    icon: Heart,
    title: "Work that matters",
    desc: "We help businesses transform. The work we do has a direct impact on real livelihoods.",
  },
];

export function CareersValues() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLight = mounted && theme === "light";

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-14">
          <span
            className="section-tag mb-4 mx-auto"
            style={isLight ? {
              backgroundColor: "rgba(0,0,0,0.06)",
              color: "#0B0B0C",
              border: "1px solid rgba(0,0,0,0.18)",
            } : undefined}
          >
            How We Work
          </span>
          <h2 className={`text-4xl md:text-5xl font-bold tracking-tight mt-4 ${isLight ? "text-black" : ""}`}>
            What it&apos;s like to work{" "}
            <span className={isLight ? "text-black" : "gradient-text"}>here.</span>
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <AnimatedSection key={v.title} delay={i * 0.07}>
                <div className={cn(
                  "h-full rounded-2xl p-6 transition-all duration-200 group",
                  isLight
                    ? "bg-white border border-black/10 shadow-sm hover:shadow-md"
                    : "glass-card hover:bg-white/[0.07]"
                )}>
                  <div className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center mb-4",
                    isLight ? "bg-black" : "bg-gradient-to-br from-[#2F8F89] to-[#3B82F6]"
                  )}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className={`font-semibold mb-2 ${isLight ? "text-black" : "text-white"}`}>{v.title}</h3>
                  <p className={`text-sm leading-relaxed ${isLight ? "text-black/55" : "text-white/55"}`}>{v.desc}</p>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
