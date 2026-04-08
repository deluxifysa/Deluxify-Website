"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Quote, Star } from "lucide-react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { GlowCard } from "@/components/ui/spotlight-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    id: "t-1",
    name: "Thabo Nkosi",
    role: "CEO, RetailPro SA",
    avatar: "TN",
    avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=60",
    rating: 5,
    quote: "Deluxify didn't just build us a chatbot — they redesigned our entire customer experience. One AI system now handles 95% of our support tickets. Costs dropped 60% in month one.",
    highlight: "60% cost reduction",
    glowColor: "blue" as const,
  },
  {
    id: "t-2",
    name: "Priya Govender",
    role: "Founder, HealthSync Clinics",
    avatar: "PG",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=60",
    rating: 5,
    quote: "From the strategy session to go-live, Deluxify was exceptional. Our AI booking system reduced no-shows by 67% and recovered over R1.1 million in revenue in the first year.",
    highlight: "R1.1M revenue recovered",
    glowColor: "purple" as const,
  },
  {
    id: "t-3",
    name: "Marcus van der Berg",
    role: "Operations Director, LogiMove",
    avatar: "MV",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=60",
    rating: 5,
    quote: "8 hours of daily manual data entry — gone. Deluxify connected our entire tech stack and automated our billing pipeline. Our team now focuses on strategy, not spreadsheets.",
    highlight: "8 hours saved daily",
    glowColor: "green" as const,
  },
  {
    id: "t-4",
    name: "Zanele Mokoena",
    role: "Sales Director, PropVault Realty",
    avatar: "ZM",
    avatarUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&auto=format&fit=crop&q=60",
    rating: 5,
    quote: "We went from missing 40% of leads to converting nearly double our previous rate. The AI paid for itself in the first deal.",
    highlight: "+137% lead conversion",
    glowColor: "orange" as const,
  },
];

export function TestimonialsSection() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLight = mounted && theme === "light";

  return (
    <section
      id="testimonials"
      className="py-24 md:py-32 transition-colors duration-300"
      style={{ backgroundColor: isLight ? "#0B0B0C" : undefined }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <span
            className="section-tag mb-4"
            style={{
              backgroundColor: "rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.85)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            Client Results
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">
            Trusted by businesses that{" "}
            <span className="font-[family-name:var(--font-caveat)] text-white uppercase text-5xl md:text-6xl">Demand Results</span>
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Our work is measured in revenue recovered, hours reclaimed, and
            businesses transformed — not vanity metrics.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <AnimatedSection key={t.id} delay={i * 0.1}>
              <GlowCard glowColor={t.glowColor} className="p-7 flex flex-col gap-5 h-full">
                {/* Stars */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: t.rating }).map((_, si) => (
                    <Star key={si} className="w-4 h-4 fill-white/80 text-white/80" />
                  ))}
                </div>

                {/* Quote */}
                <div className="flex-1">
                  <Quote className="w-5 h-5 text-white/30 mb-3" />
                  <p className="text-white/75 text-sm leading-relaxed">
                    {t.quote}
                  </p>
                </div>

                {/* Highlight badge */}
                <span className="self-start text-xs font-semibold px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/80">
                  {t.highlight}
                </span>

                {/* Divider */}
                <div className="h-px w-full bg-white/10" />

                {/* Author */}
                <div className="flex items-center gap-3">
                  <Avatar className="!size-10 border border-white/20 shrink-0">
                    <AvatarImage src={t.avatarUrl} alt={t.name} />
                    <AvatarFallback className="text-xs bg-white/10 text-white">
                      {t.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="block font-semibold text-sm text-white">
                      {t.name}
                    </span>
                    <span className="block text-xs text-white/45">
                      {t.role}
                    </span>
                  </div>
                </div>
              </GlowCard>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
