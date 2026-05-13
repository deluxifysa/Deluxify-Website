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
      "To help South African businesses work smarter by building affordable, practical AI tools — one business at a time.",
    color: "text-[#3FE0D0]",
    bg: "bg-[#2F8F89]/10 border-[#2F8F89]/20",
  },
  {
    icon: Eye,
    title: "Our Vision",
    description:
      "A South Africa where small businesses compete on equal footing with large corporations, powered by accessible technology.",
    color: "text-[#3B82F6]",
    bg: "bg-[#3B82F6]/10 border-[#3B82F6]/20",
  },
  {
    icon: Heart,
    title: "Our Values",
    description:
      "Honesty over hype. Build things that get used. Local first. Move fast, fix fast.",
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
              Started in 2024.{" "}
              <span className={isLight ? "text-black" : "gradient-text"}>Still figuring it out — honestly.</span>
            </h2>
            <div className={`space-y-4 leading-relaxed ${isLight ? "text-black/60" : "text-white/60"}`}>
              <p>
                We started Deluxify because we kept seeing the same problem: small South African
                businesses were drowning in manual work — WhatsApp groups, spreadsheets, copy-pasted
                emails — while the tools to fix it existed, but no one was making them accessible.
              </p>
              <p>
                We&apos;re a team of 4. We don&apos;t have 150 clients or 12 offices. What we do have is a
                genuine obsession with building software that people actually use — not polished demos
                that gather dust after launch.
              </p>
              <p>
                Every client we&apos;ve worked with, we&apos;ve stayed close to. We ask what broke,
                what helped, and what we got wrong. That feedback loop is how we get better.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection direction="right" delay={0.15}>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Founded", value: "2024" },
                { label: "Team Members", value: "4" },
                { label: "Clients Served", value: "23+" },
                { label: "Still Running Today", value: "100%" },
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
