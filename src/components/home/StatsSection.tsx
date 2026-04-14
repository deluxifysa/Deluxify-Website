"use client";

import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { AnimatedSection } from "@/components/ui/AnimatedSection";

function useCountUp(target: number, duration: number, start: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

const stats = [
  { value: 23, suffix: "+", label: "Businesses Transformed", desc: "Across South Africa & beyond" },
  { value: 98, suffix: "%", label: "Client Retention Rate", desc: "Clients who scale with us" },
  { value: 40, suffix: "x", label: "Average ROI Delivered", desc: "Measured return on investment" },
  { value: 13, suffix: "+", label: "Service Capabilities", desc: "Under one premium partner" },
];

function StatCard({ value, suffix, label, desc, index, start, isLight }: typeof stats[0] & { index: number; start: boolean; isLight: boolean }) {
  const count = useCountUp(value, 1.5, start);
  return (
    <AnimatedSection delay={index * 0.1} className="text-center p-6">
      <div className="text-4xl md:text-6xl font-bold mb-2">
        <span className="gradient-text">{count}</span>
        <span className="text-brand-400">{suffix}</span>
      </div>
      <div className={`font-semibold mb-1 ${isLight ? "text-black/80" : "text-white"}`}>{label}</div>
      <div className={`text-sm ${isLight ? "text-black/45" : "text-white/40"}`}>{desc}</div>
    </AnimatedSection>
  );
}

export function StatsSection() {
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true });
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isLight = mounted && theme === "light";

  return (
    <section
      className={`py-20 border-y transition-colors duration-300 ${
        isLight ? "border-black/[0.08] bg-white" : "border-white/5 bg-surface-900/20"
      }`}
      ref={ref}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-2 lg:grid-cols-4 divide-x ${isLight ? "divide-black/[0.08]" : "divide-white/5"}`}>
          {stats.map((stat, i) => (
            <StatCard key={stat.label} {...stat} index={i} start={inView} isLight={isLight} />
          ))}
        </div>
      </div>
    </section>
  );
}
