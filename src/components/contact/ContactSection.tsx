"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import {
  Mail, Phone, MapPin, MessageCircle, Calendar,
  CheckCircle, Loader2, Send
} from "lucide-react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useEffect } from "react";

type FormData = {
  name: string;
  email: string;
  company: string;
  phone: string;
  service: string;
  message: string;
};

const services = [
  "AI Strategy & Consulting",
  "AI Automation",
  "AI Chatbot",
  "AI Training",
  "Web Development",
  "App Development",
  "SaaS Development",
  "E-commerce",
  "Branding & Design",
  "SEO",
  "Social Media Management",
  "Content Production",
  "Managed IT & Cloud",
  "Not sure. need guidance",
];

export function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  useEffect(() => setMounted(true), []);
  const isLight = mounted && theme === "light";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Submission failed");
      setSubmitted(true);
    } catch (err) {
      console.error("Contact form error:", err);
      alert("Something went wrong. Please try again or contact us directly.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = isLight
    ? "w-full px-4 py-3 rounded-xl bg-black/[0.04] border text-black placeholder:text-black/30 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
    : "w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder:text-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all";

  return (
    <section className="py-16 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Contact info */}
          <AnimatedSection direction="left" className="lg:col-span-2 space-y-6">
            <div>
              <h2 className={`text-2xl font-bold mb-2 ${isLight ? "text-black" : ""}`}>Let&apos;s build something powerful</h2>
              <p className={`text-sm leading-relaxed ${isLight ? "text-black/55" : "text-white/50"}`}>
                Fill in the form and a strategist will reach out within 4 business hours.
                Prefer instant contact? Reach us directly on WhatsApp or book a call.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: Mail, label: "Email", value: "hello@deluxify.ai", href: "mailto:hello@deluxify.ai" },
                { icon: Phone, label: "Phone", value: "+27 (0) 51 123 4567", href: "tel:+27511234567" },
                { icon: MapPin, label: "Location", value: "Bloemfontein, South Africa", href: "#" },
              ].map((contact) => (
                <a
                  key={contact.label}
                  href={contact.href}
                  className={`p-4 flex items-center gap-4 transition-all duration-200 group rounded-2xl border ${
                    isLight
                      ? "bg-white border-black/10 shadow-sm hover:bg-black/[0.02]"
                      : "glass-card hover:bg-white/[0.07] border-white/5"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-600/30 flex items-center justify-center shrink-0">
                    <contact.icon className="w-5 h-5 text-brand-400" />
                  </div>
                  <div>
                    <p className={`text-xs ${isLight ? "text-black/35" : "text-white/30"}`}>{contact.label}</p>
                    <p className={`font-medium text-sm group-hover:text-brand-400 transition-colors ${isLight ? "text-black" : "text-white"}`}>
                      {contact.value}
                    </p>
                  </div>
                </a>
              ))}
            </div>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/27101234567?text=Hi%20Deluxify%2C%20I%27d%20like%20to%20learn%20more%20about%20your%20AI%20services."
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 w-full p-5 border border-green-500/20 hover:bg-green-500/10 transition-all duration-200 group rounded-2xl ${
                isLight ? "bg-white shadow-sm" : "glass-card"
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(34,197,94,0.3)] group-hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-shadow">
                <MessageCircle className="w-6 h-6 text-white fill-white" />
              </div>
              <div>
                <p className={`font-semibold text-sm ${isLight ? "text-black" : ""}`}>Chat on WhatsApp</p>
                <p className={`text-xs ${isLight ? "text-black/40" : "text-white/40"}`}>Instant response during business hours</p>
              </div>
            </a>

            {/* Calendar CTA */}
            <a
              href="/book-call"
              id="demo"
              className={`flex items-center gap-3 w-full p-5 border border-brand-500/20 hover:bg-brand-500/10 transition-all duration-200 group rounded-2xl ${
                isLight ? "bg-white shadow-sm" : "glass-card"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-shadow ${
                isLight
                  ? "bg-black shadow-[0_0_16px_4px_rgba(0,0,0,0.25)] group-hover:shadow-[0_0_24px_8px_rgba(0,0,0,0.3)]"
                  : "bg-brand-600 shadow-glow group-hover:shadow-glow-lg"
              }`}>
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className={`font-semibold text-sm ${isLight ? "text-black" : ""}`}>Book a Strategy Call</p>
                <p className={`text-xs ${isLight ? "text-black/40" : "text-white/40"}`}>Free 30-min session.</p>
              </div>
            </a>
          </AnimatedSection>

          {/* Form */}
          <AnimatedSection direction="right" delay={0.1} className="lg:col-span-3">
            <div className={`p-8 rounded-2xl border ${
              isLight
                ? "bg-white border-black/10 shadow-sm"
                : "glass-card gradient-border"
            }`}>
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mb-6">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className={`text-2xl font-bold mb-2 ${isLight ? "text-black" : ""}`}>Message sent!</h3>
                  <p className={`max-w-sm ${isLight ? "text-black/60" : "text-white/60"}`}>
                    Thank you for reaching out. An AI strategist from our team will contact you
                    within 4 business hours.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isLight ? "text-black/60" : "text-white/60"}`}>
                        Full Name <span className="text-brand-400">*</span>
                      </label>
                      <input
                        {...register("name", { required: "Name is required" })}
                        placeholder="Sipho Dlamini"
                        className={cn(
                          inputClass,
                          errors.name ? "border-red-500/50" : isLight ? "border-black/10" : "border-white/10"
                        )}
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                      )}
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isLight ? "text-black/60" : "text-white/60"}`}>
                        Work Email <span className="text-brand-400">*</span>
                      </label>
                      <input
                        {...register("email", {
                          required: "Email is required",
                          pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" },
                        })}
                        type="email"
                        placeholder="sipho@company.co.za"
                        className={cn(
                          inputClass,
                          errors.email ? "border-red-500/50" : isLight ? "border-black/10" : "border-white/10"
                        )}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isLight ? "text-black/60" : "text-white/60"}`}>
                        Company Name
                      </label>
                      <input
                        {...register("company")}
                        placeholder="Acme Corp (Pty) Ltd"
                        className={cn(inputClass, isLight ? "border-black/10" : "border-white/10")}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isLight ? "text-black/60" : "text-white/60"}`}>
                        Phone Number
                      </label>
                      <input
                        {...register("phone")}
                        type="tel"
                        placeholder="+27 82 123 4567"
                        className={cn(inputClass, isLight ? "border-black/10" : "border-white/10")}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isLight ? "text-black/60" : "text-white/60"}`}>
                      Service of Interest <span className="text-brand-400">*</span>
                    </label>
                    <select
                      {...register("service", { required: "Please select a service" })}
                      className={cn(
                        inputClass,
                        "appearance-none",
                        errors.service ? "border-red-500/50" : isLight ? "border-black/10" : "border-white/10"
                      )}
                      style={{ colorScheme: isLight ? "light" : "dark" }}
                    >
                      <option value="" className={isLight ? "bg-white text-black" : "bg-surface-900"}>Select a service...</option>
                      {services.map((s) => (
                        <option key={s} value={s} className={isLight ? "bg-white text-black" : "bg-surface-900"}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {errors.service && (
                      <p className="text-red-500 text-xs mt-1">{errors.service.message}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isLight ? "text-black/60" : "text-white/60"}`}>
                      Tell us about your business challenge <span className="text-brand-400">*</span>
                    </label>
                    <textarea
                      {...register("message", { required: "Please describe your challenge" })}
                      rows={4}
                      placeholder="Tell us about your business, what you're trying to achieve, or where technology is holding you back..."
                      className={cn(
                        inputClass,
                        "resize-none",
                        errors.message ? "border-red-500/50" : isLight ? "border-black/10" : "border-white/10"
                      )}
                    />
                    {errors.message && (
                      <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-4 text-base disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>

                  <p className={`text-xs text-center ${isLight ? "text-black/30" : "text-white/25"}`}>
                    By submitting, you agree to our Privacy Policy and Terms of Service.
                    We are POPIA compliant and will never share your data.
                  </p>
                </form>
              )}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
