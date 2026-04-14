"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  Company: [
    { label: "About", href: "/about" },
    { label: "Case Studies", href: "/case-studies" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
  ],
  Services: [
    { label: "AI Automation", href: "/services#automation" },
    { label: "AI Chatbots", href: "/services#chatbots" },
    { label: "Integrations", href: "/services#integrations" },
    { label: "AI Consulting", href: "/services#consulting" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

const socials = [
  { icon: Twitter, href: "https://twitter.com/deluxifyai", label: "Twitter" },
  { icon: Linkedin, href: "https://linkedin.com/company/deluxify", label: "LinkedIn" },
  { icon: Instagram, href: "https://instagram.com/deluxifyai", label: "Instagram" },
];

export function Footer() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLight = mounted && theme === "light";

  return (
    <footer
      className="border-t border-white/10 transition-colors duration-300"
      style={{ backgroundColor: isLight ? "#0B0B0C" : undefined }}
    >
      {/* Email capture */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className={`p-5 sm:p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 rounded-2xl border ${
            isLight
              ? "bg-white border-black/10 shadow-[0_4px_24px_rgba(0,0,0,0.08)]"
              : "glass-card gradient-border"
          }`}>
            <div>
              <h3 className={`text-xl font-bold mb-1 ${isLight ? "text-black" : "text-white"}`}>
                Stay ahead of the AI curve
              </h3>
              <p className={`text-sm ${isLight ? "text-black/55" : "text-white/50"}`}>
                Weekly insights on AI automation, business growth, and industry news.
              </p>
            </div>
            <form className="flex flex-col sm:flex-row w-full md:w-auto gap-3 min-w-0">
              <input
                type="email"
                placeholder="Enter your email"
                className={`flex-1 md:w-64 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all ${
                  isLight
                    ? "bg-black/[0.04] border border-black/10 text-black placeholder:text-black/35"
                    : "bg-white/5 border border-white/10 text-white placeholder:text-white/30"
                }`}
              />
              <button type="submit" className="btn-primary whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-10">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center mb-4">
              <Image
                src="/logo.png"
                alt="Deluxify"
                width={140}
                height={40}
                className="h-10 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs mb-6">
              South Africa&apos;s #1 AI solutions company. We help businesses automate, scale, and thrive in the age of artificial intelligence.
            </p>
            <div className="space-y-2 text-sm text-white/40">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-white/50" />
                <span>Bloemfontein, South Africa</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-white/50" />
                <span>+27 (0) 10 123 4567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-white/50" />
                <span>hello@deluxify.ai</span>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/50 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-sm">
            © {new Date().getFullYear()} Deluxify (Pty) Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  isLight
                    ? "bg-white text-black hover:bg-white/80"
                    : "glass text-white/40 hover:text-white hover:bg-white/10"
                }`}
              >
                <social.icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
