"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import LogoLoop from "@/components/ui/LogoLoop";
import Image from "next/image";
import {
  SiOpenai, SiGoogle, SiMeta, SiSalesforce, SiHubspot,
  SiShopify, SiSlack, SiStripe, SiZapier, SiNotion,
} from "react-icons/si";

const logos = [
  { node: <SiOpenai />,     title: "OpenAI" },
  { node: <SiGoogle />,     title: "Google" },
  { node: <SiMeta />,       title: "Meta" },
  { node: <SiSalesforce />, title: "Salesforce" },
  { node: <SiHubspot />,    title: "HubSpot" },
  { node: <SiShopify />,    title: "Shopify" },
  { node: <SiSlack />,      title: "Slack" },
  { node: <SiStripe />,     title: "Stripe" },
  { node: <SiZapier />,     title: "Zapier" },
  { node: <SiNotion />,     title: "Notion" },
];

const achievements = [
  { value: "150+", label: "Businesses Served" },
  { value: "28",   label: "Team Members" },
  { value: "12+",  label: "Cities Reached" },
  { value: "13+",  label: "Service Capabilities" },
];

const contentSections = [
  {
    title: "Our Mission",
    content:
      "To make AI and premium technology accessible to every South African business — delivering the tools, systems, and strategies previously reserved for large corporates, at a price that makes sense for ambitious SMEs and growing enterprises.\n\nWe believe every business, regardless of size, deserves enterprise-grade digital systems. Our work closes the gap between ambition and capability.\n\nWe measure our success by yours — in revenue recovered, hours reclaimed, and teams empowered to do what they do best.",
  },
  {
    title: "Our Story",
    content:
      "We started with a simple observation: South African businesses are filled with talented, driven people — held back by outdated systems and technology that was never built with them in mind.\n\nDeluxify was founded in Bloemfontein to close that gap. We combine AI strategy, custom software, digital marketing, and managed infrastructure under one roof.\n\nToday we serve over 150 businesses across South Africa — from entrepreneurs in Bloemfontein to enterprises in Johannesburg and Cape Town — all competing at a level they never thought possible.",
  },
];

export function AboutSection() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLight = mounted && theme === "light";

  return (
    <section className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14 flex flex-col gap-5 lg:w-2/3"
        >
          <span
            className="section-tag self-start"
            style={isLight ? {
              backgroundColor: "rgba(0,0,0,0.06)",
              color: "#0B0B0C",
              border: "1px solid rgba(0,0,0,0.18)",
            } : undefined}
          >
            Who We Are
          </span>
          <h1 className={`text-5xl font-semibold tracking-tight lg:text-6xl ${isLight ? "text-black" : "text-white"}`}>
            Bloemfontein roots.{" "}
            <span className={`font-[family-name:var(--font-caveat)] uppercase text-5xl md:text-6xl ${isLight ? "text-black" : "gradient-text"}`}>Global standards.</span>
          </h1>
          <p className={`text-lg md:text-xl leading-relaxed ${isLight ? "text-black/60" : "text-white/55"}`}>
            South Africa&apos;s premium AI and technology partner — making intelligent,
            enterprise-grade digital systems accessible to every ambitious business,
            regardless of size or location.
          </p>
        </motion.div>

        {/* ── Image grid ── */}
        <AnimatedSection>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main image — 2 cols */}
            <img
              src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&auto=format&fit=crop&q=70"
              alt="Deluxify team at work"
              className="size-full max-h-[580px] rounded-2xl object-cover lg:col-span-2"
            />

            {/* Right column */}
            <div className="flex flex-col gap-6 md:flex-row lg:flex-col">
              {/* Breakout card */}
              <div className={`flex flex-col justify-between gap-6 rounded-2xl p-7 md:w-1/2 lg:w-auto ${
                isLight ? "bg-black text-white" : "bg-white/[0.06] border border-white/10"
              }`}>
                <Image
                  src="/logo.png"
                  alt="Deluxify"
                  width={120}
                  height={34}
                  className="h-8 w-auto object-contain brightness-0 invert"
                />
                <div>
                  <p className="mb-2 text-base font-semibold text-white">
                    South Africa&apos;s #1 AI solutions company
                  </p>
                  <p className="text-sm text-white/60">
                    Helping businesses automate, scale, and thrive in the age of artificial intelligence.
                  </p>
                </div>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors group"
                >
                  Book a strategy call
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Secondary image */}
              <img
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=70"
                alt="Deluxify team discussion"
                className="grow basis-0 rounded-2xl object-cover min-h-40 md:w-1/2 lg:w-auto"
              />
            </div>
          </div>
        </AnimatedSection>

        {/* ── Logo marquee ── */}
        <div className="py-20 overflow-hidden">
          <p className={`text-sm font-medium uppercase tracking-widest text-center mb-8 ${isLight ? "text-black/40" : "text-white/30"}`}>
            Trusted integrations powering our clients
          </p>
          <LogoLoop
            logos={logos}
            speed={50}
            direction="left"
            logoHeight={28}
            gap={52}
            hoverSpeed={0}
            scaleOnHover
            fadeOut
            fadeOutColor={isLight ? "#F8F8F8" : "#0B0B0C"}
            className={isLight ? "text-black/60" : "text-white/30"}
          />
        </div>

        {/* ── Achievements ── */}
        <AnimatedSection>
          <div className="relative overflow-hidden rounded-2xl bg-[#0B0B0C] p-8 md:p-14">
            {/* subtle bg glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-3xl pointer-events-none opacity-20"
              style={{ background: "radial-gradient(circle, rgba(47,143,137,0.6), rgba(63,97,224,0.4), transparent 70%)" }}
            />
            <div className="relative flex flex-col gap-3 text-center md:text-left mb-10">
              <h2 className="text-3xl md:text-4xl font-semibold text-white">
                Our achievements in numbers
              </h2>
              <p className="max-w-xl text-white/50 text-sm md:text-base">
                Real impact across South Africa — measured in businesses transformed, hours reclaimed, and revenue recovered.
              </p>
            </div>
            <div className="relative grid grid-cols-2 gap-x-4 gap-y-10 md:flex md:flex-wrap md:justify-between">
              {achievements.map((item) => (
                <div key={item.label} className="flex flex-col gap-1 text-center md:text-left">
                  <span className="font-mono text-4xl md:text-5xl font-semibold text-white">
                    {item.value}
                  </span>
                  <p className="text-sm md:text-base text-white/60">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* ── Content sections ── */}
        <div className="mx-auto grid max-w-5xl gap-16 py-24 md:grid-cols-2 md:gap-24">
          {contentSections.map((section, i) => (
            <AnimatedSection key={section.title} delay={i * 0.12} direction={i === 0 ? "left" : "right"}>
              <h2 className={`mb-5 text-3xl md:text-4xl font-semibold ${isLight ? "text-black" : "text-white"}`}>
                {section.title}
              </h2>
              <p className={`text-base md:text-lg leading-7 whitespace-pre-line ${isLight ? "text-black/60" : "text-white/55"}`}>
                {section.content}
              </p>
            </AnimatedSection>
          ))}
        </div>

      </div>
    </section>
  );
}
