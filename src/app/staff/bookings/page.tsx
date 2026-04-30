"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase";
import { Search } from "lucide-react";

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
  created_at: string;
};

const STATUS_OPTIONS = ["all", "confirmed", "pending", "cancelled", "completed"];

export default function BookingsPage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .order("date", { ascending: false });
    setBookings(data ?? []);
    setLoading(false);
  }

  async function updateStatus(id: string, newStatus: string) {
    setUpdating(id);
    await supabase.from("bookings").update({ status: newStatus }).eq("id", id);
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
    setUpdating(null);
  }

  const isLight = mounted && theme === "light";

  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      [b.name, b.email, b.company, b.topic, b.reference].some((v) =>
        v?.toLowerCase().includes(q)
      );
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Theme tokens
  const heading = isLight ? "text-black" : "text-white";
  const subtext = isLight ? "text-black/40" : "text-white/40";
  const card = isLight
    ? "bg-white border border-black/[0.07] shadow-sm"
    : "bg-[#111113] border border-white/[0.06]";
  const inputCls = isLight
    ? "bg-black/[0.04] border border-black/10 text-black placeholder:text-black/30 focus:ring-[#2F8F89]"
    : "bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:ring-[#2F8F89]";
  const filterActive = isLight
    ? "bg-[#2F8F89]/10 text-[#2F8F89] border border-[#2F8F89]/25"
    : "bg-[#2F8F89]/15 text-[#3FE0D0] border border-[#2F8F89]/30";
  const filterIdle = isLight
    ? "bg-black/[0.03] text-black/40 border border-black/[0.08] hover:text-black"
    : "bg-white/5 text-white/40 border border-white/10 hover:text-white";
  const thCls = isLight ? "text-black/30" : "text-white/25";
  const rowHover = isLight ? "hover:bg-black/[0.015]" : "hover:bg-white/[0.02]";
  const rowBorder = isLight ? "border-black/[0.05]" : "border-white/[0.04]";
  const cellText = isLight ? "text-black/60" : "text-white/60";
  const nameText = isLight ? "text-black" : "text-white";
  const emailText = isLight ? "text-black/40" : "text-white/35";
  const selectCls = isLight
    ? "bg-black/[0.03] border border-black/10 text-black/50 focus:ring-[#2F8F89]"
    : "bg-white/5 border border-white/10 text-white/50 focus:ring-[#2F8F89]";

  const statusColor: Record<string, string> = isLight
    ? {
        confirmed: "text-green-700 bg-green-50 border border-green-200",
        pending: "text-yellow-700 bg-yellow-50 border border-yellow-200",
        cancelled: "text-red-600 bg-red-50 border border-red-200",
        completed: "text-gray-500 bg-gray-100 border border-gray-200",
      }
    : {
        confirmed: "text-green-400 bg-green-400/10 border border-green-400/20",
        pending: "text-yellow-400 bg-yellow-400/10 border border-yellow-400/20",
        cancelled: "text-red-400 bg-red-400/10 border border-red-400/20",
        completed: "text-white/40 bg-white/5 border border-white/10",
      };

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h2 className={`text-2xl font-bold ${heading}`}>Bookings</h2>
        <p className={`text-sm mt-1 ${subtext}`}>{bookings.length} total bookings</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isLight ? "text-black/25" : "text-white/25"}`} />
          <input
            type="text"
            placeholder="Search by name, email, company…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${inputCls}`}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all ${
                statusFilter === s ? filterActive : filterIdle
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-[#2F8F89] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className={`text-center py-16 ${subtext}`}>No bookings found.</div>
      ) : (
        <div className={`rounded-2xl overflow-hidden ${card}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isLight ? "border-black/[0.06]" : "border-white/[0.06]"}`}>
                  {["Client", "Date & Time", "Topic", "Company", "Paid", "Status", "Update"].map((h) => (
                    <th
                      key={h}
                      className={`text-left text-xs font-semibold uppercase tracking-wider px-4 py-3 first:pl-6 last:pr-6 ${thCls}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr
                    key={b.id}
                    className={`border-b last:border-0 transition-colors ${rowBorder} ${rowHover}`}
                  >
                    <td className="px-4 py-4 pl-6">
                      <p className={`text-sm font-medium ${nameText}`}>{b.name}</p>
                      <p className={`text-xs ${emailText}`}>{b.email}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className={`text-sm ${cellText}`}>{b.date}</p>
                      <p className={`text-xs ${emailText}`}>{b.time}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className={`text-sm ${cellText}`}>{b.topic ?? "—"}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className={`text-sm ${cellText}`}>{b.company ?? "—"}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className={`text-sm ${cellText}`}>R{b.amount_paid ?? 0}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          statusColor[b.status] ?? (isLight ? "text-gray-500 bg-gray-100 border border-gray-200" : "text-white/40 bg-white/5 border border-white/10")
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 pr-6">
                      <select
                        value={b.status}
                        onChange={(e) => updateStatus(b.id, e.target.value)}
                        disabled={updating === b.id}
                        className={`text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 disabled:opacity-40 cursor-pointer transition-all ${selectCls}`}
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="pending">Pending</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
