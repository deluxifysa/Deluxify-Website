"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { useTheme } from "next-themes";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "What makes Deluxify different from other agencies?",
    answer:
      "Most agencies specialise in one thing. a web agency, a marketing agency, an AI consultancy. We offer all of it under one roof, with one accountable team. That means no gaps, no finger-pointing between vendors, and a technology strategy that actually fits together. Every solution we build is tied to a measurable business outcome.",
  },
  {
    question: "How long does it take to see results?",
    answer:
      "It depends on the service. AI automations typically deliver measurable time savings within the first week of going live. SEO and content strategies show meaningful movement within 60–90 days. Development projects are scoped with clear milestones so you always know what's coming and when.",
  },
  {
    question: "Do I need any technical knowledge to work with you?",
    answer:
      "None at all. We handle every technical aspect. from architecture to deployment and ongoing maintenance. You manage your business; we manage the technology. Our dashboards and reporting are built for decision-makers, not developers.",
  },
  {
    question: "Can you work with my existing tools and software?",
    answer:
      "Yes. We integrate with virtually any platform. Salesforce, HubSpot, SAP, Microsoft 365, Google Workspace, Shopify, WooCommerce, WhatsApp Business API, and hundreds more via REST APIs and custom connectors. We start by mapping what you already have, then build around it.",
  },
  {
    question: "Is my data safe with Deluxify?",
    answer:
      "Absolutely. We are fully POPIA-compliant. South Africa's data protection law. All data is encrypted in transit and at rest, stored in South African infrastructure where required, and never used to train models for other clients. We sign data processing agreements with every client.",
  },
  {
    question: "What does a typical engagement look like?",
    answer:
      "It starts with a free strategy call where we understand your business, your goals, and your current challenges. From there we propose a scoped solution with clear deliverables, timelines, and pricing. Once approved, we assign a dedicated team and keep you updated throughout. Most clients are live within 2–6 weeks.",
  },
  {
    question: "Are there lock-in contracts?",
    answer:
      "No. All retainer plans are month-to-month. We're confident in the value we deliver, so we don't need long contracts to keep clients. Clients who do commit to 12-month plans receive a 15% discount. but it's always your choice.",
  },
];

function FAQItem({
  question,
  answer,
  index,
  isLight,
}: {
  question: string;
  answer: string;
  index: number;
  isLight: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <AnimatedSection delay={index * 0.05}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full text-left px-4 py-4 sm:px-6 sm:py-5 flex items-center justify-between gap-3 sm:gap-6 transition-all duration-200 rounded-2xl border",
          isLight
            ? open
              ? "rounded-b-none bg-black/[0.04] border-black/10"
              : "bg-white border-black/10 hover:bg-black/[0.02]"
            : open
            ? "rounded-b-none bg-white/[0.07] border-white/10"
            : "glass-card hover:bg-white/[0.04]"
        )}
        aria-expanded={open}
      >
        <span
          className={cn(
            "font-semibold text-sm md:text-base transition-colors leading-snug",
            isLight
              ? open ? "text-black" : "text-black/80"
              : open ? "text-[#3FE0D0]" : "text-white"
          )}
        >
          {question}
        </span>
        <div
          className={cn(
            "shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors",
            isLight
              ? open ? "bg-black" : "bg-black/10"
              : open ? "bg-[#2F8F89]" : "bg-white/10"
          )}
        >
          {open
            ? <Minus className="w-3 h-3 text-white" />
            : <Plus className={`w-3 h-3 ${isLight ? "text-black" : "text-white"}`} />
          }
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div
              className={cn(
                "px-6 pt-4 pb-6 text-sm leading-relaxed border border-t-0 rounded-b-2xl",
                isLight
                  ? "text-black/60 bg-black/[0.02] border-black/10"
                  : "text-white/60 bg-white/[0.04] border-white/10"
              )}
            >
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedSection>
  );
}

export function FAQSection() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLight = mounted && theme === "light";

  return (
    <section className="py-24 md:py-32" id="faq">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <span
            className="section-tag mb-4"
            style={isLight ? {
              backgroundColor: "rgba(0,0,0,0.06)",
              color: "#0B0B0C",
              border: "1px solid rgba(0,0,0,0.18)",
            } : undefined}
          >
            FAQ
          </span>
          <h2 className={`text-3xl md:text-5xl font-bold tracking-tight mb-4 ${isLight ? "text-black" : ""}`}>
            Common questions,{" "}
            <span className={isLight ? "text-black" : "gradient-text"}>straight answers</span>
          </h2>
        </AnimatedSection>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FAQItem key={faq.question} {...faq} index={i} isLight={isLight} />
          ))}
        </div>
      </div>
    </section>
  );
}
