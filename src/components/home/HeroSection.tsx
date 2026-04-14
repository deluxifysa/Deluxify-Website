"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { GLSLHills } from "@/components/ui/glsl-hills";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export function HeroSection() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isLight = mounted && theme === "light";

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: isLight
            ? "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,0,0,0.06) 0%, transparent 60%)"
            : "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(47,143,137,0.35) 0%, transparent 60%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ filter: isLight ? "grayscale(1) brightness(0.25)" : "none" }}
      >
        <GLSLHills width="100%" height="100%" cameraZ={125} planeSize={256} speed={0.5} />
      </div>

      {/* Grid lines */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: isLight
            ? "linear-gradient(to right, black 1px, transparent 1px), linear-gradient(to bottom, black 1px, transparent 1px)"
            : "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          {/* Badge */}
          <motion.div variants={item}>
            <span className="section-tag mb-6">
              <Sparkles className="w-3 h-3" />
              <span className="sm:hidden">RSA&apos;s Premium AI &amp; Technology Partner</span>
              <span className="hidden sm:inline">South Africa&apos;s Premium AI &amp; Technology Partner</span>
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={item}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] text-balance max-w-5xl mb-6 text-black dark:text-white"
          >
            Luxury Technology.{" "}
            <span className="gradient-text">Intelligent Growth.</span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            variants={item}
            className="text-lg md:text-xl max-w-2xl leading-relaxed mb-10 text-balance text-black/55 dark:text-white/60"
          >
            We design, build, and automate powerful digital systems that transform your business.
            From AI and custom software to marketing and managed infrastructure.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={item} className="flex flex-col sm:flex-row items-center gap-4">
            <Link href="/contact" className="btn-primary text-base px-8 py-4 group">
              Book a Strategy Call
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/services" className="btn-secondary text-base px-8 py-4 group">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center ${isLight ? "bg-black/10" : "bg-white/10"}`}>
                <Play className={`w-3 h-3 fill-current ${isLight ? "text-black" : "text-white"}`} />
              </span>
              Explore Services
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div
            variants={item}
            className="mt-14 flex flex-col sm:flex-row items-center gap-6 text-sm text-black/40 dark:text-white/40"
          >
            <div className="flex -space-x-3">
              {[
                { src: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&auto=format&fit=crop&q=60", fallback: "TN" },
                { src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&auto=format&fit=crop&q=60", fallback: "PG" },
                { src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=60", fallback: "MV" },
                { src: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&auto=format&fit=crop&q=60", fallback: "ZM" },
                { src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=60", fallback: "JP" },
              ].map((a, i) => (
                <Avatar
                  key={i}
                  className={`w-8 h-8 border-2 ${isLight ? "border-[#F8F8F8]" : "border-[#0B0B0C]"}`}
                  style={{ zIndex: 5 - i }}
                >
                  <AvatarImage src={a.src} alt="Client" />
                  <AvatarFallback className="text-[10px]">{a.fallback}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            <span>
              <strong className="font-semibold text-black dark:text-white">150+</strong> businesses
              transformed across South Africa
            </span>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-black/20 dark:bg-white/20" />
            <span>
              <strong className="font-semibold text-black dark:text-white">4.9/5</strong> average client
              rating
            </span>
          </motion.div>
        </motion.div>

        {/* Floating dashboard card */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 relative max-w-4xl mx-auto"
        >
          <div className="glass-card gradient-border p-4 md:p-6 shadow-glow-lg">
            {/* Mock dashboard UI */}
            <div className={`rounded-xl p-4 space-y-3 ${isLight ? "bg-white border border-black/08" : "bg-surface-900"}`}>
              <div className={`flex items-center gap-3 pb-3 border-b ${isLight ? "border-black/08" : "border-white/5"}`}>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className={`text-xs ${isLight ? "text-black/40" : "text-white/40"}`}>
                  Deluxify AI Dashboard · Live
                </span>
                <div className="ml-auto flex gap-2">
                  {["bg-red-400", "bg-yellow-400", "bg-green-400"].map((c, i) => (
                    <div key={i} className={`w-3 h-3 rounded-full ${c} opacity-70`} />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Processes Automated", value: "14,200+", change: "+31%" },
                  { label: "Hours Saved", value: "4,800+", change: "+22%" },
                  { label: "Revenue Generated", value: "R4.7M", change: "+47%" },
                  { label: "System Uptime", value: "99.97%", change: "SLA-backed" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className={`rounded-xl p-3 ${isLight ? "bg-black/04 border border-black/06" : "bg-white/5"}`}
                  >
                    <p className={`text-xs mb-1 ${isLight ? "text-black/45" : "text-white/40"}`}>{stat.label}</p>
                    <p className={`font-bold text-lg ${isLight ? "text-black" : "text-white"}`}>{stat.value}</p>
                    <p className="text-green-500 text-xs font-medium">{stat.change}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { label: "Email Campaigns", pct: 78 },
                  { label: "Lead Qualification", pct: 92 },
                  { label: "Support Resolution", pct: 85 },
                ].map((bar) => (
                  <div key={bar.label} className="space-y-1.5">
                    <div className={`flex justify-between text-xs ${isLight ? "text-black/45" : "text-white/40"}`}>
                      <span>{bar.label}</span>
                      <span>{bar.pct}%</span>
                    </div>
                    <div className={`h-1.5 rounded-full overflow-hidden ${isLight ? "bg-black/08" : "bg-white/5"}`}>
                      <motion.div
                        className={`h-full rounded-full ${isLight ? "bg-black" : "bg-gradient-to-r from-brand-500 to-accent-500"}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${bar.pct}%` }}
                        transition={{ delay: 1.2, duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
