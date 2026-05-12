"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { useTheme } from "next-themes";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "Are you a big agency or a small team?",
    answer:
      "We're a small team of 4 based in South Africa. That means you deal directly with the people building your product — no account managers, no layers. We think that's a good thing.",
  },
  {
    question: "How long does a project typically take?",
    answer:
      "Most of our builds take 2–6 weeks depending on complexity. A simple automation can be live in under two weeks. We'll give you a realistic timeline before we start — no surprises.",
  },
  {
    question: "Do I need to be tech-savvy to work with you?",
    answer:
      "Not at all. We handle everything technical and explain things in plain language. If you can use WhatsApp and email, you can use what we build.",
  },
  {
    question: "What happens if something breaks after launch?",
    answer:
      "All our projects include a 30-day support window after launch. After that, we offer affordable monthly maintenance plans. We don't disappear once the invoice is paid.",
  },
  {
    question: "Do you work with businesses outside South Africa?",
    answer:
      "We're based in SA and our pricing is in ZAR, but we've done remote work for clients in Botswana and Namibia. If you're further afield, reach out and we'll see if it makes sense.",
  },
  {
    question: "Can I see examples of your work?",
    answer:
      "We have a few case studies on the site — but because many clients prefer privacy, not everything is public. Book a call and we'll walk you through relevant examples for your industry.",
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
