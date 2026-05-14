"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase";
import { getThemeTokens, formatCurrency, formatDate } from "@/lib/crm-utils";
import {
  Calendar, FolderKanban, TrendingUp, Clock, ArrowRight,
  Users, DollarSign, FileText, AlertCircle, Activity,
  ArrowUpRight, ArrowDownRight, BarChart3,
} from "lucide-react";

type ActivityItem = {
  key: string;
  type: "booking" | "client" | "invoice";
  label: string;
  sub: string;
  date: string;
  badge: string;
  badgeColor: string;
};

type MonthBar = { month: string; label: string; value: number };

export default function DashboardPage() {
  const { theme } = useTheme();
  const [mounted, setMounted]               = useState(false);
  const [loading, setLoading]               = useState(true);

  const [totalClients,    setTotalClients]    = useState(0);
  const [pipelineValue,   setPipelineValue]   = useState(0);
  const [thisMonthRev,    setThisMonthRev]    = useState(0);
  const [lastMonthRev,    setLastMonthRev]    = useState(0);
  const [activeProjects,  setActiveProjects]  = useState(0);
  const [pendingInvoices, setPendingInvoices] = useState(0);
  const [pendingInvAmt,   setPendingInvAmt]   = useState(0);
  const [overdueCount,    setOverdueCount]    = useState(0);
  const [overdueInvAmt,   setOverdueInvAmt]   = useState(0);
  const [todayBookings,   setTodayBookings]   = useState(0);
  const [totalBookings,   setTotalBookings]   = useState(0);
  const [monthlyRevenue,  setMonthlyRevenue]  = useState<MonthBar[]>([]);
  const [activity,        setActivity]        = useState<ActivityItem[]>([]);

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
      supabase.from("invoices").select("id, invoice_no, client_name, status, total, issue_date, paid_date, due_date"),
      supabase.from("bookings").select("id, name, company, status, date, amount_paid, created_at"),
    ]);

    // Clients
    setTotalClients(clients?.length ?? 0);
    setPipelineValue(
      (clients ?? []).filter(c => c.pipeline_stage !== "churned")
        .reduce((s: number, c: any) => s + (c.expected_value ?? 0), 0)
    );

    // Projects
    setActiveProjects((projects ?? []).filter(p => p.status === "in-progress").length);

    // Invoices
    const pending = (invoices ?? []).filter(i => i.status === "sent");
    const overdue = (invoices ?? []).filter(i => i.status === "overdue");
    setPendingInvoices(pending.length);
    setPendingInvAmt(pending.reduce((s, i) => s + i.total, 0));
    setOverdueCount(overdue.length);
    setOverdueInvAmt(overdue.reduce((s, i) => s + i.total, 0));

    // Revenue
    const paidThis = (invoices ?? []).filter(i => i.status === "paid" && (i.paid_date ?? i.issue_date).startsWith(thisMonth)).reduce((s, i) => s + i.total, 0);
    const paidLast = (invoices ?? []).filter(i => i.status === "paid" && (i.paid_date ?? i.issue_date).startsWith(lastMonth)).reduce((s, i) => s + i.total, 0);
    const bkThis   = (bookings ?? []).filter(b => b.status === "confirmed" && b.date?.startsWith(thisMonth)).reduce((s: number, b: any) => s + (b.amount_paid ?? 0) * 100, 0);
    const bkLast   = (bookings ?? []).filter(b => b.status === "confirmed" && b.date?.startsWith(lastMonth)).reduce((s: number, b: any) => s + (b.amount_paid ?? 0) * 100, 0);
    setThisMonthRev(paidThis + bkThis);
    setLastMonthRev(paidLast + bkLast);

    // Bookings
    setTodayBookings((bookings ?? []).filter(b => b.date === today).length);
    setTotalBookings(bookings?.length ?? 0);

    // Monthly revenue — last 6 months
    const months: MonthBar[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const key   = d.toISOString().slice(0, 7);
      const label = d.toLocaleDateString("en-ZA", { month: "short" });
      const invRev = (invoices ?? []).filter(inv => inv.status === "paid" && (inv.paid_date ?? inv.issue_date).startsWith(key)).reduce((s, inv) => s + inv.total, 0);
      const bkRev  = (bookings  ?? []).filter(b => b.status === "confirmed" && b.date?.startsWith(key)).reduce((s: number, b: any) => s + (b.amount_paid ?? 0) * 100, 0);
      months.push({ month: key, label, value: invRev + bkRev });
    }
    setMonthlyRevenue(months);

    // Activity feed
    const feed: ActivityItem[] = [];
    (bookings ?? []).slice(0, 5).forEach((b: any) => {
      feed.push({ key: `b-${b.id}`, type: "booking", label: b.name, sub: b.company ?? "Booking", date: b.date ?? b.created_at, badge: b.status, badgeColor: b.status === "confirmed" ? "green" : b.status === "pending" ? "yellow" : "gray" });
    });
    (clients ?? []).slice(0, 4).forEach((c: any) => {
      feed.push({ key: `c-${c.id}`, type: "client", label: c.full_name, sub: c.company ?? "New client", date: c.created_at, badge: c.pipeline_stage ?? "lead", badgeColor: "purple" });
    });
    (invoices ?? []).slice(0, 5).forEach((i: any) => {
      feed.push({ key: `i-${i.id}`, type: "invoice", label: i.invoice_no, sub: i.client_name, date: i.issue_date, badge: i.status, badgeColor: i.status === "paid" ? "green" : i.status === "overdue" ? "red" : "blue" });
    });
    feed.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
    setActivity(feed.slice(0, 12));

    setLoading(false);
  }

  const isLight = mounted && theme === "light";
  const t       = getThemeTokens(isLight);
  const growth  = lastMonthRev > 0 ? ((thisMonthRev - lastMonthRev) / lastMonthRev) * 100 : null;
  const maxBar  = Math.max(...monthlyRevenue.map(m => m.value), 1);

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const todayStr = new Date().toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const badge: Record<string, string> = {
    green:  isLight ? "bg-green-50  text-green-700  border-green-200"  : "bg-green-400/10  text-green-400  border-green-400/20",
    red:    isLight ? "bg-red-50    text-red-700    border-red-200"    : "bg-red-400/10    text-red-400    border-red-400/20",
    yellow: isLight ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
    blue:   isLight ? "bg-blue-50   text-blue-700   border-blue-200"   : "bg-blue-400/10   text-blue-400   border-blue-400/20",
    purple: isLight ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-purple-400/10 text-purple-400 border-purple-400/20",
    gray:   isLight ? "bg-black/5   text-black/50   border-black/10"   : "bg-white/5       text-white/40   border-white/10",
  };

  const typeIcon = { booking: Calendar, client: Users, invoice: FileText };
  const typeColor = {
    booking: isLight ? "bg-sky-50 text-sky-600"     : "bg-sky-400/10 text-sky-400",
    client:  isLight ? "bg-purple-50 text-purple-600" : "bg-purple-400/10 text-purple-400",
    invoice: isLight ? "bg-blue-50 text-blue-600"   : "bg-blue-400/10 text-blue-400",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#2F8F89] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl">

      {/* ── Greeting ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className={`text-xs font-medium uppercase tracking-widest mb-1 ${t.muted}`}>{todayStr}</p>
          <h1 className={`text-2xl font-bold tracking-tight ${t.heading}`}>{greeting} 👋</h1>
          <p className={`text-sm mt-1 ${t.subtext}`}>
            {overdueCount > 0
              ? `${overdueCount} overdue invoice${overdueCount !== 1 ? "s" : ""} need${overdueCount === 1 ? "s" : ""} attention.`
              : "Everything looks on track. Here's your business overview."}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href="/staff/invoices" className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            isLight ? "bg-black text-white hover:bg-black/80" : "bg-white text-black hover:bg-white/90"
          }`}>
            <FileText className="w-3.5 h-3.5" />
            New Invoice
          </Link>
          <Link href="/staff/crm" className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
            isLight ? "border-black/15 text-black/70 hover:bg-black/[0.04]" : "border-white/10 text-white/70 hover:bg-white/[0.05]"
          }`}>
            <Users className="w-3.5 h-3.5" />
            New Client
          </Link>
        </div>
      </div>

      {/* ── Overdue alert ── */}
      {overdueCount > 0 && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm ${
          isLight ? "bg-red-50 border-red-200 text-red-800" : "bg-red-400/[0.07] border-red-400/20 text-red-400"
        }`}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="font-semibold">{overdueCount} overdue invoice{overdueCount !== 1 ? "s" : ""}</span>
          <span className={isLight ? "text-red-700/70" : "text-red-400/60"}>
            totalling {formatCurrency(overdueInvAmt)} — follow up to recover payments.
          </span>
          <Link href="/staff/invoices" className="ml-auto flex-shrink-0 text-xs font-semibold underline underline-offset-2 whitespace-nowrap">
            View invoices →
          </Link>
        </div>
      )}

      {/* ── Primary KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Revenue */}
        <div className={`rounded-2xl p-5 ${t.card}`}>
          <div className="flex items-center justify-between mb-4">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${t.muted}`}>Revenue</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isLight ? "bg-green-50" : "bg-green-400/10"}`}>
              <DollarSign className={`w-4 h-4 ${isLight ? "text-green-600" : "text-green-400"}`} />
            </div>
          </div>
          <p className={`text-2xl font-bold tracking-tight ${t.heading}`}>{formatCurrency(thisMonthRev)}</p>
          <p className={`text-xs mt-1 ${t.muted}`}>This month</p>
          {growth !== null ? (
            <div className={`flex items-center gap-1 mt-2.5 text-xs font-semibold ${growth >= 0 ? (isLight ? "text-green-700" : "text-green-400") : (isLight ? "text-red-600" : "text-red-400")}`}>
              {growth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(growth).toFixed(1)}% vs last month
            </div>
          ) : (
            <p className={`text-xs mt-2.5 ${t.muted}`}>First month of data</p>
          )}
        </div>

        {/* Pipeline */}
        <div className={`rounded-2xl p-5 ${t.card}`}>
          <div className="flex items-center justify-between mb-4">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${t.muted}`}>Pipeline</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isLight ? "bg-[#2F8F89]/10" : "bg-[#3FE0D0]/10"}`}>
              <TrendingUp className={`w-4 h-4 ${isLight ? "text-[#2F8F89]" : "text-[#3FE0D0]"}`} />
            </div>
          </div>
          <p className={`text-2xl font-bold tracking-tight ${t.heading}`}>{formatCurrency(pipelineValue)}</p>
          <p className={`text-xs mt-1 ${t.muted}`}>Active value</p>
          <p className={`text-xs mt-2.5 font-semibold ${isLight ? "text-[#2F8F89]" : "text-[#3FE0D0]"}`}>
            {totalClients} client{totalClients !== 1 ? "s" : ""} tracked
          </p>
        </div>

        {/* Active Projects */}
        <div className={`rounded-2xl p-5 ${t.card}`}>
          <div className="flex items-center justify-between mb-4">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${t.muted}`}>Projects</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isLight ? "bg-blue-50" : "bg-blue-400/10"}`}>
              <FolderKanban className={`w-4 h-4 ${isLight ? "text-blue-600" : "text-blue-400"}`} />
            </div>
          </div>
          <p className={`text-2xl font-bold tracking-tight ${t.heading}`}>{activeProjects}</p>
          <p className={`text-xs mt-1 ${t.muted}`}>In progress</p>
          <p className={`text-xs mt-2.5 ${t.muted}`}>
            {todayBookings > 0 ? `${todayBookings} booking${todayBookings !== 1 ? "s" : ""} today` : "No bookings today"}
          </p>
        </div>

        {/* Outstanding */}
        <div className={`rounded-2xl p-5 ${t.card} ${overdueCount > 0 ? (isLight ? "border border-red-200" : "border border-red-400/25") : ""}`}>
          <div className="flex items-center justify-between mb-4">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${t.muted}`}>Outstanding</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${overdueCount > 0 ? (isLight ? "bg-red-50" : "bg-red-400/10") : (isLight ? "bg-yellow-50" : "bg-yellow-400/10")}`}>
              <AlertCircle className={`w-4 h-4 ${overdueCount > 0 ? (isLight ? "text-red-600" : "text-red-400") : (isLight ? "text-yellow-600" : "text-yellow-400")}`} />
            </div>
          </div>
          <p className={`text-2xl font-bold tracking-tight ${overdueCount > 0 ? (isLight ? "text-red-600" : "text-red-400") : t.heading}`}>
            {formatCurrency(pendingInvAmt + overdueInvAmt)}
          </p>
          <p className={`text-xs mt-1 ${t.muted}`}>Unpaid invoices</p>
          <p className={`text-xs mt-2.5 font-semibold ${overdueCount > 0 ? (isLight ? "text-red-600" : "text-red-400") : t.muted}`}>
            {overdueCount > 0 ? `${overdueCount} overdue` : pendingInvoices > 0 ? `${pendingInvoices} awaiting payment` : "All invoices paid"}
          </p>
        </div>
      </div>

      {/* ── Revenue trend + Secondary stats ── */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* 6-month bar chart */}
        <div className={`lg:col-span-2 rounded-2xl p-6 ${t.card}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-sm font-semibold ${t.heading}`}>Revenue Trend</h3>
              <p className={`text-xs mt-0.5 ${t.muted}`}>Last 6 months — invoices + bookings</p>
            </div>
            <BarChart3 className={`w-4 h-4 ${isLight ? "text-[#2F8F89]" : "text-[#3FE0D0]"}`} />
          </div>
          <div className="flex items-end gap-2.5 h-28 mb-2">
            {monthlyRevenue.map((m, i) => {
              const pct  = Math.max((m.value / maxBar) * 100, m.value > 0 ? 8 : 3);
              const curr = i === monthlyRevenue.length - 1;
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                  {/* Hover tooltip */}
                  <div className={`absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 ${
                    isLight ? "bg-black text-white" : "bg-white text-black"
                  }`}>
                    {formatCurrency(m.value)}
                  </div>
                  <div
                    className="w-full rounded-t-lg transition-all duration-700"
                    style={{
                      height: `${pct}%`,
                      background: curr
                        ? "linear-gradient(to top, #2F8F89, #3FE0D0)"
                        : isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)",
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex gap-2.5">
            {monthlyRevenue.map((m, i) => (
              <div key={m.month} className="flex-1 text-center">
                <span className={`text-[10px] font-medium ${
                  i === monthlyRevenue.length - 1
                    ? isLight ? "text-[#2F8F89]" : "text-[#3FE0D0]"
                    : t.muted
                }`}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Secondary stat cards */}
        <div className="flex flex-col gap-2.5">
          {([
            { label: "Total Clients",    value: totalClients,    icon: Users,        color: isLight ? "bg-purple-50 text-purple-600" : "bg-purple-400/10 text-purple-400", href: "/staff/crm" },
            { label: "Total Bookings",   value: totalBookings,   icon: Calendar,     color: isLight ? "bg-sky-50 text-sky-600"       : "bg-sky-400/10 text-sky-400",       href: "/staff/bookings" },
            { label: "Today's Bookings", value: todayBookings,   icon: Clock,        color: isLight ? "bg-orange-50 text-orange-600" : "bg-orange-400/10 text-orange-400", href: "/staff/bookings" },
            { label: "Pending Invoices", value: pendingInvoices, icon: FileText,     color: isLight ? "bg-blue-50 text-blue-600"     : "bg-blue-400/10 text-blue-400",     href: "/staff/invoices" },
          ] as const).map(s => {
            const [bg, ic] = s.color.split(" ");
            return (
              <Link key={s.label} href={s.href} className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${t.card} ${t.cardHover}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
                  <s.icon className={`w-4 h-4 ${ic}`} />
                </div>
                <p className={`flex-1 text-sm ${t.subtext}`}>{s.label}</p>
                <span className={`text-xl font-bold ${t.heading}`}>{s.value}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Activity feed + Quick nav ── */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* Activity feed */}
        <div className={`lg:col-span-2 rounded-2xl overflow-hidden ${t.card}`}>
          <div className={`flex items-center justify-between px-5 py-4 border-b ${t.divider}`}>
            <div className="flex items-center gap-2">
              <Activity className={`w-4 h-4 ${isLight ? "text-[#2F8F89]" : "text-[#3FE0D0]"}`} />
              <h3 className={`font-semibold text-sm ${t.heading}`}>Recent Activity</h3>
            </div>
            <span className={`text-xs ${t.muted}`}>{activity.length} items</span>
          </div>
          {activity.length === 0 ? (
            <p className={`px-6 py-10 text-sm text-center ${t.subtext}`}>
              No activity yet — add clients, bookings, or invoices to get started.
            </p>
          ) : (
            <div>
              {activity.map(item => {
                const Icon = typeIcon[item.type];
                const [bg, ic] = typeColor[item.type].split(" ");
                return (
                  <div key={item.key} className={`flex items-center gap-4 px-5 py-3.5 border-b last:border-0 transition-colors ${t.divider} ${t.rowHover}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
                      <Icon className={`w-3.5 h-3.5 ${ic}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${t.heading}`}>{item.label}</p>
                      <p className={`text-xs truncate ${t.muted}`}>{item.sub}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <p className={`text-xs hidden sm:block ${t.muted}`}>{formatDate(item.date)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize border ${badge[item.badgeColor]}`}>
                        {item.badge}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick navigation */}
        <div className="flex flex-col gap-2">
          <p className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 px-1 ${t.muted}`}>Quick Nav</p>
          {([
            { href: "/staff/crm",      label: "Clients & CRM", sub: `${totalClients} clients`,                                  icon: Users,        color: isLight ? "bg-purple-50 text-purple-600" : "bg-purple-400/10 text-purple-400" },
            { href: "/staff/invoices", label: "Invoices",       sub: `${pendingInvoices} pending · ${overdueCount} overdue`,     icon: FileText,     color: isLight ? "bg-blue-50 text-blue-600"     : "bg-blue-400/10 text-blue-400" },
            { href: "/staff/revenue",  label: "Revenue",        sub: `${formatCurrency(thisMonthRev)} this month`,               icon: DollarSign,   color: isLight ? "bg-green-50 text-green-600"   : "bg-green-400/10 text-green-400" },
            { href: "/staff/pipeline", label: "Pipeline",       sub: `${formatCurrency(pipelineValue)} value`,                   icon: TrendingUp,   color: isLight ? "bg-[#2F8F89]/10 text-[#2F8F89]" : "bg-[#3FE0D0]/10 text-[#3FE0D0]" },
            { href: "/staff/projects", label: "Projects",       sub: `${activeProjects} active`,                                 icon: FolderKanban, color: isLight ? "bg-indigo-50 text-indigo-600" : "bg-indigo-400/10 text-indigo-400" },
            { href: "/staff/bookings", label: "Bookings",       sub: `${totalBookings} total · ${todayBookings} today`,          icon: Calendar,     color: isLight ? "bg-sky-50 text-sky-600"       : "bg-sky-400/10 text-sky-400" },
          ] as const).map(link => {
            const [bg, ic] = link.color.split(" ");
            return (
              <Link key={link.href} href={link.href} className={`flex items-center gap-3 p-3.5 rounded-2xl transition-all group ${t.card} ${t.cardHover}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
                  <link.icon className={`w-3.5 h-3.5 ${ic}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium leading-tight ${t.heading}`}>{link.label}</p>
                  <p className={`text-xs mt-0.5 truncate ${t.muted}`}>{link.sub}</p>
                </div>
                <ArrowRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-50 transition-opacity flex-shrink-0 ${t.muted}`} />
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
}
