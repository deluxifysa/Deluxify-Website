"use client";

import { useState } from "react";
import { Lock, CreditCard, ArrowLeft, Calendar, Clock, User, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { BookingData } from "./BookingFlow";
import { AnimatedSection } from "@/components/ui/AnimatedSection";

type Props = {
  isLight: boolean;
  booking: BookingData;
  onBack: () => void;
  onPay: () => void;
};

function formatDisplayDate(dateStr: string) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
}

export function PaymentStep({ isLight, booking, onBack, onPay }: Props) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [loading, setLoading] = useState(false);

  const inputClass = cn(
    "w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200",
    isLight
      ? "bg-white border border-black/15 text-black placeholder:text-black/35 focus:border-black/40"
      : "bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-[#3FE0D0]/50"
  );

  function formatCardNumber(val: string) {
    return val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  }

  function formatExpiry(val: string) {
    const clean = val.replace(/\D/g, "").slice(0, 4);
    return clean.length >= 3 ? `${clean.slice(0, 2)} / ${clean.slice(2)}` : clean;
  }

  const canPay = cardNumber.replace(/\s/g, "").length === 16 && expiry.length >= 4 && cvv.length >= 3 && cardName.trim();

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!canPay) return;
    setLoading(true);
    try {
      // Simulate payment processing — replace with real gateway (e.g. Paystack, Peach Payments)
      await new Promise((r) => setTimeout(r, 2000));

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: booking.name,
          email: booking.email,
          company: booking.company,
          topic: booking.topic,
          date: booking.date,
          time: booking.time,
          reference: booking.reference,
        }),
      });
      if (!res.ok) throw new Error("Booking save failed");

      onPay();
    } catch (err) {
      console.error("Payment/booking error:", err);
      alert("Payment processed but we couldn't save your booking. Please contact us with your reference.");
      onPay(); // still advance so user sees confirmation
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatedSection direction="up">
      <div className="space-y-6">

        {/* Booking summary */}
        <div className={cn(
          "rounded-2xl p-5",
          isLight ? "bg-white border border-black/10 shadow-sm" : "glass-card"
        )}>
          <p className={`text-xs font-semibold uppercase tracking-widest mb-4 ${isLight ? "text-black/40" : "text-white/40"}`}>
            Booking Summary
          </p>
          <div className="space-y-3">
            <SummaryRow icon={Calendar} label="Date" value={formatDisplayDate(booking.date)} isLight={isLight} />
            <SummaryRow icon={Clock} label="Time" value={`${booking.time} SAST`} isLight={isLight} />
            <SummaryRow icon={User} label="Name" value={booking.name} isLight={isLight} />
            <SummaryRow icon={Briefcase} label="Topic" value={booking.topic} isLight={isLight} />
          </div>

          <div className={`mt-5 pt-4 border-t flex items-center justify-between ${isLight ? "border-black/10" : "border-white/10"}`}>
            <span className={`text-sm font-medium ${isLight ? "text-black/60" : "text-white/60"}`}>
              Strategy Session — 30 min
            </span>
            <div className="text-right">
              <span className={`text-xl font-bold ${isLight ? "text-black" : "gradient-text"}`}>R 500</span>
              <p className={`text-xs mt-0.5 ${isLight ? "text-black/40" : "text-white/40"}`}>fully refundable deposit</p>
            </div>
          </div>
        </div>

        {/* Payment form */}
        <form onSubmit={handlePay}>
          <div className={cn(
            "rounded-2xl p-6 space-y-5",
            isLight ? "bg-white border border-black/10 shadow-sm" : "glass-card"
          )}>
            <div className="flex items-center justify-between">
              <p className={`text-xs font-semibold uppercase tracking-widest ${isLight ? "text-black/40" : "text-white/40"}`}>
                Card Details
              </p>
              <div className="flex items-center gap-1.5">
                {/* Card brand placeholders */}
                {["VISA", "MC", "AMEX"].map(b => (
                  <span key={b} className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded border",
                    isLight ? "border-black/15 text-black/40" : "border-white/15 text-white/40"
                  )}>{b}</span>
                ))}
              </div>
            </div>

            {/* Card number */}
            <div>
              <label className={`block text-xs mb-1.5 font-medium ${isLight ? "text-black/50" : "text-white/50"}`}>Card Number</label>
              <div className="relative">
                <input
                  className={cn(inputClass, "pr-10")}
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                  inputMode="numeric"
                />
                <CreditCard className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isLight ? "text-black/30" : "text-white/30"}`} />
              </div>
            </div>

            {/* Name on card */}
            <div>
              <label className={`block text-xs mb-1.5 font-medium ${isLight ? "text-black/50" : "text-white/50"}`}>Name on Card</label>
              <input
                className={inputClass}
                placeholder="JANE SMITH"
                value={cardName}
                onChange={e => setCardName(e.target.value.toUpperCase())}
              />
            </div>

            {/* Expiry + CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs mb-1.5 font-medium ${isLight ? "text-black/50" : "text-white/50"}`}>Expiry Date</label>
                <input
                  className={inputClass}
                  placeholder="MM / YY"
                  value={expiry}
                  onChange={e => setExpiry(formatExpiry(e.target.value))}
                  inputMode="numeric"
                />
              </div>
              <div>
                <label className={`block text-xs mb-1.5 font-medium ${isLight ? "text-black/50" : "text-white/50"}`}>CVV</label>
                <input
                  className={inputClass}
                  placeholder="•••"
                  value={cvv}
                  maxLength={4}
                  onChange={e => setCvv(e.target.value.replace(/\D/g, ""))}
                  inputMode="numeric"
                />
              </div>
            </div>

            {/* Security note */}
            <div className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-3",
              isLight ? "bg-black/04" : "bg-white/04"
            )}>
              <Lock className={`w-3.5 h-3.5 shrink-0 ${isLight ? "text-black/40" : "text-white/40"}`} />
              <p className={`text-xs ${isLight ? "text-black/45" : "text-white/45"}`}>
                Your payment is encrypted and secure. The deposit is fully refundable if you cancel 24 hrs before your session.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={onBack}
              className={cn(
                "flex items-center gap-2 px-5 py-4 rounded-2xl text-sm font-medium transition-all duration-200",
                isLight ? "border border-black/15 text-black hover:bg-black/05" : "border border-white/15 text-white hover:bg-white/05"
              )}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              type="submit"
              disabled={!canPay || loading}
              className={cn(
                "flex-1 py-4 rounded-2xl font-semibold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2",
                canPay && !loading
                  ? isLight
                    ? "bg-black text-white shadow-[0_0_20px_rgba(0,0,0,0.25)] hover:shadow-[0_0_28px_rgba(0,0,0,0.35)]"
                    : "bg-gradient-to-r from-[#2F8F89] to-[#3B82F6] text-white shadow-[0_0_20px_rgba(63,224,208,0.3)] hover:shadow-[0_0_28px_rgba(63,224,208,0.45)]"
                  : isLight ? "bg-black/10 text-black/30 cursor-not-allowed" : "bg-white/10 text-white/30 cursor-not-allowed"
              )}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Pay R 500 & Confirm Booking
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AnimatedSection>
  );
}

function SummaryRow({ icon: Icon, label, value, isLight }: { icon: React.ElementType; label: string; value: string; isLight: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", isLight ? "bg-black/08" : "bg-white/08")}>
        <Icon className={`w-3.5 h-3.5 ${isLight ? "text-black/60" : "text-white/60"}`} />
      </div>
      <span className={`text-xs w-12 shrink-0 ${isLight ? "text-black/40" : "text-white/40"}`}>{label}</span>
      <span className={`text-sm font-medium ${isLight ? "text-black" : "text-white"}`}>{value}</span>
    </div>
  );
}
