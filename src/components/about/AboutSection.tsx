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
  { value: "23+",  label: "Businesses Served" },
  { value: "4",    label: "Team Members" },
  { value: "3+",   label: "Cities Reached" },
  { value: "8+",   label: "Service Capabilities" },
];

const contentSections = [
  {
    title: "Our Mission",
    content:
      "To make AI and practical technology accessible to South African businesses — delivering tools and systems that were previously only available to large corporates, at a price that makes sense for growing SMEs.\n\nWe believe every business deserves software that actually fits how it works. Our job is to close the gap between the ambition of local entrepreneurs and the tools available to them.\n\nWe measure our success simply: does the client still use it six months later? That's the bar.",
  },
  {
    title: "Our Story",
    content:
      "We started Deluxify in 2024 after watching too many South African businesses run on WhatsApp groups and spreadsheets — not because they wanted to, but because nothing better had been built for them.\n\nWe're based in Bloemfontein and currently a team of four. We've shipped projects for clients in Bloemfontein, Johannesburg, and Cape Town. We're not big yet — but every client we've worked with, we've stayed close to.\n\nWe're early. We're honest about that. And we're building the kind of company we'd want to hire ourselves.",
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
            We build practical AI and custom software for South African businesses — the kind of tools
            that actually get used, not demos that look good in a pitch and break in production.
          </p>
        </motion.div>

        {/* ── Image grid ── */}
        <AnimatedSection>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main image — 2 cols */}
            <Image
              src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&auto=format&fit=crop&q=70"
              alt="Deluxify team at work"
              width={1200}
              height={780}
              className="w-full max-h-[580px] rounded-2xl object-cover lg:col-span-2"
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
                    Built in Bloemfontein. Shipped to real clients.
                  </p>
                  <p className="text-sm text-white/60">
                    We're a small team solving real problems — no fluff, no demos that gather dust.
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
              <Image
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=70"
                alt="Deluxify team discussion"
                width={600}
                height={480}
                className="w-full grow basis-0 rounded-2xl object-cover min-h-40 md:w-1/2 lg:w-auto"
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
                Early days — but every number here is real. No inflated pipeline counts, no agency fluff.
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
