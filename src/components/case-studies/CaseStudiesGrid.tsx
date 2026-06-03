"use client";

import Image from "next/image";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const caseStudies = [
  {
    client: "Motaung Electrical",
    industry: "Trade Services · Web App + Automation",
    quote:
      "Deluxify built us a job-tracking system that replaced our WhatsApp chaos. It took two weeks and saved us hours every day. Worth every cent.",
    author: "Lebo Motaung",
    role: "Owner",
    photo: "/portraits/lebo-motaung.jpg",
    stats: [
      { value: "100%", label: "Jobs Tracked Digitally", sub: "Previously managed via WhatsApp" },
      { value: "~3 hrs", label: "Admin Saved Daily", sub: "Built and live in 18 days" },
    ],
  },
  {
    client: "Coastal Pharmacy Group",
    industry: "Healthcare Retail · Automation + Integration",
    quote:
      "I was sceptical at first — we're a small pharmacy, not a tech company. But the inventory automation they set up genuinely changed how we work. Highly recommend.",
    author: "Priya Naidoo",
    role: "Manager",
    photo: "/portraits/Priya-Naidoo.jpg",
    stats: [
      { value: "−71%", label: "Stock-out Incidents", sub: "Setup completed in 11 days" },
      { value: "Zero", label: "New Hardware Needed", sub: "Integrated with existing POS" },
    ],
  },
  {
    client: "DuPlessis Logistics",
    industry: "Transport & Logistics · Custom Dashboard",
    quote:
      "They built a driver scheduling tool in under a month. It's not perfect yet but the team is responsive and keeps improving it. Good value for money.",
    author: "Gerhard du Plessis",
    role: "Director",
    photo: "/portraits/Gerhard-du-Plessis.jpeg",
    stats: [
      { value: "−65%", label: "Scheduling Time", sub: "12 drivers across multiple routes" },
      { value: "−40%", label: "Driver No-shows", sub: "Via SMS confirmations" },
    ],
  },
];

export function CaseStudiesGrid() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLight = mounted && theme === "light";

  return (
    <section className="py-16 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {caseStudies.map((cs, i) => (
          <AnimatedSection key={cs.client} delay={0.1}>
            {/* Divider between entries */}
            {i > 0 && (
              <div className={`h-px w-full mb-16 ${isLight ? "bg-black/10" : "bg-white/8"}`} />
            )}

            <div className="grid gap-8 lg:grid-cols-3 xl:gap-20 mb-16">
              {/* Left — image + quote + author (spans 2 cols) */}
              <div className={`flex flex-col gap-8 sm:flex-row lg:col-span-2 lg:border-r lg:pr-12 xl:pr-20 ${isLight ? "border-black/10" : "border-white/8"}`}>
                {/* Portrait */}
                <Image
                  src={cs.photo}
                  alt={cs.author}
                  width={200}
                  height={250}
                  className="w-full max-w-[160px] sm:max-w-[200px] rounded-2xl object-cover shrink-0 mx-auto sm:mx-0"
                />

                {/* Quote + author */}
                <div className="flex h-full flex-col justify-between gap-8">
                  <div>
                    <p className={`text-xs font-medium uppercase tracking-widest mb-4 ${isLight ? "text-black/40" : "text-white/35"}`}>
                      {cs.industry}
                    </p>
                    <q className={`text-lg sm:text-xl leading-relaxed ${isLight ? "text-black" : "text-white/85"}`}>
                      {cs.quote}
                    </q>
                  </div>

                  <div className="flex items-end gap-4">
                    <div className="flex flex-col gap-0.5">
                      <p className={`text-base font-semibold ${isLight ? "text-black" : "text-white"}`}>
                        {cs.author}
                      </p>
                      <p className={`text-sm ${isLight ? "text-black/50" : "text-white/45"}`}>
                        {cs.role}, {cs.client}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right — 2 stats */}
              <div className="flex gap-6 self-center lg:flex-col">
                {cs.stats.map((stat) => (
                  <div key={stat.label} className="flex flex-col gap-1">
                    <p className={`text-4xl sm:text-5xl font-semibold tracking-tight ${isLight ? "text-black" : "text-white"}`}>
                      {stat.value}
                    </p>
                    <p className={`font-semibold text-sm ${isLight ? "text-black" : "text-white"}`}>
                      {stat.label}
                    </p>
                    <p className={`text-sm ${isLight ? "text-black/50" : "text-white/45"}`}>
                      {stat.sub}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </section>
  );
}
