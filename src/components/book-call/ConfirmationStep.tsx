"use client";

import { CheckCircle2, Calendar, Clock, Mail, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { BookingData } from "./BookingFlow";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import Link from "next/link";

type Props = {
  isLight: boolean;
  booking: BookingData;
};

function formatDisplayDate(dateStr: string) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export function ConfirmationStep({ isLight, booking }: Props) {
  return (
    <AnimatedSection direction="up">
      <div className="space-y-6 text-center">

        {/* Success icon */}
        <div className="flex justify-center">
          <div className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center",
            isLight
              ? "bg-black shadow-[0_0_32px_8px_rgba(0,0,0,0.2)]"
              : "bg-gradient-to-br from-[#2F8F89] to-[#3B82F6] shadow-[0_0_40px_rgba(63,224,208,0.4)]"
          )}>
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
        </div>

        <div>
          <h2 className={`text-3xl font-bold mb-2 ${isLight ? "text-black" : ""}`}>
            You&apos;re{" "}
            <span className={`font-[family-name:var(--font-caveat)] text-4xl uppercase ${isLight ? "text-black" : "gradient-text"}`}>
              booked!
            </span>
          </h2>
          <p className={`text-sm max-w-sm mx-auto ${isLight ? "text-black/50" : "text-white/50"}`}>
            Payment received. Your strategy session is confirmed. Check your email for the calendar invite and call link.
          </p>
        </div>

        {/* Details card */}
        <div className={cn(
          "rounded-2xl p-6 text-left space-y-4",
          isLight ? "bg-white border border-black/10 shadow-sm" : "glass-card"
        )}>
          <div className="flex items-start gap-4">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", isLight ? "bg-black/08" : "bg-white/08")}>
              <Calendar className={`w-5 h-5 ${isLight ? "text-black" : "text-[#3FE0D0]"}`} />
            </div>
            <div>
              <p className={`text-xs font-medium uppercase tracking-widest mb-0.5 ${isLight ? "text-black/40" : "text-white/40"}`}>Date & Time</p>
              <p className={`font-semibold ${isLight ? "text-black" : "text-white"}`}>{formatDisplayDate(booking.date)}</p>
              <p className={`text-sm ${isLight ? "text-black/60" : "text-white/60"}`}>{booking.time} SAST — 30 min session</p>
            </div>
          </div>

          <div className={`border-t ${isLight ? "border-black/08" : "border-white/08"}`} />

          <div className="flex items-start gap-4">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", isLight ? "bg-black/08" : "bg-white/08")}>
              <Mail className={`w-5 h-5 ${isLight ? "text-black" : "text-[#3FE0D0]"}`} />
            </div>
            <div>
              <p className={`text-xs font-medium uppercase tracking-widest mb-0.5 ${isLight ? "text-black/40" : "text-white/40"}`}>Confirmation sent to</p>
              <p className={`font-semibold ${isLight ? "text-black" : "text-white"}`}>{booking.email}</p>
              <p className={`text-sm ${isLight ? "text-black/60" : "text-white/60"}`}>Includes calendar invite and Google Meet link</p>
            </div>
          </div>

          <div className={`border-t ${isLight ? "border-black/08" : "border-white/08"}`} />

          <div className="flex items-center justify-between">
            <span className={`text-sm ${isLight ? "text-black/50" : "text-white/50"}`}>Amount paid</span>
            <span className={`text-lg font-bold ${isLight ? "text-black" : "gradient-text"}`}>R 500 <span className={`text-xs font-normal ${isLight ? "text-black/40" : "text-white/40"}`}>(refundable)</span></span>
          </div>
        </div>

        {/* What's next */}
        <div className={cn(
          "rounded-2xl p-5 text-left",
          isLight ? "bg-black/04 border border-black/08" : "bg-white/04 border border-white/08"
        )}>
          <p className={`text-xs font-semibold uppercase tracking-widest mb-3 ${isLight ? "text-black/40" : "text-white/40"}`}>What happens next</p>
          <div className="space-y-2.5">
            {[
              "You'll receive a confirmation email with your Google Meet link.",
              "A Deluxify strategist will review your topic before the call.",
              "Show up ready — we'll bring the insights.",
              "Cancel or reschedule any time (24 hrs notice for a full refund).",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className={cn(
                  "w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5",
                  isLight ? "bg-black text-white" : "bg-[#2F8F89] text-white"
                )}>
                  {i + 1}
                </span>
                <span className={`text-sm ${isLight ? "text-black/65" : "text-white/65"}`}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-medium transition-all duration-200",
              isLight ? "border border-black/15 text-black hover:bg-black/05" : "border border-white/15 text-white hover:bg-white/05"
            )}
          >
            <Download className="w-4 h-4" />
            Download Receipt
          </button>
          <Link
            href="/"
            className={cn(
              "flex-1 flex items-center justify-center py-4 rounded-2xl text-sm font-semibold transition-all duration-200",
              isLight
                ? "bg-black text-white shadow-[0_0_20px_rgba(0,0,0,0.2)] hover:shadow-[0_0_28px_rgba(0,0,0,0.3)]"
                : "bg-gradient-to-r from-[#2F8F89] to-[#3B82F6] text-white shadow-[0_0_20px_rgba(63,224,208,0.25)] hover:shadow-[0_0_28px_rgba(63,224,208,0.4)]"
            )}
          >
            Back to Home
          </Link>
        </div>

        {/* Reference */}
        <p className={`text-xs ${isLight ? "text-black/30" : "text-white/30"}`}>
          Reference: DLX-{Date.now().toString(36).toUpperCase().slice(-8)}
        </p>
      </div>
    </AnimatedSection>
  );
}
