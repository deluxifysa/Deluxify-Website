"use client";

import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { Linkedin, Twitter } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const team = [
  {
    name: "Katleho Matsaseng",
    role: "Founder & Lead Developer",
    bio: "Katleho started Deluxify after seeing how many SA businesses were drowning in manual processes. He builds most of what we ship.",
    initials: "KM",
    gradient: "from-brand-500 to-brand-700",
    linkedin: "#",
    twitter: "#",
  },
  {
    name: "Zanele Khumalo",
    role: "Operations & Client Success",
    bio: "Zanele makes sure projects stay on track and clients stay informed. She's the reason things don't fall through the cracks.",
    initials: "ZK",
    gradient: "from-accent-500 to-accent-700",
    linkedin: "#",
    twitter: "#",
  },
  {
    name: "Reza Isaacs",
    role: "UI/UX & Frontend",
    bio: "Reza designs everything you see. He cares deeply about making software that people actually want to use.",
    initials: "RI",
    gradient: "from-emerald-500 to-teal-700",
    linkedin: "#",
    twitter: "#",
  },
  {
    name: "Sipho Dlamini",
    role: "AI & Integrations",
    bio: "Sipho handles the AI side — LLM integrations, automation logic, and making sure things work at scale.",
    initials: "SD",
    gradient: "from-orange-500 to-amber-700",
    linkedin: "#",
    twitter: "#",
  },
];

export function TeamSection() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLight = mounted && theme === "light";

  return (
    <section className="py-24 md:py-28">
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
            The Team
          </span>
          <h2 className={`text-4xl md:text-5xl font-bold tracking-tight mb-4 ${isLight ? "text-black" : ""}`}>
            A small team,{" "}
            <span className={isLight ? "text-black" : "gradient-text"}>doing real work</span>
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${isLight ? "text-black/55" : "text-white/50"}`}>
            There are 4 of us. We&apos;re based in South Africa, we started in 2024, and we work directly
            with every client. No outsourcing, no middlemen — just a focused team that cares about the work.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.map((member, i) => (
            <AnimatedSection key={member.name} delay={i * 0.08}>
              <div className={`p-6 group transition-all duration-300 h-full flex flex-col rounded-2xl border ${
                isLight
                  ? "bg-white border-black/10 shadow-sm hover:bg-black/[0.02]"
                  : "glass-card gradient-border hover:bg-white/[0.07]"
              }`}>
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${member.gradient} flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-lg`}
                  >
                    {member.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-base ${isLight ? "text-black" : ""}`}>{member.name}</h3>
                    <p className="text-brand-400 text-sm">{member.role}</p>
                  </div>
                </div>
                <p className={`text-sm leading-relaxed flex-1 mb-4 ${isLight ? "text-black/55" : "text-white/55"}`}>{member.bio}</p>
                <div className={`flex items-center gap-2 pt-3 border-t ${isLight ? "border-black/10" : "border-white/5"}`}>
                  <a
                    href={member.linkedin}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:text-brand-400 hover:bg-brand-600/10 ${
                      isLight ? "bg-black/[0.04] text-black/40" : "glass text-white/40"
                    }`}
                    aria-label={`${member.name} LinkedIn`}
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a
                    href={member.twitter}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:text-brand-400 hover:bg-brand-600/10 ${
                      isLight ? "bg-black/[0.04] text-black/40" : "glass text-white/40"
                    }`}
                    aria-label={`${member.name} Twitter`}
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
