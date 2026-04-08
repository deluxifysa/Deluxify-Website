"use client";

import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { Shield, Lightbulb, Users, BarChart3, Globe, Repeat } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const values = [
  {
    icon: Lightbulb,
    title: "Innovation",
    description:
      "We stay ahead of the curve so our clients don't have to. Every solution we build uses the best available technology. deployed intelligently, not just impressively.",
  },
  {
    icon: Shield,
    title: "Excellence",
    description:
      "We don't ship work we're not proud of. Every website, every AI system, every campaign is held to a premium standard before it reaches your business.",
  },
  {
    icon: Users,
    title: "Collaboration",
    description:
      "We work as an extension of your team, not as an outside vendor. Your goals become our goals. and we stay invested in your outcomes long after delivery.",
  },
  {
    icon: BarChart3,
    title: "Integrity",
    description:
      "We tell clients the truth. about timelines, capabilities, and ROI. We'd rather lose a deal than overpromise and underdeliver.",
  },
  {
    icon: Globe,
    title: "Local expertise",
    description:
      "Based in Bloemfontein, we understand the South African market. its opportunities, its constraints, and the unique needs of businesses competing in it.",
  },
  {
    icon: Repeat,
    title: "Long-term thinking",
    description:
      "We build relationships, not transactions. Our clients stay because the systems we build keep improving. and because we genuinely care about their success.",
  },
];

export function ValuesSection() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLight = mounted && theme === "light";

  return (
    <section className={`py-20 border-t transition-colors duration-300 ${
      isLight ? "border-black/10 bg-black/[0.02]" : "border-white/5 bg-surface-900/20"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-14">
          <span
            className="section-tag mb-4"
            style={isLight ? {
              backgroundColor: "rgba(0,0,0,0.06)",
              color: "#0B0B0C",
              border: "1px solid rgba(0,0,0,0.18)",
            } : undefined}
          >
            Our Values
          </span>
          <h2 className={`text-4xl md:text-5xl font-bold tracking-tight ${isLight ? "text-black" : ""}`}>
            The values behind{" "}
            <span className={isLight ? "text-black" : "gradient-text"}>every decision we make</span>
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((v, i) => (
            <AnimatedSection key={v.title} delay={i * 0.08}>
              <div className={`p-6 flex gap-4 transition-all duration-200 h-full rounded-2xl border ${
                isLight
                  ? "bg-white border-black/10 shadow-sm hover:bg-black/[0.02]"
                  : "glass-card hover:bg-white/[0.07] border-white/5"
              }`}>
                <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-600/30 flex items-center justify-center shrink-0">
                  <v.icon className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <h3 className={`font-semibold mb-1 ${isLight ? "text-black" : ""}`}>{v.title}</h3>
                  <p className={`text-sm leading-relaxed ${isLight ? "text-black/55" : "text-white/50"}`}>{v.description}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
