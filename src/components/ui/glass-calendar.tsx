"use client";

import * as React from "react";
import { Settings, ChevronLeft, ChevronRight } from "lucide-react";
import {
  format, addMonths, subMonths, isSameDay, isToday,
  getDaysInMonth, startOfMonth,
} from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCalendarProps extends React.HTMLAttributes<HTMLDivElement> {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  bookedDates?: Date[];
  className?: string;
}

const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export const GlassCalendar = React.forwardRef<HTMLDivElement, GlassCalendarProps>(
  ({ className, selectedDate: propSelectedDate, onDateSelect, bookedDates = [], ...props }, ref) => {
    const [currentMonth, setCurrentMonth] = React.useState(propSelectedDate || new Date());
    const [selectedDate, setSelectedDate] = React.useState(propSelectedDate || new Date());
    const [direction, setDirection] = React.useState(0);

    React.useEffect(() => {
      if (propSelectedDate) {
        setSelectedDate(propSelectedDate);
        setCurrentMonth(propSelectedDate);
      }
    }, [propSelectedDate]);

    const { cells, totalDays } = React.useMemo(() => {
      const firstDay = startOfMonth(currentMonth).getDay(); // 0 = Sunday
      const total    = getDaysInMonth(currentMonth);
      const year     = currentMonth.getFullYear();
      const month    = currentMonth.getMonth();

      // Leading empty cells + day cells
      const cells: (Date | null)[] = [
        ...Array(firstDay).fill(null),
        ...Array.from({ length: total }, (_, i) => new Date(year, month, i + 1)),
      ];
      return { cells, totalDays: total };
    }, [currentMonth]);

    const handleDateClick = (date: Date) => {
      setSelectedDate(date);
      onDateSelect?.(date);
    };

    const goToPrev = () => {
      setDirection(-1);
      setCurrentMonth(subMonths(currentMonth, 1));
    };

    const goToNext = () => {
      setDirection(1);
      setCurrentMonth(addMonths(currentMonth, 1));
    };

    return (
      <div
        ref={ref}
        className={cn(
          "w-full rounded-3xl p-5 shadow-2xl",
          "bg-black/20 backdrop-blur-xl border border-white/10",
          "text-white font-sans",
          className
        )}
        {...props}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-1 rounded-lg bg-black/20 p-1">
            <span className="rounded-md bg-white px-4 py-1 text-xs font-bold text-black shadow-md select-none">
              Monthly
            </span>
          </div>
          <button className="p-2 text-white/60 transition-colors hover:bg-black/20 rounded-full">
            <Settings className="h-4 w-4" />
          </button>
        </div>

        {/* Month title + nav */}
        <div className="flex items-center justify-between mb-5">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={format(currentMonth, "MMMM-yyyy")}
              initial={{ opacity: 0, x: direction * 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -20 }}
              transition={{ duration: 0.2 }}
              className="text-2xl font-bold tracking-tight"
            >
              {format(currentMonth, "MMMM")}
              <span className="text-lg text-white/45 ml-2">{format(currentMonth, "yyyy")}</span>
            </motion.p>
          </AnimatePresence>
          <div className="flex items-center space-x-1">
            <button onClick={goToPrev}
              className="p-1.5 rounded-full text-white/60 transition-colors hover:bg-black/25 hover:text-white">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={goToNext}
              className="p-1.5 rounded-full text-white/60 transition-colors hover:bg-black/25 hover:text-white">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 mb-1">
          {DOW.map((d) => (
            <div key={d} className="text-center text-[10px] font-bold text-white/40 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={format(currentMonth, "MMMM-yyyy")}
            initial={{ opacity: 0, x: direction * 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -30 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-7 gap-y-1"
          >
            {cells.map((date, idx) => {
              if (!date) return <div key={`empty-${idx}`} />;

              const isSelected  = isSameDay(date, selectedDate);
              const isTodayDate = isToday(date);
              const hasBooking  = bookedDates.some((bd) => isSameDay(bd, date));

              return (
                <div key={date.toISOString()} className="flex flex-col items-center gap-0.5">
                  <button
                    onClick={() => handleDateClick(date)}
                    className={cn(
                      "w-8 h-8 rounded-full text-xs font-semibold transition-all duration-150 relative flex items-center justify-center",
                      isSelected
                        ? "bg-gradient-to-br from-[#2F8F89] to-[#3FE0D0] text-white shadow-lg shadow-[#2F8F89]/30"
                        : isTodayDate
                        ? "bg-white/15 text-white ring-1 ring-white/30"
                        : "text-white/75 hover:bg-white/15 hover:text-white"
                    )}
                  >
                    {date.getDate()}
                  </button>
                  {/* Booking dot */}
                  <span className={cn(
                    "h-1 w-1 rounded-full transition-all",
                    hasBooking
                      ? isSelected ? "bg-white/70" : "bg-[#3FE0D0]"
                      : "invisible"
                  )} />
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-white/40">
            {totalDays} days · {bookedDates.filter((bd) =>
              bd.getMonth() === currentMonth.getMonth() &&
              bd.getFullYear() === currentMonth.getFullYear()
            ).length} bookings
          </span>
          <button className="flex items-center gap-1.5 rounded-lg bg-black/20 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-black/35">
            + New Booking
          </button>
        </div>
      </div>
    );
  }
);

GlassCalendar.displayName = "GlassCalendar";
