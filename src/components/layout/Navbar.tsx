"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <motion.header
        className={cn(
          "fixed top-4 left-0 right-0 z-50 overflow-hidden",
          scrolled
            ? "bg-white/90 dark:bg-surface-950/85 backdrop-blur-xl border border-black/[0.08] dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.10)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
            : "bg-transparent border-transparent"
        )}
        initial={{ left: 0, right: 0, borderRadius: 0 }}
        animate={{
          left: scrolled ? 16 : 0,
          right: scrolled ? 16 : 0,
          borderRadius: scrolled ? 20 : 0,
        }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <Image
              src="/logo.png"
              alt="Deluxify"
              width={140}
              height={40}
              className="h-10 w-auto object-contain brightness-0 dark:invert"
              priority
            />
          </Link>

          {/* Desktop links — absolutely centred */}
          <ul className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      active
                        ? "text-black bg-black/08 dark:text-white dark:bg-white/10"
                        : "text-black/55 hover:text-black hover:bg-black/05 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/5"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/book-call"
              className="text-sm font-semibold px-4 py-2 rounded-xl text-white transition-all duration-200 bg-black shadow-[0_0_14px_rgba(0,0,0,0.25)] hover:shadow-[0_0_20px_rgba(0,0,0,0.35)] dark:bg-gradient-to-r dark:from-[#2F8F89] dark:to-[#3B82F6] dark:shadow-[0_0_14px_rgba(63,224,208,0.3)] dark:hover:shadow-[0_0_22px_rgba(63,224,208,0.45)]"
            >
              Book a Call
            </Link>
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="p-2 rounded-lg transition-colors text-black/60 hover:text-black hover:bg-black/06 dark:text-white/80 dark:hover:text-white dark:hover:bg-white/10"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-20 z-40 bg-white/97 dark:bg-surface-900/95 backdrop-blur-xl border-b border-black/[0.08] dark:border-white/10 md:hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                      active
                        ? "text-black bg-black/08 dark:text-white dark:bg-brand-600/20"
                        : "text-black/60 hover:text-black hover:bg-black/05 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/5"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="pt-3 border-t border-black/[0.08] dark:border-white/10">
                <Link
                  href="/book-call"
                  className="flex items-center justify-center text-sm font-semibold px-4 py-3 rounded-xl text-white transition-all duration-200 bg-black shadow-[0_0_14px_rgba(0,0,0,0.2)] dark:bg-gradient-to-r dark:from-[#2F8F89] dark:to-[#3B82F6] dark:shadow-[0_0_14px_rgba(63,224,208,0.25)]"
                >
                  Book a Call
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
