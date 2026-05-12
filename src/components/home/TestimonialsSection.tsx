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
    name: "Lebo Motaung",
    role: "Owner, Motaung Electrical",
    avatar: "LM",
    avatarUrl: "/avatars/placeholder.jpg",
    rating: 5,
    quote: "Deluxify built us a job-tracking system that replaced our WhatsApp chaos. It took two weeks and saved us hours every day. Worth every cent.",
    highlight: "Hours saved every day",
    glowColor: "blue" as const,
  },
  {
    id: "t-2",
    name: "Priya Naidoo",
    role: "Manager, Coastal Pharmacy Group",
    avatar: "PN",
    avatarUrl: "/avatars/placeholder.jpg",
    rating: 5,
    quote: "I was sceptical at first — we're a small pharmacy, not a tech company. But the inventory automation they set up genuinely changed how we work. Highly recommend.",
    highlight: "Inventory fully automated",
    glowColor: "purple" as const,
  },
  {
    id: "t-3",
    name: "Gerhard du Plessis",
    role: "Director, DuPlessis Logistics",
    avatar: "GD",
    avatarUrl: "/avatars/placeholder.jpg",
    rating: 4,
    quote: "They built a driver scheduling tool in under a month. It's not perfect yet but the team is responsive and keeps improving it. Good value for money.",
    highlight: "Scheduling time cut by 65%",
    glowColor: "green" as const,
  },
  {
    id: "t-4",
    name: "Ayesha Davids",
    role: "Founder, Ayesha's Online Boutique",
    avatar: "AD",
    avatarUrl: "/avatars/placeholder.jpg",
    rating: 5,
    quote: "As a small business owner I needed something simple. Deluxify didn't oversell me — they built exactly what I needed and walked me through everything.",
    highlight: "Simple, practical, no fluff",
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
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-white">
            What our clients{" "}
            <span className="font-[family-name:var(--font-caveat)] text-white uppercase text-4xl md:text-6xl">Actually Say</span>
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Real feedback from real South African business owners — no cherry-picked enterprise logos, just honest results.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <AnimatedSection key={t.id} delay={i * 0.1}>
              <GlowCard glowColor={t.glowColor} className="p-5 sm:p-7 flex flex-col gap-5 h-full">
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
