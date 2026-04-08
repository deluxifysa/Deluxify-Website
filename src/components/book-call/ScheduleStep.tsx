"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { BookingData } from "./BookingFlow";
import { AnimatedSection } from "@/components/ui/AnimatedSection";

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
];

const TOPICS = [
  "AI Strategy & Roadmap",
  "Automation Opportunities",
  "AI Chatbot / Virtual Agent",
  "Web or App Development",
  "Marketing & Growth",
  "General Enquiry",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

type Props = {
  isLight: boolean;
  onNext: (data: Pick<BookingData, "date" | "time" | "name" | "email" | "company" | "topic">) => void;
};

export function ScheduleStep({ isLight, onNext }: Props) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function isDisabled(day: number) {
    const d = new Date(viewYear, viewMonth, day);
    const dow = d.getDay();
    return d < new Date(today.getFullYear(), today.getMonth(), today.getDate()) || dow === 0 || dow === 6;
  }

  function formatDate(day: number) {
    return `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function formatDisplayDate(dateStr: string) {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }

  const canProceed = selectedDate && selectedTime && name.trim() && email.trim();

  const inputClass = cn(
    "w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200",
    isLight
      ? "bg-white border border-black/15 text-black placeholder:text-black/35 focus:border-black/40"
      : "bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-[#3FE0D0]/50"
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canProceed) return;
    onNext({ date: selectedDate, time: selectedTime, name, email, company, topic });
  }

  return (
    <AnimatedSection direction="up">
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">

          {/* Calendar */}
          <div className={cn(
            "rounded-2xl p-6",
            isLight ? "bg-white border border-black/10 shadow-sm" : "glass-card"
          )}>
            {/* Month nav */}
            <div className="flex items-center justify-between mb-5">
              <button type="button" onClick={prevMonth}
                className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                  isLight ? "hover:bg-black/08 text-black" : "hover:bg-white/10 text-white")}>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className={`font-semibold text-sm ${isLight ? "text-black" : "text-white"}`}>
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
              <button type="button" onClick={nextMonth}
                className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                  isLight ? "hover:bg-black/08 text-black" : "hover:bg-white/10 text-white")}>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
                <div key={d} className={`text-center text-xs font-medium py-1 ${isLight ? "text-black/35" : "text-white/35"}`}>{d}</div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-y-1">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const dateStr = formatDate(day);
                const disabled = isDisabled(day);
                const selected = selectedDate === dateStr;
                return (
                  <button
                    key={day}
                    type="button"
                    disabled={disabled}
                    onClick={() => setSelectedDate(dateStr)}
                    className={cn(
                      "mx-auto w-9 h-9 rounded-full text-sm font-medium transition-all duration-150 flex items-center justify-center",
                      disabled ? isLight ? "text-black/20 cursor-not-allowed" : "text-white/20 cursor-not-allowed"
                        : selected
                        ? isLight ? "bg-black text-white shadow-[0_0_12px_rgba(0,0,0,0.3)]" : "bg-[#2F8F89] text-white shadow-[0_0_12px_rgba(63,224,208,0.4)]"
                        : isLight ? "text-black hover:bg-black/08" : "text-white hover:bg-white/10"
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time slots */}
          <div className={cn(
            "rounded-2xl p-6",
            isLight ? "bg-white border border-black/10 shadow-sm" : "glass-card"
          )}>
            <div className="flex items-center gap-2 mb-4">
              <Clock className={`w-4 h-4 ${isLight ? "text-black/50" : "text-white/50"}`} />
              <span className={`text-sm font-semibold uppercase tracking-widest ${isLight ? "text-black/40" : "text-white/40"}`}>
                Available Times
              </span>
            </div>
            {selectedDate ? (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {TIME_SLOTS.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedTime(t)}
                    className={cn(
                      "py-2 px-1 rounded-xl text-sm font-medium text-center transition-all duration-150",
                      selectedTime === t
                        ? isLight ? "bg-black text-white shadow-[0_0_12px_rgba(0,0,0,0.3)]" : "bg-[#2F8F89] text-white shadow-[0_0_12px_rgba(63,224,208,0.4)]"
                        : isLight ? "bg-black/05 text-black hover:bg-black/10 border border-black/10" : "bg-white/05 text-white hover:bg-white/10 border border-white/10"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            ) : (
              <p className={`text-sm ${isLight ? "text-black/35" : "text-white/35"}`}>
                Select a date to see available times.
              </p>
            )}
          </div>

          {/* Details */}
          <div className={cn(
            "rounded-2xl p-6 space-y-4",
            isLight ? "bg-white border border-black/10 shadow-sm" : "glass-card"
          )}>
            <span className={`text-sm font-semibold uppercase tracking-widest ${isLight ? "text-black/40" : "text-white/40"}`}>
              Your Details
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className={`block text-xs mb-1.5 font-medium ${isLight ? "text-black/50" : "text-white/50"}`}>Full Name *</label>
                <input className={inputClass} placeholder="Jane Smith" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div>
                <label className={`block text-xs mb-1.5 font-medium ${isLight ? "text-black/50" : "text-white/50"}`}>Email Address *</label>
                <input type="email" className={inputClass} placeholder="jane@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div>
                <label className={`block text-xs mb-1.5 font-medium ${isLight ? "text-black/50" : "text-white/50"}`}>Company (optional)</label>
                <input className={inputClass} placeholder="Acme Corp" value={company} onChange={e => setCompany(e.target.value)} />
              </div>
              <div>
                <label className={`block text-xs mb-1.5 font-medium ${isLight ? "text-black/50" : "text-white/50"}`}>What do you need help with?</label>
                <select
                  className={cn(inputClass, "cursor-pointer")}
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                >
                  {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* CTA */}
          <button
            type="submit"
            disabled={!canProceed}
            className={cn(
              "w-full py-4 rounded-2xl font-semibold text-sm tracking-wide transition-all duration-200",
              canProceed
                ? isLight
                  ? "bg-black text-white shadow-[0_0_20px_rgba(0,0,0,0.25)] hover:shadow-[0_0_28px_rgba(0,0,0,0.35)]"
                  : "bg-gradient-to-r from-[#2F8F89] to-[#3B82F6] text-white shadow-[0_0_20px_rgba(63,224,208,0.3)] hover:shadow-[0_0_28px_rgba(63,224,208,0.45)]"
                : isLight ? "bg-black/10 text-black/30 cursor-not-allowed" : "bg-white/10 text-white/30 cursor-not-allowed"
            )}
          >
            Continue to Payment →
          </button>

          {selectedDate && selectedTime && (
            <p className={`text-center text-xs ${isLight ? "text-black/40" : "text-white/40"}`}>
              {formatDisplayDate(selectedDate)} at {selectedTime} SAST
            </p>
          )}
        </div>
      </form>
    </AnimatedSection>
  );
}
