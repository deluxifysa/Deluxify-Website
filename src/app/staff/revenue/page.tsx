"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase";
import { getThemeTokens, formatCurrency, formatDate } from "@/lib/crm-utils";
import { TrendingUp, DollarSign, ArrowUpRight, BarChart3 } from "lucide-react";

type PaidInvoice = {
  id: string;
  invoice_no: string;
  client_name: string;
  total: number;
  paid_date: string | null;
  issue_date: string;
  currency: string;
};

type MonthBar = { label: string; month: string; total: number };

export default function RevenuePage() {
  const { theme } = useTheme();
  const [mounted,  setMounted]  = useState(false);
  const [invoices, setInvoices] = useState<PaidInvoice[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => setMounted(true), []);
  useEffect(() => { load(); }, []);

  async function load() {
    const [{ data: inv }, { data: book }] = await Promise.all([
      supabase.from("invoices").select("id, invoice_no, client_name, total, paid_date, issue_date, currency").eq("status", "paid").order("paid_date", { ascending: false }),
      supabase.from("bookings").select("id, name, company, amount_paid, date, status").eq("status", "confirmed").order("date", { ascending: false }),
    ]);
    setInvoices(inv ?? []);
    setBookings(book ?? []);
    setLoading(false);
  }

  const isLight = mounted && theme === "light";
  const t = getThemeTokens(isLight);

  // Revenue calculations
  const invoiceRevenue  = invoices.reduce((s, i) => s + i.total, 0);
  const bookingRevenue  = bookings.reduce((s, b) => s + (b.amount_paid ?? 0) * 100, 0);
  const totalRevenue    = invoiceRevenue + bookingRevenue;

  const thisMonth = new Date().toISOString().slice(0, 7);
  const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);

  const thisMonthRev = invoices.filter((i) => (i.paid_date ?? i.issue_date).startsWith(thisMonth)).reduce((s, i) => s + i.total, 0)
    + bookings.filter((b) => b.date?.startsWith(thisMonth)).reduce((s: number, b: any) => s + (b.amount_paid ?? 0) * 100, 0);

  const lastMonthRev = invoices.filter((i) => (i.paid_date ?? i.issue_date).startsWith(lastMonth)).reduce((s, i) => s + i.total, 0)
    + bookings.filter((b) => b.date?.startsWith(lastMonth)).reduce((s: number, b: any) => s + (b.amount_paid ?? 0) * 100, 0);

  const growth = lastMonthRev > 0 ? ((thisMonthRev - lastMonthRev) / lastMonthRev) * 100 : 0;

  // Monthly bars (last 6 months from invoices)
  const monthMap = new Map<string, number>();
  invoices.forEach((i) => {
    const key = (i.paid_date ?? i.issue_date).slice(0, 7);
    monthMap.set(key, (monthMap.get(key) ?? 0) + i.total);
  });
  bookings.forEach((b: any) => {
    if (b.date) {
      const key = b.date.slice(0, 7);
      monthMap.set(key, (monthMap.get(key) ?? 0) + (b.amount_paid ?? 0) * 100);
    }
  });

  const bars: MonthBar[] = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, total]) => ({
      month,
      total,
      label: new Date(month + "-01").toLocaleDateString("en-ZA", { month: "short", year: "2-digit" }),
    }));

  const maxBar = Math.max(...bars.map((b) => b.total), 1);
  const BAR_HEIGHT = 120;

  // Combined records for table
  const records = [
    ...invoices.map((i) => ({ key: i.id, date: i.paid_date ?? i.issue_date, label: i.invoice_no, client: i.client_name, amount: i.total, type: "Invoice" })),
    ...bookings.map((b: any) => ({ key: b.id, date: b.date, label: `Booking`, client: b.name + (b.company ? ` · ${b.company}` : ""), amount: (b.amount_paid ?? 0) * 100, type: "Booking" })),
  ].sort((a, b) => b.date?.localeCompare(a.date ?? "") ?? 0).slice(0, 30);

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className={`text-2xl font-bold ${t.heading}`}>Revenue</h1>
        <p className={`text-sm mt-0.5 ${t.subtext}`}>Financial overview across invoices and bookings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className={`rounded-2xl p-5 ${t.card}`}>
          <TrendingUp className="w-5 h-5 text-[#2F8F89] mb-3" />
          <p className={`text-2xl font-bold ${t.heading}`}>{formatCurrency(totalRevenue)}</p>
          <p className={`text-xs mt-1 ${t.subtext}`}>Total Revenue</p>
        </div>
        <div className={`rounded-2xl p-5 ${t.card}`}>
          <DollarSign className="w-5 h-5 text-blue-500 mb-3" />
          <p className={`text-2xl font-bold ${t.heading}`}>{formatCurrency(thisMonthRev)}</p>
          <p className={`text-xs mt-1 ${t.subtext}`}>This Month</p>
          {growth !== 0 && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${growth >= 0 ? (isLight ? "text-green-700" : "text-green-400") : (isLight ? "text-red-600" : "text-red-400")}`}>
              <ArrowUpRight className={`w-3 h-3 ${growth < 0 ? "rotate-180" : ""}`} />
              {Math.abs(growth).toFixed(1)}% vs last month
            </div>
          )}
        </div>
        <div className={`rounded-2xl p-5 ${t.card}`}>
          <BarChart3 className="w-5 h-5 text-purple-500 mb-3" />
          <p className={`text-2xl font-bold ${t.heading}`}>{formatCurrency(invoiceRevenue)}</p>
          <p className={`text-xs mt-1 ${t.subtext}`}>Invoice Revenue</p>
        </div>
        <div className={`rounded-2xl p-5 ${t.card}`}>
          <DollarSign className="w-5 h-5 text-green-500 mb-3" />
          <p className={`text-2xl font-bold ${t.heading}`}>{formatCurrency(bookingRevenue)}</p>
          <p className={`text-xs mt-1 ${t.subtext}`}>Booking Revenue</p>
        </div>
      </div>

      {/* Bar chart */}
      {bars.length > 0 && (
        <div className={`rounded-2xl p-6 ${t.card}`}>
          <h3 className={`font-semibold mb-6 ${t.heading}`}>Monthly Revenue</h3>
          <div className="flex items-end gap-3" style={{ height: BAR_HEIGHT + 32 }}>
            {bars.map((b) => (
              <div key={b.month} className="flex-1 flex flex-col items-center gap-2">
                <div className="flex-1 flex items-end w-full">
                  <div
                    className="w-full rounded-t-lg transition-all duration-500"
                    style={{
                      height: `${Math.max(4, (b.total / maxBar) * BAR_HEIGHT)}px`,
                      background: `linear-gradient(to top, #2F8F89, #3FE0D0)`,
                      opacity: b.month === thisMonth ? 1 : 0.6,
                    }}
                  />
                </div>
                <span className={`text-[10px] font-medium ${t.subtext}`}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transactions table */}
      <div className={`rounded-2xl overflow-hidden ${t.card}`}>
        <div className={`px-6 py-4 border-b ${t.divider}`}>
          <h3 className={`font-semibold ${t.heading}`}>Recent Transactions</h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-32"><div className="w-6 h-6 border-2 border-[#2F8F89] border-t-transparent rounded-full animate-spin" /></div>
        ) : records.length === 0 ? (
          <div className={`p-12 text-center ${t.subtext} text-sm`}>No revenue data yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${t.tableBorder}`}>
                  {["Date", "Reference", "Client", "Type", "Amount"].map((h) => (
                    <th key={h} className={`text-left text-xs font-semibold uppercase tracking-wider px-4 py-3 first:pl-6 last:pr-6 ${t.th}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.key} className={`border-b last:border-0 transition-colors ${t.rowBorder} ${t.rowHover}`}>
                    <td className="px-4 py-3.5 pl-6"><p className={`text-xs ${t.bodyText}`}>{formatDate(r.date)}</p></td>
                    <td className="px-4 py-3.5"><p className={`text-sm font-mono font-medium ${t.heading}`}>{r.label}</p></td>
                    <td className="px-4 py-3.5"><p className={`text-sm ${t.bodyText}`}>{r.client}</p></td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        r.type === "Invoice"
                          ? isLight ? "text-purple-700 bg-purple-50 border border-purple-200" : "text-purple-400 bg-purple-400/10 border border-purple-400/20"
                          : isLight ? "text-blue-700 bg-blue-50 border border-blue-200" : "text-blue-400 bg-blue-400/10 border border-blue-400/20"
                      }`}>{r.type}</span>
                    </td>
                    <td className="px-4 py-3.5 pr-6">
                      <p className={`text-sm font-bold ${isLight ? "text-green-700" : "text-green-400"}`}>{formatCurrency(r.amount)}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
