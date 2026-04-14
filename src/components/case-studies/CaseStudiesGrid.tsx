"use client";

import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const caseStudies = [
  {
    client: "RetailPro SA",
    industry: "Retail · AI Automation + Chatbot",
    quote:
      "We cut costs by 60% and our customers are happier than ever. The ROI was clear within the first month.",
    author: "Thabo Nkosi",
    role: "CEO",
    photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=60",
    stats: [
      { value: "−60%", label: "Support Costs", sub: "From R480K to R192K/yr" },
      { value: "99%", label: "Faster Response", sub: "6 hours → under 90 seconds" },
    ],
  },
  {
    client: "HealthSync Clinics",
    industry: "Healthcare · AI Chatbot + Integrations",
    quote:
      "The no-show rate dropped by nearly 70%. That alone paid for the entire project in the first two months.",
    author: "Priya Govender",
    role: "Founder",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=60",
    stats: [
      { value: "R1.1M", label: "Revenue Recovered", sub: "In the first year" },
      { value: "−67%", label: "No-show Rate", sub: "28% down to 9%" },
    ],
  },
  {
    client: "LogiMove Logistics",
    industry: "Logistics · System Integrations + Automation",
    quote:
      "What used to take 8 hours of manual work now happens automatically in minutes. Our team is finally doing strategic work.",
    author: "Marcus van der Berg",
    role: "Operations Director",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60",
    stats: [
      { value: "94%", label: "Admin Reduced", sub: "8 hrs/day → 30 min/day" },
      { value: "R240K", label: "Annual Savings", sub: "New operational saving" },
    ],
  },
  {
    client: "PropVault Realty",
    industry: "Real Estate · AI Chatbot + Lead Automation",
    quote:
      "We went from missing 40% of leads to converting nearly double our previous rate. The AI paid for itself in the first deal.",
    author: "Zanele Mokoena",
    role: "Sales Director",
    photo: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&auto=format&fit=crop&q=60",
    stats: [
      { value: "+137%", label: "Lead Conversion", sub: "8% up to 19%" },
      { value: "R2.1M", label: "Revenue Added", sub: "Per year from AI" },
    ],
  },
  {
    client: "MenuMaster Restaurant Group",
    industry: "Hospitality · AI Automation + WhatsApp Bot",
    quote:
      "Revenue grew 23% in the first quarter, and our staff actually enjoy coming to work now. Game-changing.",
    author: "Jean-Pierre Rousseau",
    role: "Owner",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=60",
    stats: [
      { value: "23%", label: "Revenue Growth", sub: "In the first quarter" },
      { value: "90%", label: "Faster Orders", sub: "4–7 min → 30 seconds" },
    ],
  },
  {
    client: "EdPath Learning",
    industry: "EdTech · AI Consulting + Custom AI",
    quote:
      "Our completion rate more than doubled. Students feel supported around the clock, and our team can focus on curriculum.",
    author: "Dr. Ayesha Moosa",
    role: "CEO",
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=60",
    stats: [
      { value: "+122%", label: "Completion Rate", sub: "32% up to 71%" },
      { value: "−70%", label: "Support Costs", sub: "R180K down to R54K/yr" },
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
                <img
                  src={cs.photo}
                  alt={cs.author}
                  className="aspect-[4/5] w-full max-w-[160px] sm:max-w-[200px] rounded-2xl object-cover shrink-0 mx-auto sm:mx-0"
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
