"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase";
import { getThemeTokens, formatCurrency, formatDate } from "@/lib/crm-utils";
import {
  Calendar, FolderKanban, TrendingUp, Clock, ArrowRight,
  Users, DollarSign, FileText, AlertCircle, Activity,
  ArrowUpRight,
} from "lucide-react";

type ActivityItem = {
  key: string;
  type: "booking" | "client" | "invoice";
  label: string;
  sub: string;
  date: string;
  badge: string;
  badgeClass: string;
};

export default function DashboardPage() {
  const { theme } = useTheme();
  const [mounted,      setMounted]      = useState(false);
  const [loading,      setLoading]      = useState(true);

  // Metrics
  const [totalClients,    setTotalClients]    = useState(0);
  const [pipelineValue,   setPipelineValue]   = useState(0);
  const [thisMonthRev,    setThisMonthRev]    = useState(0);
  const [lastMonthRev,    setLastMonthRev]    = useState(0);
  const [activeProjects,  setActiveProjects]  = useState(0);
  const [pendingInvoices, setPendingInvoices] = useState(0);
  const [pendingInvAmt,   setPendingInvAmt]   = useState(0);
  const [todayBookings,   setTodayBookings]   = useState(0);
  const [totalBookings,   setTotalBookings]   = useState(0);

  // Activity feed
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  useEffect(() => setMounted(true), []);
  useEffect(() => { load(); }, []);

  async function load() {
    const today     = new Date().toISOString().slice(0, 10);
    const thisMonth = new Date().toISOString().slice(0, 7);
    const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);

    const [
      { data: clients },
      { data: projects },
      { data: invoices },
      { data: bookings },
    ] = await Promise.all([
      supabase.from("clients").select("id, full_name, company, pipeline_stage, expected_value, created_at"),
      supabase.from("projects").select("id, title, status, created_at"),
      supabase.from("invoices").select("id, invoice_no, client_name, status, total, issue_date, paid_date"),
      supabase.from("bookings").select("id, name, company, status, date, amount_paid, created_at"),
    ]);

    // Clients
    setTotalClients(clients?.length ?? 0);
    setPipelineValue(
      (clients ?? []).filter((c) => c.pipeline_stage !== "churned")
        .reduce((s: number, c: any) => s + (c.expected_value ?? 0), 0)
    );

    // Projects
    setActiveProjects((projects ?? []).filter((p) => p.status === "in-progress").length);

    // Invoices
    const pendingInvs = (invoices ?? []).filter((i) => i.status === "sent" || i.status === "overdue");
    setPendingInvoices(pendingInvs.length);
    setPendingInvAmt(pendingInvs.reduce((s, i) => s + i.total, 0));

    // Revenue
    const paidInvThisMonth  = (invoices ?? []).filter((i) => i.status === "paid" && (i.paid_date ?? i.issue_date).startsWith(thisMonth)).reduce((s, i) => s + i.total, 0);
    const paidInvLastMonth  = (invoices ?? []).filter((i) => i.status === "paid" && (i.paid_date ?? i.issue_date).startsWith(lastMonth)).reduce((s, i) => s + i.total, 0);
    const bookRevThisMonth  = (bookings ?? []).filter((b) => b.status === "confirmed" && b.date?.startsWith(thisMonth)).reduce((s: number, b: any) => s + (b.amount_paid ?? 0) * 100, 0);
    const bookRevLastMonth  = (bookings ?? []).filter((b) => b.status === "confirmed" && b.date?.startsWith(lastMonth)).reduce((s: number, b: any) => s + (b.amount_paid ?? 0) * 100, 0);
    setThisMonthRev(paidInvThisMonth + bookRevThisMonth);
    setLastMonthRev(paidInvLastMonth + bookRevLastMonth);

    // Bookings
    setTodayBookings((bookings ?? []).filter((b) => b.date === today).length);
    setTotalBookings(bookings?.length ?? 0);

    // Activity feed — combine recent items
    const feed: ActivityItem[] = [];

    (bookings ?? []).slice(0, 6).forEach((b: any) => {
      const statusClass = b.status === "confirmed"
        ? "text-green-400 bg-green-400/10 border border-green-400/20"
        : b.status === "pending"
          ? "text-yellow-400 bg-yellow-400/10 border border-yellow-400/20"
          : "text-white/30 bg-white/[0.04] border border-white/[0.08]";
      feed.push({ key: `b-${b.id}`, type: "booking", label: b.name, sub: b.company ? `Booking · ${b.company}` : "Booking", date: b.date ?? b.created_at, badge: b.status, badgeClass: statusClass });
    });

    (clients ?? []).slice(0, 4).forEach((c: any) => {
      feed.push({ key: `c-${c.id}`, type: "client", label: c.full_name, sub: c.company ? `Client · ${c.company}` : "Client", date: c.created_at, badge: c.pipeline_stage, badgeClass: "text-purple-400 bg-purple-400/10 border border-purple-400/20" });
    });

    (invoices ?? []).slice(0, 4).forEach((i: any) => {
      const cls = i.status === "paid"
        ? "text-green-400 bg-green-400/10 border border-green-400/20"
        : i.status === "overdue"
          ? "text-red-400 bg-red-400/10 border border-red-400/20"
          : "text-blue-400 bg-blue-400/10 border border-blue-400/20";
      feed.push({ key: `i-${i.id}`, type: "invoice", label: i.invoice_no, sub: `Invoice · ${i.client_name}`, date: i.issue_date, badge: i.status, badgeClass: cls });
    });

    feed.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
    setActivity(feed.slice(0, 10));

    setLoading(false);
  }

  const isLight = mounted && theme === "light";
  const t = getThemeTokens(isLight);

  const growth = lastMonthRev > 0 ? ((thisMonthRev - lastMonthRev) / lastMonthRev) * 100 : 0;

  const stats = [
    { label: "Total Clients",     value: totalClients,             icon: Users,       color: isLight ? "text-purple-600" : "text-purple-400" },
    { label: "This Month Revenue",value: formatCurrency(thisMonthRev), icon: DollarSign,  color: isLight ? "text-green-600" : "text-green-400", growth: lastMonthRev > 0 ? growth : null },
    { label: "Active Projects",   value: activeProjects,           icon: FolderKanban,color: isLight ? "text-[#2F8F89]" : "text-[#3FE0D0]" },
    { label: "Today's Bookings",  value: todayBookings,            icon: Clock,       color: isLight ? "text-blue-600" : "text-blue-400" },
    { label: "Total Bookings",    value: totalBookings,            icon: Calendar,    color: isLight ? "text-black/50" : "text-white/40" },
    { label: "Pipeline Value",    value: formatCurrency(pipelineValue), icon: TrendingUp,  color: isLight ? "text-[#2F8F89]" : "text-[#3FE0D0]" },
    { label: "Pending Invoices",  value: pendingInvoices,          icon: FileText,    color: isLight ? "text-yellow-600" : "text-yellow-400" },
    { label: "Outstanding",       value: formatCurrency(pendingInvAmt), icon: AlertCircle, color: isLight ? "text-red-500" : "text-red-400" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#2F8F89] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h1 className={`text-2xl font-bold ${t.heading}`}>Dashboard</h1>
        <p className={`text-sm mt-0.5 ${t.subtext}`}>Welcome back — here's your operations overview.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-2xl p-5 ${t.card}`}>
            <s.icon className={`w-5 h-5 ${s.color} mb-3`} />
            <p className={`text-2xl font-bold ${t.heading}`}>{s.value}</p>
            <p className={`text-xs mt-1 ${t.subtext}`}>{s.label}</p>
            {"growth" in s && s.growth !== null && s.growth !== undefined && (
              <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${s.growth >= 0 ? (isLight ? "text-green-700" : "text-green-400") : (isLight ? "text-red-600" : "text-red-400")}`}>
                <ArrowUpRight className={`w-3 h-3 ${s.growth < 0 ? "rotate-180" : ""}`} />
                {Math.abs(s.growth).toFixed(1)}% vs last month
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className={`md:col-span-2 rounded-2xl ${t.card}`}>
          <div className={`flex items-center justify-between px-6 py-4 border-b ${t.divider}`}>
            <div className="flex items-center gap-2">
              <Activity className={`w-4 h-4 ${isLight ? "text-[#2F8F89]" : "text-[#3FE0D0]"}`} />
              <h3 className={`font-semibold text-sm ${t.heading}`}>Recent Activity</h3>
            </div>
          </div>
          {activity.length === 0 ? (
            <p className={`px-6 py-10 text-sm text-center ${t.subtext}`}>No activity yet. Start by adding clients, bookings, or invoices.</p>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {activity.map((item) => (
                <div key={item.key} className={`flex items-center justify-between px-6 py-3.5 transition-colors ${t.rowHover}`}>
                  <div className="min-w-0">
                    <p className={`text-sm font-medium truncate ${t.heading}`}>{item.label}</p>
                    <p className={`text-xs ${t.muted}`}>{item.sub}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    <p className={`text-xs ${t.muted} hidden sm:block`}>{formatDate(item.date)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${item.badgeClass}`}>{item.badge}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          {[
            { href: "/staff/crm",      label: "Clients & CRM",    sub: `${totalClients} clients`,           icon: Users,        color: "text-purple-400" },
            { href: "/staff/invoices", label: "Invoices",         sub: `${pendingInvoices} pending`,         icon: FileText,     color: "text-blue-400" },
            { href: "/staff/revenue",  label: "Revenue",          sub: formatCurrency(thisMonthRev) + " this month", icon: DollarSign, color: "text-green-400" },
            { href: "/staff/pipeline", label: "Pipeline",         sub: formatCurrency(pipelineValue) + " value",   icon: TrendingUp,  color: isLight ? "text-[#2F8F89]" : "text-[#3FE0D0]" },
            { href: "/staff/projects", label: "Projects",         sub: `${activeProjects} active`,           icon: FolderKanban, color: isLight ? "text-[#2F8F89]" : "text-[#3FE0D0]" },
            { href: "/staff/bookings", label: "Bookings",         sub: `${totalBookings} total`,             icon: Calendar,     color: "text-sky-400" },
          ].map((link) => (
            <Link key={link.href} href={link.href} className={`flex items-center justify-between p-4 rounded-2xl transition-all group ${t.card} ${t.cardHover}`}>
              <div className="flex items-center gap-3">
                <link.icon className={`w-4 h-4 ${link.color}`} />
                <div>
                  <p className={`text-sm font-medium ${t.heading}`}>{link.label}</p>
                  <p className={`text-xs ${t.muted}`}>{link.sub}</p>
                </div>
              </div>
              <ArrowRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${t.subtext}`} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
