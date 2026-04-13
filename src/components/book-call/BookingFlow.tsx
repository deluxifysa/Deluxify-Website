"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { ScheduleStep } from "./ScheduleStep";
import { PaymentStep } from "./PaymentStep";
import { ConfirmationStep } from "./ConfirmationStep";
import { CheckCircle2, Calendar, CreditCard } from "lucide-react";
import { GradientOrb } from "@/components/ui/GradientOrb";
import { cn } from "@/lib/utils";

export type BookingData = {
  date: string;
  time: string;
  name: string;
  email: string;
  company: string;
  topic: string;
};

const steps = [
  { id: 1, label: "Schedule", icon: Calendar },
  { id: 2, label: "Payment", icon: CreditCard },
  { id: 3, label: "Confirmed", icon: CheckCircle2 },
];

export function BookingFlow() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLight = mounted && theme === "light";

  const [step, setStep] = useState(1);
  const [booking, setBooking] = useState<Partial<BookingData>>({});

  function handleScheduleDone(data: Pick<BookingData, "date" | "time" | "name" | "email" | "company" | "topic">) {
    setBooking((prev) => ({ ...prev, ...data }));
    setStep(2);
  }

  function handlePaymentDone() {
    setStep(3);
  }

  return (
    <section className="relative min-h-screen pt-28 pb-20 overflow-hidden">
      {!isLight && (
        <>
          <GradientOrb className="-top-20 left-1/4 -translate-x-1/2" color="mixed" size="lg" />
          <GradientOrb className="top-1/2 right-0 translate-x-1/3" color="blue" size="md" />
        </>
      )}

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page heading */}
        <div className="text-center mb-10">
          <span
            className="section-tag mb-4 mx-auto"
            style={isLight ? {
              backgroundColor: "rgba(0,0,0,0.06)",
              color: "#0B0B0C",
              border: "1px solid rgba(0,0,0,0.18)",
            } : undefined}
          >
            Strategy Session
          </span>
          <h1 className={`text-4xl md:text-5xl font-bold tracking-tight mt-4 ${isLight ? "text-black" : ""}`}>
            Book your{" "}
            <span className={`font-[family-name:var(--font-caveat)] text-5xl md:text-6xl uppercase ${isLight ? "text-black" : "gradient-text"}`}>
              Strategic call.
            </span>
          </h1>
          <p className={`mt-3 text-sm max-w-md mx-auto ${isLight ? "text-black/50" : "text-white/50"}`}>
            Pick a time, complete payment to secure your slot — your session is fully confirmed once payment is processed.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const done = step > s.id;
            const active = step === s.id;
            return (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                      done
                        ? isLight ? "bg-black border-black" : "bg-[#2F8F89] border-[#2F8F89]"
                        : active
                        ? isLight ? "border-black bg-white" : "border-[#3FE0D0] bg-transparent"
                        : isLight ? "border-black/20 bg-white" : "border-white/20 bg-transparent"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4 transition-colors",
                        done ? "text-white"
                          : active ? isLight ? "text-black" : "text-[#3FE0D0]"
                          : isLight ? "text-black/30" : "text-white/30"
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium transition-colors",
                      active ? isLight ? "text-black" : "text-white"
                        : done ? isLight ? "text-black/60" : "text-white/60"
                        : isLight ? "text-black/30" : "text-white/30"
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-16 h-px mx-2 mb-5 transition-all duration-500",
                      step > s.id
                        ? isLight ? "bg-black" : "bg-[#2F8F89]"
                        : isLight ? "bg-black/15" : "bg-white/15"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step content */}
        {step === 1 && (
          <ScheduleStep isLight={isLight} onNext={handleScheduleDone} />
        )}
        {step === 2 && (
          <PaymentStep isLight={isLight} booking={booking as BookingData} onBack={() => setStep(1)} onPay={handlePaymentDone} />
        )}
        {step === 3 && (
          <ConfirmationStep isLight={isLight} booking={booking as BookingData} />
        )}
      </div>
    </section>
  );
}
