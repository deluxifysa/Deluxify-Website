"use client";

import { motion } from "framer-motion";
import { ClipboardList, Cpu, Rocket } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import DotPattern from "@/components/ui/dot-pattern-1";

const steps = [
  {
    step: "01",
    icon: ClipboardList,
    title: "Discovery & Strategy",
    description:
      "We start with a deep-dive audit of your business processes and pain points. Our AI strategists map out exactly where automation will deliver the highest ROI within your unique context.",
  },
  {
    step: "02",
    icon: Cpu,
    title: "Build & Integrate",
    description:
      "Our engineers deploy custom AI models, chatbots, and automations, fully integrated with your existing tools. Zero disruption to your current operations during rollout.",
  },
  {
    step: "03",
    icon: Rocket,
    title: "Scale & Optimise",
    description:
      "Once live, we continuously monitor performance, retrain models on your data, and iterate on improvements. Your AI system gets smarter and more valuable every single day.",
  },
];

function StepCard({ step, isLight }: { step: typeof steps[0]; isLight: boolean }) {
  const accentColor = isLight ? "#ffffff" : "#3FE0D0";
  const borderColor = isLight ? "border-white/25" : "border-white/10";
  const dotFill = isLight ? "fill-white/20" : "fill-white/10";

  return (
    <div
      className={`relative w-full border ${borderColor} bg-transparent`}
      style={{ borderRadius: 0 }}
    >
      {/* Dot pattern background */}
      <DotPattern width={6} height={6} cx={1} cy={1} cr={0.8} className={dotFill} />

      {/* Corner accent squares */}
      <div className="absolute -left-1.5 -top-1.5 h-3 w-3" style={{ background: accentColor }} />
      <div className="absolute -bottom-1.5 -left-1.5 h-3 w-3" style={{ background: accentColor }} />
      <div className="absolute -right-1.5 -top-1.5 h-3 w-3" style={{ background: accentColor }} />
      <div className="absolute -bottom-1.5 -right-1.5 h-3 w-3" style={{ background: accentColor }} />

      {/* Content */}
      <div className="relative z-10 p-6 md:p-10 flex flex-col gap-6 h-full">
        {/* Step number + icon row */}
        <div className="flex items-start justify-between">
          <div
            className="w-14 h-14 flex items-center justify-center border border-white/20 bg-white/10"
          >
            <step.icon className="w-7 h-7 text-white" />
          </div>
          <span
            className="text-6xl font-bold leading-none select-none"
            style={{ color: isLight ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.08)" }}
          >
            {step.step}
          </span>
        </div>

        {/* Text */}
        <div>
          <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
          <p className="text-white/50 text-sm leading-relaxed">{step.description}</p>
        </div>

        {/* Bottom accent line */}
        <div
          className="mt-auto h-px w-full"
          style={{
            background: isLight
              ? "linear-gradient(to right, rgba(255,255,255,0.4), transparent)"
              : "linear-gradient(to right, rgba(63,224,208,0.4), transparent)",
          }}
        />
      </div>
    </div>
  );
}

export function HowItWorks() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLight = mounted && theme === "light";

  return (
    <section
      className={`py-24 md:py-32 relative overflow-hidden transition-colors duration-300 ${isLight ? "bg-black" : ""}`}
      id="how-it-works"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <span
            className="section-tag mb-4"
            style={isLight ? {
              backgroundColor: "rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.85)",
              border: "1px solid rgba(255,255,255,0.2)",
            } : undefined}
          >
            The Process
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-white">
            From idea to impact in{" "}
            <span className="font-[family-name:var(--font-caveat)] text-white uppercase text-4xl md:text-6xl">Three Steps</span>
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            A battle-tested process that delivers measurable results within weeks, not months.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.2, ease: "easeOut" }}
            >
              <StepCard step={step} isLight={isLight} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
