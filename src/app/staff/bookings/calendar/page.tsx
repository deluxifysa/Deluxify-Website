"use client";

import { useEffect, useState, useMemo } from "react";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase";
import { GlassCalendar } from "@/components/ui/glass-calendar";
import { format, isSameDay, parseISO } from "date-fns";
import { Clock, Building2, Tag, CreditCard } from "lucide-react";

type Booking = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  topic: string | null;
  date: string;
  time: string;
  status: string;
  amount_paid: number | null;
  reference: string | null;
};

const STATUS_COLORS: Record<string, { light: string; dark: string }> = {
  confirmed: { light: "text-green-700 bg-green-50 border-green-200", dark: "text-green-400 bg-green-400/10 border-green-400/20" },
  pending:   { light: "text-yellow-700 bg-yellow-50 border-yellow-200", dark: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  cancelled: { light: "text-red-600 bg-red-50 border-red-200", dark: "text-red-400 bg-red-400/10 border-red-400/20" },
  completed: { light: "text-gray-500 bg-gray-100 border-gray-200", dark: "text-white/40 bg-white/5 border-white/10" },
};

export default function BookingsCalendarPage() {
  const { theme } = useTheme();
  const [mounted, setMounted]       = useState(false);
  const [bookings, setBookings]     = useState<Booking[]>([]);
  const [loading, setLoading]       = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    supabase
      .from("bookings")
      .select("*")
      .order("date", { ascending: true })
      .then(({ data }) => {
        setBookings(data ?? []);
        setLoading(false);
      });
  }, []);

  const isLight = mounted && theme === "light";

  const bookedDates = useMemo(() =>
    bookings.flatMap((b) => {
      try { return [parseISO(b.date)]; } catch { return []; }
    }),
    [bookings]
  );

  const dayBookings = useMemo(() => {
    const filtered = bookings.filter((b) => {
      try { return isSameDay(parseISO(b.date), selectedDate); } catch { return false; }
    });
    // Sort chronologically by time string (HH:MM or H:MM AM/PM)
    return filtered.sort((a, b) => {
      const toMinutes = (t: string) => {
        if (!t) return 0;
        const lower = t.toLowerCase();
        const isPm  = lower.includes("pm");
        const isAm  = lower.includes("am");
        const clean = t.replace(/[^\d:]/g, "");
        const [h, m = "0"] = clean.split(":");
        let hours = parseInt(h, 10);
        if (isPm && hours !== 12) hours += 12;
        if (isAm && hours === 12) hours = 0;
        return hours * 60 + parseInt(m, 10);
      };
      return toMinutes(a.time) - toMinutes(b.time);
    });
  }, [bookings, selectedDate]);

  const monthBookings = useMemo(() =>
    bookings.filter((b) => {
      try {
        const d = parseISO(b.date);
        return d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();
      } catch { return false; }
    }),
    [bookings, selectedDate]
  );

  // Theme tokens
  const card    = isLight ? "bg-white border border-black/[0.07] shadow-sm" : "bg-[#111113] border border-white/[0.06]";
  const heading = isLight ? "text-black" : "text-white";
  const subtext = isLight ? "text-black/40" : "text-white/40";
  const divider = isLight ? "border-black/[0.06]" : "border-white/[0.05]";

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h2 className={`text-2xl font-bold ${heading}`}>Calendar View</h2>
        <p className={`text-sm mt-1 ${subtext}`}>
          {bookings.length} total bookings · {monthBookings.length} in {format(selectedDate, "MMMM yyyy")}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(320px,480px)_1fr] gap-6 items-start">

        {/* Glass calendar panel */}
        <div className="rounded-3xl bg-gradient-to-br from-[#0B1F2A] via-[#0f2e38] to-[#0B2B35] p-5 shadow-2xl">
          {loading ? (
            <div className="h-72 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-[#3FE0D0] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <GlassCalendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              bookedDates={bookedDates}
              className="max-w-none"
            />
          )}
        </div>

        {/* Bookings for selected date */}
        <div className="space-y-4">
          {/* Day header */}
          <div className={`rounded-2xl p-5 flex items-center justify-between ${card}`}>
            <div>
              <h3 className={`text-base font-semibold ${heading}`}>
                {format(selectedDate, "EEEE, MMMM d")}
              </h3>
              <p className={`text-xs mt-0.5 ${subtext}`}>
                {dayBookings.length === 0
                  ? "No bookings on this day"
                  : `${dayBookings.length} booking${dayBookings.length > 1 ? "s" : ""} scheduled`}
              </p>
            </div>
            {dayBookings.length > 1 && (
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                isLight ? "bg-[#2F8F89]/10 text-[#2F8F89]" : "bg-[#3FE0D0]/10 text-[#3FE0D0]"
              }`}>
                {dayBookings.length} slots
              </span>
            )}
          </div>

          {dayBookings.length === 0 ? (
            <div className={`rounded-2xl p-10 text-center ${card}`}>
              <p className={`text-3xl mb-3`}>📭</p>
              <p className={`text-sm font-medium ${subtext}`}>No bookings on this date</p>
              <p className={`text-xs mt-1 ${subtext} opacity-60`}>Select another date or check the list view</p>
            </div>
          ) : (
            /* Timeline — each booking is a row with time on the left and detail card on the right */
            <div className="relative space-y-0">
              {/* Vertical timeline line */}
              {dayBookings.length > 1 && (
                <div className={`absolute left-[52px] top-6 bottom-6 w-px ${
                  isLight ? "bg-black/10" : "bg-white/10"
                }`} />
              )}

              {dayBookings.map((b, idx) => {
                const sc = STATUS_COLORS[b.status] ?? STATUS_COLORS.completed;
                const statusCls = isLight ? sc.light : sc.dark;
                const isLast = idx === dayBookings.length - 1;

                return (
                  <div key={b.id} className={`flex gap-4 ${isLast ? "" : "pb-3"}`}>
                    {/* Time column */}
                    <div className="flex flex-col items-center flex-shrink-0 w-[52px] pt-4">
                      <span className={`text-xs font-bold tabular-nums ${
                        isLight ? "text-black/60" : "text-white/60"
                      }`}>
                        {b.time || "—"}
                      </span>
                      {/* Dot on the timeline */}
                      <div className={`mt-2 w-2.5 h-2.5 rounded-full ring-2 flex-shrink-0 ${
                        isLight
                          ? "bg-[#2F8F89] ring-[#F4F4F5]"
                          : "bg-[#3FE0D0] ring-[#0B0B0C]"
                      }`} />
                    </div>

                    {/* Booking card */}
                    <div className={`flex-1 rounded-2xl p-4 ${card}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold truncate ${heading}`}>{b.name}</p>
                          <p className={`text-xs truncate ${subtext}`}>{b.email}</p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border capitalize flex-shrink-0 ${statusCls}`}>
                          {b.status}
                        </span>
                      </div>

                      <div className={`mt-3 pt-3 border-t grid grid-cols-2 gap-2 ${divider}`}>
                        {b.company && (
                          <div className="flex items-center gap-1.5">
                            <Building2 className={`w-3 h-3 flex-shrink-0 ${subtext}`} />
                            <span className={`text-xs truncate ${subtext}`}>{b.company}</span>
                          </div>
                        )}
                        {b.topic && (
                          <div className="flex items-center gap-1.5">
                            <Tag className={`w-3 h-3 flex-shrink-0 ${subtext}`} />
                            <span className={`text-xs truncate ${subtext}`}>{b.topic}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <CreditCard className={`w-3 h-3 flex-shrink-0 ${subtext}`} />
                          <span className={`text-xs ${subtext}`}>R{b.amount_paid ?? 0}</span>
                        </div>
                        {b.reference && (
                          <p className={`text-[10px] font-mono col-span-2 ${subtext} opacity-50`}>{b.reference}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
