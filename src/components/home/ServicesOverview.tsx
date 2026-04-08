"use client";

import Link from "next/link";
import { Bot, Zap, BarChart3, Server, ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import BorderGlow from "@/components/ui/BorderGlow";

const services = [
  {
    icon: Bot,
    title: "AI & Strategy",
    description:
      "From AI strategy and automation to intelligent chatbots and custom model training,we design and deploy AI systems that work for your business, not against your budget.",
    color: "from-[#2F8F89] to-[#1F6F6A]",
    glow: "shadow-glow",
    pills: ["AI Strategy", "Automation", "Chatbots", "AI Training"],
    href: "/services#ai-strategy",
    glowColor: "174 50 37",
    glowColors: ["#3FE0D0", "#2F8F89", "#1a5c58"],
  },
  {
    icon: Zap,
    title: "Development",
    description:
      "Premium websites, mobile apps, SaaS platforms, and e-commerce stores,built to perform, designed to convert, and engineered to scale with your ambitions.",
    color: "from-[#3B82F6] to-blue-700",
    glow: "group-hover:shadow-[0_0_24px_rgba(59,130,246,0.4)]",
    pills: ["Web Dev", "App Dev", "SaaS", "E-commerce"],
    href: "/services#development",
    glowColor: "217 91 60",
    glowColors: ["#60a5fa", "#3B82F6", "#1d4ed8"],
  },
  {
    icon: BarChart3,
    title: "Marketing & Growth",
    description:
      "SEO that ranks, social media that converts, content that builds authority, and branding that commands premium prices,all data-driven, all measurable.",
    color: "from-emerald-500 to-teal-600",
    glow: "group-hover:shadow-[0_0_24px_rgba(16,185,129,0.4)]",
    pills: ["SEO", "Social Media", "Content", "Branding"],
    href: "/services#marketing",
    glowColor: "160 84 39",
    glowColors: ["#34d399", "#10b981", "#0d9488"],
  },
  {
    icon: Server,
    title: "Infrastructure",
    description:
      "Managed IT, cloud hosting, system integrations, and cybersecurity,enterprise-grade infrastructure that keeps your business running at full speed, 24/7.",
    color: "from-orange-500 to-amber-600",
    glow: "group-hover:shadow-[0_0_24px_rgba(245,158,11,0.4)]",
    pills: ["Managed IT", "Cloud", "Integrations", "Security"],
    href: "/services#infrastructure",
    glowColor: "38 92 68",
    glowColors: ["#fb923c", "#f97316", "#d97706"],
  },
];

export function ServicesOverview() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLight = mounted && theme === "light";

  return (
    <section className="py-24 md:py-32" id="services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <span
            className="section-tag mb-4"
            style={isLight ? {
              backgroundColor: "rgba(0,0,0,0.06)",
              color: "#0B0B0C",
              border: "1px solid rgba(0,0,0,0.18)",
            } : undefined}
          >
            What We Do
          </span>
          <h2 className={`text-4xl md:text-5xl font-bold tracking-tight mb-4 ${isLight ? "text-black" : ""}`}>
            Everything your business needs{" "}
            <span className="gradient-text">to lead.</span>
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${isLight ? "text-black/55" : "text-white/50"}`}>
            One partner. Four service pillars. Every solution built to deliver
            measurable growth, not just deliverables.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, i) => (
            <AnimatedSection key={service.title} delay={i * 0.1} className="h-full">
              <BorderGlow
                edgeSensitivity={30}
                glowColor={isLight ? "0 0 20" : service.glowColor}
                backgroundColor={isLight ? "#ffffff" : "#0f0f10"}
                borderRadius={16}
                glowRadius={40}
                glowIntensity={isLight ? 0.6 : 1}
                coneSpread={25}
                animated={false}
                colors={isLight ? ["#555555", "#333333", "#111111"] : service.glowColors}
                className="h-full"
              >
                <Link
                  href={service.href}
                  className="group p-8 flex flex-col gap-5 h-full transition-colors duration-300"
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                      isLight
                        ? "bg-black group-hover:bg-black/80"
                        : `bg-gradient-to-br ${service.color} ${service.glow}`
                    }`}
                  >
                    <service.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold mb-2 transition-colors duration-200 ${
                      isLight
                        ? "text-black/90 group-hover:text-black"
                        : "text-white group-hover:text-[#2F8F89]"
                    }`}>
                      {service.title}
                    </h3>
                    <p className={`text-sm leading-relaxed mb-4 ${isLight ? "text-black/55" : "text-white/50"}`}>
                      {service.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {service.pills.map((pill) => (
                        <span
                          key={pill}
                          className={`text-xs px-2.5 py-1 rounded-full ${
                            isLight
                              ? "bg-black/6 border border-black/12 text-black/60"
                              : "bg-white/5 border border-white/10 text-white/50"
                          }`}
                        >
                          {pill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 text-sm font-medium ${isLight ? "text-black/70" : "text-[#2F8F89]"}`}>
                    Explore service
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </BorderGlow>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
