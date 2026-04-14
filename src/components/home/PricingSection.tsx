"use client";

import Link from "next/link";
import { ArrowRight, Clock, FileText, CheckCircle } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import BorderGlow from "@/components/ui/BorderGlow";

const steps = [
  {
    icon: Clock,
    step: "01",
    title: "Book your consultation",
    description:
      "Pay a once-off consultation fee and book your AI & Technology Strategy session with one of our experts.",
  },
  {
    icon: FileText,
    step: "02",
    title: "We assess your business",
    description:
      "During the session we deep-dive into your operations, goals, and technology landscape to identify the highest-impact opportunities.",
  },
  {
    icon: CheckCircle,
    step: "03",
    title: "Receive your custom plan & invoice",
    description:
      "Within 48 hours you receive a tailored technology proposal scoped specifically to your business with a clear, itemised invoice. No surprises.",
  },
];

const included = [
  "60-minute strategy session with a senior AI consultant",
  "Full assessment of your current technology stack",
  "Identification of automation and AI opportunities",
  "Prioritised roadmap tailored to your budget and goals",
  "Custom proposal with itemised scope and deliverables",
  "Delivered to your inbox within 48 hours",
  "No obligation to proceed — but most clients do",
];

export function PricingSection() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLight = mounted && theme === "light";

  return (
    <section className="py-24 md:py-32 relative overflow-hidden" id="pricing">
      <div className={`absolute inset-0 pointer-events-none ${isLight ? "bg-gradient-to-b from-black/[0.02] to-transparent" : "bg-gradient-to-b from-surface-900/30 to-transparent"}`} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <span
            className="section-tag mb-4"
            style={isLight ? {
              backgroundColor: "rgba(0,0,0,0.06)",
              color: "#0B0B0C",
              border: "1px solid rgba(0,0,0,0.18)",
            } : undefined}
          >
            How It Works
          </span>
          <h2 className={`text-3xl md:text-5xl font-bold tracking-tight mb-4 ${isLight ? "text-black" : ""}`}>
            One consultation.{" "}
            <span className={isLight ? "text-black" : "gradient-text"}>A plan built for you.</span>
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${isLight ? "text-black/55" : "text-white/50"}`}>
            We don&apos;t believe in generic packages. Every business is different,
            so every proposal is built from scratch, based on your actual needs.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left — Steps */}
          <div className="space-y-8">
            {steps.map((s, i) => (
              <AnimatedSection key={s.step} delay={i * 0.1} direction="left">
                <div className="flex gap-5">
                  <div className="shrink-0 flex flex-col items-center">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: isLight
                          ? "#0B0B0C"
                          : "linear-gradient(135deg, #2F8F89, #3FE0D0)",
                      }}
                    >
                      <s.icon className="w-5 h-5 text-white" />
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`w-px flex-1 mt-3 min-h-[2rem] ${isLight ? "bg-gradient-to-b from-black/20 to-transparent" : "bg-gradient-to-b from-[#2F8F89]/40 to-transparent"}`} />
                    )}
                  </div>
                  <div className="pb-2">
                    <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${isLight ? "text-black/50" : "text-[#3FE0D0]"}`}>
                      Step {s.step}
                    </p>
                    <h3 className={`text-lg font-bold mb-1 ${isLight ? "text-black" : ""}`}>{s.title}</h3>
                    <p className={`text-sm leading-relaxed ${isLight ? "text-black/55" : "text-white/50"}`}>{s.description}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* Right — Consultation card */}
          <AnimatedSection direction="right" delay={0.15}>
            <BorderGlow
              edgeSensitivity={30}
              glowColor={isLight ? "0 0 20" : "174 50 37"}
              backgroundColor={isLight ? "#ffffff" : "#0f0f10"}
              borderRadius={16}
              glowRadius={40}
              glowIntensity={isLight ? 0.6 : 1}
              coneSpread={25}
              colors={isLight ? ["#555555", "#333333", "#111111"] : ["#3FE0D0", "#2F8F89", "#1a5c58"]}
            >
            <div className="p-5 sm:p-8 md:p-10 relative overflow-hidden">

              <div className="mb-6">
                <span className={`text-xs font-bold uppercase tracking-widest ${isLight ? "text-black/50" : "text-[#3FE0D0]"}`}>
                  Consultation Fee
                </span>
                <div className="flex items-baseline gap-2 mt-2 mb-1">
                  <span className={`text-4xl sm:text-5xl font-bold ${isLight ? "text-black" : ""}`}>R 650</span>
                  <span className={`text-sm ${isLight ? "text-black/40" : "text-white/40"}`}>once-off</span>
                </div>
                <p className={`text-sm ${isLight ? "text-black/55" : "text-white/50"}`}>
                  VAT inclusive. Applied as a credit if you proceed with any project.
                </p>
              </div>

              <div className="space-y-3 mb-8">
                {included.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isLight ? "bg-black/08" : "bg-[#2F8F89]/20"}`}>
                      <CheckCircle className={`w-3 h-3 ${isLight ? "text-black" : "text-[#3FE0D0]"}`} />
                    </div>
                    <span className={`text-sm ${isLight ? "text-black/70" : "text-white/70"}`}>{item}</span>
                  </div>
                ))}
              </div>

              <Link href="/book-call" className="btn-primary w-full justify-center text-base py-4 group">
                Book Your Consultation
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <p className={`text-xs text-center mt-4 font-medium ${isLight ? "text-black/70" : "text-white/60"}`}>
                After your session, your custom proposal arrives within 48 hours.
              </p>
            </div>
            </BorderGlow>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
