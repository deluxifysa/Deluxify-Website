"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { BriefcaseIcon, Bell, Mail } from "lucide-react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { cn } from "@/lib/utils";

const DEPARTMENTS = ["All", "Engineering", "AI & Strategy", "Marketing", "Operations"];

export function CareersOpenRoles() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLight = mounted && theme === "light";

  const [activeTab, setActiveTab] = useState("All");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleNotify(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  }

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <AnimatedSection className="mb-10">
          <div className="flex items-center gap-4 mb-2">
            <div className={`h-px flex-1 opacity-30 ${isLight ? "bg-black" : "bg-gradient-to-r from-[#2F8F89] to-[#3B82F6]"}`} />
            <span
              className="section-tag"
              style={isLight ? {
                backgroundColor: "rgba(0,0,0,0.06)",
                color: "#0B0B0C",
                border: "1px solid rgba(0,0,0,0.18)",
              } : undefined}
            >
              Open Roles
            </span>
            <div className={`h-px flex-1 opacity-30 ${isLight ? "bg-black" : "bg-gradient-to-l from-[#2F8F89] to-[#3B82F6]"}`} />
          </div>
        </AnimatedSection>

        {/* Filter tabs */}
        <AnimatedSection delay={0.05} className="mb-8">
          <div className="flex flex-wrap gap-2">
            {DEPARTMENTS.map((dept) => (
              <button
                key={dept}
                onClick={() => setActiveTab(dept)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  activeTab === dept
                    ? isLight
                      ? "bg-black text-white shadow-[0_0_12px_rgba(0,0,0,0.2)]"
                      : "bg-gradient-to-r from-[#2F8F89] to-[#3B82F6] text-white shadow-[0_0_12px_rgba(63,224,208,0.3)]"
                    : isLight
                      ? "bg-black/06 text-black/60 hover:bg-black/10 border border-black/10"
                      : "bg-white/06 text-white/60 hover:bg-white/10 border border-white/10"
                )}
              >
                {dept}
              </button>
            ))}
          </div>
        </AnimatedSection>

        {/* No vacancies state */}
        <AnimatedSection delay={0.1}>
          <div className={cn(
            "rounded-2xl border-2 border-dashed px-8 py-20 flex flex-col items-center text-center",
            isLight ? "border-black/12 bg-black/02" : "border-white/10 bg-white/02"
          )}>
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center mb-5",
              isLight ? "bg-black/06" : "bg-white/06"
            )}>
              <BriefcaseIcon className={`w-8 h-8 ${isLight ? "text-black/30" : "text-white/30"}`} />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${isLight ? "text-black" : "text-white"}`}>
              No open positions right now
            </h3>
            <p className={`text-sm max-w-sm leading-relaxed mb-1 ${isLight ? "text-black/50" : "text-white/50"}`}>
              We&apos;re not actively hiring at the moment, but we&apos;re always interested in exceptional people.
            </p>
            <p className={`text-sm ${isLight ? "text-black/40" : "text-white/40"}`}>
              Drop your email and we&apos;ll reach out when something opens up.
            </p>
          </div>
        </AnimatedSection>

        {/* Notify me */}
        <AnimatedSection delay={0.15} className="mt-10 max-w-lg mx-auto">
          <div className={cn(
            "rounded-2xl p-6",
            isLight ? "bg-white border border-black/10 shadow-sm" : "glass-card"
          )}>
            <div className="flex items-center gap-3 mb-4">
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                isLight ? "bg-black" : "bg-gradient-to-br from-[#2F8F89] to-[#3B82F6]"
              )}>
                <Bell className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className={`font-semibold text-sm ${isLight ? "text-black" : "text-white"}`}>Get notified when we&apos;re hiring</p>
                <p className={`text-xs ${isLight ? "text-black/45" : "text-white/45"}`}>No spam. One email when something opens up.</p>
              </div>
            </div>

            {submitted ? (
              <div className={cn(
                "rounded-xl px-4 py-3 flex items-center gap-2 text-sm font-medium",
                isLight ? "bg-black/05 text-black" : "bg-white/05 text-white"
              )}>
                <span className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-white text-xs shrink-0",
                  isLight ? "bg-black" : "bg-[#2F8F89]"
                )}>✓</span>
                You&apos;re on the list. We&apos;ll be in touch.
              </div>
            ) : (
              <form onSubmit={handleNotify} className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isLight ? "text-black/30" : "text-white/30"}`} />
                  <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={cn(
                      "w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none transition-all",
                      isLight
                        ? "bg-black/05 border border-black/12 text-black placeholder:text-black/35 focus:border-black/30"
                        : "bg-white/05 border border-white/10 text-white placeholder:text-white/30 focus:border-[#3FE0D0]/40"
                    )}
                  />
                </div>
                <button
                  type="submit"
                  className={cn(
                    "px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shrink-0",
                    isLight
                      ? "bg-black text-white shadow-[0_0_14px_rgba(0,0,0,0.2)] hover:shadow-[0_0_20px_rgba(0,0,0,0.3)]"
                      : "bg-gradient-to-r from-[#2F8F89] to-[#3B82F6] text-white shadow-[0_0_14px_rgba(63,224,208,0.25)] hover:shadow-[0_0_20px_rgba(63,224,208,0.4)]"
                  )}
                >
                  Notify me
                </button>
              </form>
            )}
          </div>
        </AnimatedSection>

        {/* Speculative application nudge */}
        <AnimatedSection delay={0.2} className="mt-6 text-center">
          <p className={`text-sm ${isLight ? "text-black/40" : "text-white/40"}`}>
            Think you&apos;re exceptional?{" "}
            <a
              href="mailto:careers@deluxify.co.za"
              className={cn(
                "font-medium underline underline-offset-2 transition-colors",
                isLight ? "text-black hover:text-black/60" : "text-[#3FE0D0] hover:text-[#3FE0D0]/70"
              )}
            >
              Send us a speculative application.
            </a>
          </p>
        </AnimatedSection>

      </div>
    </section>
  );
}
