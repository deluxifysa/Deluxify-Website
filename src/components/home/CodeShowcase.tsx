"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { CodeBlock, CodeBlockCode, CodeBlockGroup } from "@/components/ui/code-block"
import { AnimatedSection } from "@/components/ui/AnimatedSection"
import { Terminal, CheckCircle2, Zap, Globe, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

const DEMO_CODE = [
  'import { Deluxify } from "@deluxify/ai-sdk"',
  "",
  "const ai = new Deluxify({ apiKey: process.env.DELUXIFY_KEY })",
  "",
  "// Automate your customer support",
  "const agent = await ai.createAgent({",
  '  name: "Support Bot",',
  '  persona: "Friendly South African support agent",',
  '  knowledge: ["./docs", "./faq.md"],',
  '  channels: ["web", "whatsapp"],',
  "})",
  "",
  "// Train on your business data",
  "await agent.train({",
  '  data: "./customer-data.json",',
  '  language: ["en", "zu", "af"],',
  "})",
  "",
  "// Deploy in seconds",
  "const response = await agent.reply({",
  '  message: "What are your trading hours?",',
  "  context: { customer_id: 'cust_123' },",
  "})",
  "",
  "console.log(response.message)",
  "// → 'We are open Mon-Fri 8am-5pm SAST.'",
].join("\n")

const FEATURES = [
  { icon: Globe,        text: "Multi-language: Zulu, Xhosa, Afrikaans, English" },
  { icon: Zap,          text: "WhatsApp, Web & social — one deployment" },
  { icon: CheckCircle2, text: "Train on your own business data in minutes" },
  { icon: Shield,       text: "Fully managed — zero infra headaches" },
]

export function CodeShowcase() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isLight = mounted && theme === "light"

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background glow */}
      {!isLight && (
        <>
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#2F8F89]/10 blur-[120px] pointer-events-none" />
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[#3B82F6]/08 blur-[100px] pointer-events-none" />
        </>
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section label */}
        <AnimatedSection className="text-center mb-16">
          <span
            className="section-tag mb-4 mx-auto"
            style={isLight ? {
              backgroundColor: "rgba(0,0,0,0.06)",
              color: "#0B0B0C",
              border: "1px solid rgba(0,0,0,0.18)",
            } : undefined}
          >
            Developer-First
          </span>
          <h2 className={`text-4xl md:text-5xl font-bold tracking-tight mt-4 ${isLight ? "text-black" : ""}`}>
            Powerful AI.{" "}
            <span className={`font-[family-name:var(--font-caveat)] text-5xl md:text-6xl uppercase ${isLight ? "text-black" : "gradient-text"}`}>
              Simple to ship.
            </span>
          </h2>
          <p className={`mt-4 text-lg max-w-xl mx-auto ${isLight ? "text-black/55" : "text-white/55"}`}>
            Embed intelligent agents, automate workflows, and go live on any channel — in minutes, not months.
          </p>
        </AnimatedSection>

        
        {/* Main two-col layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left — features */}
          <AnimatedSection direction="left" className="space-y-6">
            {FEATURES.map(({ icon: Icon, text }, i) => (
              <div
                key={text}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-2xl transition-all duration-200 group",
                  isLight
                    ? "bg-white border border-black/08 shadow-sm hover:shadow-md hover:border-black/15"
                    : "glass-card hover:bg-white/[0.07]"
                )}
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  isLight ? "bg-black" : "bg-gradient-to-br from-[#2F8F89] to-[#3B82F6]"
                )}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="pt-1">
                  <span className={`text-sm font-medium leading-relaxed ${isLight ? "text-black/80" : "text-white/80"}`}>
                    {text}
                  </span>
                </div>
              </div>
            ))}

            {/* Install badge */}
            <div className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl font-mono text-sm",
              isLight ? "bg-black/05 border border-black/10 text-black/70" : "bg-white/05 border border-white/10 text-white/60"
            )}>
              <span className={isLight ? "text-black/35" : "text-white/30"}>$</span>
              <span>npm install <span className={isLight ? "text-black font-semibold" : "gradient-text font-semibold"}>@deluxify/ai-sdk</span></span>
            </div>
          </AnimatedSection>

          {/* Right — code block */}
          <AnimatedSection direction="right" delay={0.1} className="relative">
            {/* Glow behind code block */}
            {!isLight && (
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-[#2F8F89]/20 to-[#3B82F6]/10 blur-2xl -z-10" />
            )}

            <CodeBlock className={cn(
              "shadow-2xl",
              isLight
                ? "border-black/12 shadow-black/10"
                : "border-white/10 shadow-black/50"
            )}>
              {/* Title bar */}
              <CodeBlockGroup className={cn(
                "px-4 py-3 border-b",
                isLight ? "border-black/10 bg-black/04" : "border-white/10 bg-white/04"
              )}>
                <div className="flex items-center gap-2.5">
                  <div className="flex gap-1.5">
                    {["#FF5F57", "#FFBD2E", "#28C840"].map((c) => (
                      <div key={c} className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <div className={cn(
                    "flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs",
                    isLight ? "bg-black/06 text-black/50" : "bg-white/08 text-white/50"
                  )}>
                    <Terminal className="w-3 h-3" />
                    agent.ts
                  </div>
                </div>
                <div className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-medium",
                  isLight ? "bg-emerald-100 text-emerald-700" : "bg-emerald-500/15 text-emerald-400"
                )}>
                  ● Live
                </div>
              </CodeBlockGroup>

              <CodeBlockCode
                code={DEMO_CODE}
                language="typescript"
                theme={isLight ? "github-light" : "github-dark-dimmed"}
              />

              {/* Response preview */}
              <div className={cn(
                "px-4 py-3 border-t flex items-start gap-3",
                isLight ? "border-black/08 bg-black/02" : "border-white/08 bg-white/02"
              )}>
                <div className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                  isLight ? "bg-black" : "bg-[#2F8F89]"
                )}>
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
                <div>
                  <p className={`text-xs font-medium ${isLight ? "text-black/50" : "text-white/50"}`}>Agent response</p>
                  <p className={`text-xs mt-0.5 ${isLight ? "text-black/80" : "text-white/80"}`}>
                    &ldquo;We&apos;re open Mon–Fri 8am–5pm SAST. How else can I help?&rdquo;
                  </p>
                </div>
              </div>
            </CodeBlock>
          </AnimatedSection>

        </div>
      </div>
    </section>
  )
}
