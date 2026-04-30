"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase";
import { getThemeTokens, formatCurrency, formatDate } from "@/lib/crm-utils";
import {
  FileText, Download, TrendingUp, Users, FolderKanban,
  Calendar, AlertTriangle, BarChart3, FileSpreadsheet,
  RefreshCw, ChevronDown, RefreshCcw, Lock,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Invoice = {
  id: string; invoice_no: string; client_name: string; client_email: string;
  status: string; issue_date: string; due_date: string | null;
  paid_date: string | null; subtotal: number; tax_amount: number;
  total: number; currency: string;
};
type Client = {
  id: string; full_name: string; email: string | null; company: string | null;
  industry: string | null; pipeline_stage: string; source: string | null;
  expected_value: number | null; created_at: string; last_contacted: string | null;
};
type Project = {
  id: string; title: string; client_name: string | null; status: string;
  priority: string; due_date: string | null; assigned_to: string | null; created_at: string;
};
type Booking = {
  id: string; name: string; email: string; company: string | null;
  topic: string | null; date: string; status: string;
  amount_paid: number | null; created_at: string;
};
type Subscription = {
  id: string; client_name: string; client_email: string; plan_name: string;
  amount: number; billing_day: number; start_date: string;
  next_billing_date: string; status: string; notes: string | null; created_at: string;
};
type SubscriptionPayment = {
  id: string; subscription_id: string; billing_month: string;
  invoice_no: string | null; amount: number; status: string;
  email_sent_at: string | null; paid_at: string | null; notes: string | null; created_at: string;
};

// ─── CSV helper ───────────────────────────────────────────────────────────────
function downloadCSV(filename: string, headers: string[], rows: (string | number | null | undefined)[][]) {
  const escape = (v: string | number | null | undefined) => {
    const s = v === null || v === undefined ? "" : String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers, ...rows].map((r) => r.map(escape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ─── PDF helper (dynamic import to avoid SSR) ─────────────────────────────────
async function generatePDF(
  title: string,
  subtitle: string,
  columns: string[],
  rows: (string | number)[][][],   // array of sections: each section is row[]
  sectionLabels: string[],
  companyName: string
) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();

  // Header bar
  doc.setFillColor(47, 143, 137);
  doc.rect(0, 0, pageW, 18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 12);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(subtitle, 14, 17);
  doc.text(companyName, pageW - 14, 12, { align: "right" });
  doc.text(`Generated: ${new Date().toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}`, pageW - 14, 17, { align: "right" });

  let startY = 24;

  rows.forEach((sectionRows, i) => {
    if (sectionLabels[i]) {
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(sectionLabels[i], 14, startY);
      startY += 4;
    }

    autoTable(doc, {
      startY,
      head: [columns],
      body: sectionRows as (string | number)[][],
      theme: "grid",
      headStyles: { fillColor: [17, 17, 19], textColor: [200, 200, 200], fontStyle: "bold", fontSize: 8 },
      bodyStyles: { fontSize: 7.5, textColor: [40, 40, 40] },
      alternateRowStyles: { fillColor: [245, 245, 246] },
      styles: { cellPadding: { top: 2, bottom: 2, left: 3, right: 3 } },
      margin: { left: 14, right: 14 },
      didDrawPage: (data: { cursor: { y: number } | null }) => { if (data.cursor) startY = data.cursor.y + 6; },
    });
    startY = (doc as any).lastAutoTable.finalY + 8;
  });

  // Footer on each page
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text(`Page ${p} of ${totalPages}`, pageW / 2, doc.internal.pageSize.getHeight() - 6, { align: "center" });
  }

  doc.save(`${title.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ─── Report card component ────────────────────────────────────────────────────
function ReportCard({
  icon: Icon, title, description, stats, accentColor, isLight,
  onPDF, onCSV, loading,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  stats: { label: string; value: string }[];
  accentColor: string;
  isLight: boolean;
  onPDF: () => void;
  onCSV: () => void;
  loading: boolean;
}) {
  const t = getThemeTokens(isLight);
  return (
    <div className={`rounded-2xl p-5 flex flex-col gap-4 ${t.card}`}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${accentColor}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-sm ${t.heading}`}>{title}</h3>
          <p className={`text-xs mt-0.5 ${t.subtext}`}>{description}</p>
        </div>
      </div>

      {stats.length > 0 && (
        <div className={`grid grid-cols-3 gap-2 pt-1 border-t ${t.divider}`}>
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className={`text-base font-bold ${t.heading}`}>{s.value}</p>
              <p className={`text-[10px] ${t.muted}`}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 mt-auto">
        <button
          onClick={onPDF}
          disabled={loading}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 ${
            isLight
              ? "bg-[#2F8F89]/10 text-[#2F8F89] hover:bg-[#2F8F89]/20"
              : "bg-[#2F8F89]/15 text-[#3FE0D0] hover:bg-[#2F8F89]/25"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          PDF
        </button>
        <button
          onClick={onCSV}
          disabled={loading}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 ${
            isLight
              ? "bg-black/[0.04] text-black/60 hover:bg-black/[0.08]"
              : "bg-white/[0.05] text-white/50 hover:bg-white/[0.08]"
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          Excel
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const { theme } = useTheme();
  const [mounted,  setMounted]  = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients,  setClients]  = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [subs,     setSubs]     = useState<Subscription[]>([]);
  const [subPays,  setSubPays]  = useState<SubscriptionPayment[]>([]);
  const [company,  setCompany]  = useState<{ company_name: string | null; currency: string }>({ company_name: null, currency: "ZAR" });
  const [loading,  setLoading]  = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);
  const [accessChecked, setAccessChecked] = useState(false);
  const [isAdmin,       setIsAdmin]       = useState(false);

  // Date range
  const [range, setRange] = useState("all");
  const RANGES = [
    { value: "all",     label: "All time" },
    { value: "this_month",  label: "This month" },
    { value: "last_month",  label: "Last month" },
    { value: "this_quarter",label: "This quarter" },
    { value: "this_year",   label: "This year" },
  ];

  useEffect(() => setMounted(true), []);

  // ── Access check ────────────────────────────────────────────────────────────
  useEffect(() => {
    async function checkAccess() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        const { data: member } = await supabase
          .from("team_members")
          .select("role")
          .eq("email", user.email)
          .maybeSingle();
        // No record = portal owner (first-time setup) → grant admin
        const admin = !member || member.role === "admin";
        setIsAdmin(admin);
        if (admin) loadAll();
      }
      setAccessChecked(true);
    }
    checkAccess();
  }, []);

  async function loadAll() {
    setLoading(true);
    const [
      { data: inv },
      { data: cli },
      { data: proj },
      { data: book },
      { data: co },
      { data: subData },
      { data: subPayData },
    ] = await Promise.all([
      supabase.from("invoices").select("*").order("issue_date", { ascending: false }),
      supabase.from("clients").select("*").order("created_at", { ascending: false }),
      supabase.from("projects").select("*").order("created_at", { ascending: false }),
      supabase.from("bookings").select("*").order("date", { ascending: false }),
      supabase.from("company_settings").select("company_name, currency").limit(1).maybeSingle(),
      supabase.from("subscriptions").select("*").order("created_at", { ascending: false }),
      supabase.from("subscription_payments").select("*").order("billing_month", { ascending: false }),
    ]);
    setInvoices(inv ?? []);
    setClients(cli ?? []);
    setProjects(proj ?? []);
    setBookings(book ?? []);
    setCompany({ company_name: co?.company_name ?? null, currency: co?.currency ?? "ZAR" });
    setSubs(subData ?? []);
    setSubPays(subPayData ?? []);
    setLoading(false);
  }

  const isLight = mounted && theme === "light";
  const t = getThemeTokens(isLight);
  const companyName = company.company_name ?? "Deluxify";

  // ── Access gate ─────────────────────────────────────────────────────────────
  if (!accessChecked) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#2F8F89] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 ${
          isLight ? "bg-red-50 text-red-500" : "bg-red-400/10 text-red-400"
        }`}>
          <Lock className="w-7 h-7" />
        </div>
        <h2 className={`text-xl font-bold mb-2 ${isLight ? "text-black" : "text-white"}`}>
          Administrator Access Required
        </h2>
        <p className={`text-sm max-w-sm ${isLight ? "text-black/45" : "text-white/40"}`}>
          The Reports section is restricted to team members with the <span className={`font-semibold ${isLight ? "text-black/70" : "text-white/60"}`}>Administrator</span> role and full portal access. Contact your admin to request access.
        </p>
      </div>
    );
  }

  // ── Date range filter ───────────────────────────────────────────────────────
  function inRange(dateStr: string | null | undefined): boolean {
    if (!dateStr || range === "all") return true;
    const d = new Date(dateStr);
    const now = new Date();
    if (range === "this_month") return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    if (range === "last_month") {
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return d.getFullYear() === lm.getFullYear() && d.getMonth() === lm.getMonth();
    }
    if (range === "this_quarter") {
      const q = Math.floor(now.getMonth() / 3);
      return d.getFullYear() === now.getFullYear() && Math.floor(d.getMonth() / 3) === q;
    }
    if (range === "this_year") return d.getFullYear() === now.getFullYear();
    return true;
  }

  const filteredInvoices = invoices.filter((i) => inRange(i.issue_date));
  const filteredClients  = clients.filter((c) => inRange(c.created_at));
  const filteredProjects = projects.filter((p) => inRange(p.created_at));
  const filteredBookings = bookings.filter((b) => inRange(b.date));

  // ── Summary stats ───────────────────────────────────────────────────────────
  const totalRevenue    = filteredInvoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0)
    + filteredBookings.filter((b) => b.status === "confirmed" || b.status === "completed").reduce((s, b) => s + (b.amount_paid ?? 0) * 100, 0);
  const outstandingAmt  = filteredInvoices.filter((i) => i.status === "sent" || i.status === "overdue").reduce((s, i) => s + i.total, 0);
  const overdueCount    = filteredInvoices.filter((i) => i.status === "overdue").length;
  const pipelineValue   = filteredClients.reduce((s, c) => s + (c.expected_value ?? 0), 0);
  const closedClients   = filteredClients.filter((c) => c.pipeline_stage === "closed").length;

  // Subscription stats (not date-range-filtered — subscriptions are ongoing)
  const activeSubs   = subs.filter((s) => s.status === "active");
  const mrr          = activeSubs.reduce((acc, s) => acc + s.amount, 0);
  const subPaidAmt   = subPays.filter((p) => p.status === "paid").reduce((acc, p) => acc + p.amount, 0);
  const subPendingCt = subPays.filter((p) => p.status === "pending").length;
  const subFailedCt  = subPays.filter((p) => p.status === "failed").length;

  function fmtSubMonth(ym: string) {
    const [y, m] = ym.split("-");
    return new Date(Number(y), Number(m) - 1, 1).toLocaleString("default", { month: "short", year: "numeric" });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // REPORT 1 — Revenue Summary
  // ─────────────────────────────────────────────────────────────────────────────
  async function exportRevenuePDF() {
    setExporting("revenue-pdf");
    const paid = filteredInvoices.filter((i) => i.status === "paid");

    // Monthly breakdown
    const monthMap = new Map<string, { inv: number; book: number }>();
    paid.forEach((i) => {
      const k = (i.paid_date ?? i.issue_date).slice(0, 7);
      const e = monthMap.get(k) ?? { inv: 0, book: 0 };
      monthMap.set(k, { ...e, inv: e.inv + i.total });
    });
    filteredBookings.filter((b) => b.status === "confirmed" || b.status === "completed").forEach((b) => {
      const k = b.date.slice(0, 7);
      const e = monthMap.get(k) ?? { inv: 0, book: 0 };
      monthMap.set(k, { ...e, book: e.book + (b.amount_paid ?? 0) * 100 });
    });
    const monthRows = Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([m, v]) => [
        new Date(m + "-01").toLocaleDateString("en-ZA", { month: "long", year: "numeric" }),
        formatCurrency(v.inv),
        formatCurrency(v.book),
        formatCurrency(v.inv + v.book),
      ]);

    // Invoice breakdown
    const invRows = paid.map((i) => [
      i.invoice_no, i.client_name,
      formatDate(i.paid_date ?? i.issue_date),
      formatCurrency(i.subtotal),
      formatCurrency(i.tax_amount),
      formatCurrency(i.total),
    ]);

    await generatePDF(
      "Revenue Summary Report",
      `Period: ${RANGES.find((r) => r.value === range)?.label}  |  Total: ${formatCurrency(totalRevenue)}`,
      ["Month", "Invoice Revenue", "Booking Revenue", "Total"],
      [monthRows, invRows],
      ["Monthly Breakdown", "Paid Invoices Detail"],
      companyName
    );
    setExporting(null);
  }

  function exportRevenueCSV() {
    const paid = filteredInvoices.filter((i) => i.status === "paid");
    downloadCSV(
      `Revenue_Summary_${new Date().toISOString().slice(0, 10)}.csv`,
      ["Invoice No", "Client", "Issue Date", "Paid Date", "Subtotal (cents)", "Tax (cents)", "Total (cents)", "Currency"],
      paid.map((i) => [i.invoice_no, i.client_name, i.issue_date, i.paid_date, i.subtotal, i.tax_amount, i.total, i.currency])
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // REPORT 2 — Full Invoice Report
  // ─────────────────────────────────────────────────────────────────────────────
  async function exportInvoicesPDF() {
    setExporting("invoices-pdf");
    const statusOrder = ["overdue", "sent", "draft", "paid", "cancelled"];
    const grouped = statusOrder.map((status) => ({
      label: status.charAt(0).toUpperCase() + status.slice(1) + " Invoices",
      rows: filteredInvoices
        .filter((i) => i.status === status)
        .map((i) => [
          i.invoice_no, i.client_name,
          formatDate(i.issue_date), formatDate(i.due_date),
          formatDate(i.paid_date),
          i.status.toUpperCase(),
          formatCurrency(i.total),
        ]),
    })).filter((g) => g.rows.length > 0);

    await generatePDF(
      "Invoice Report",
      `All invoices  |  ${filteredInvoices.length} records`,
      ["Invoice #", "Client", "Issue Date", "Due Date", "Paid Date", "Status", "Total"],
      grouped.map((g) => g.rows),
      grouped.map((g) => g.label),
      companyName
    );
    setExporting(null);
  }

  function exportInvoicesCSV() {
    downloadCSV(
      `Invoices_${new Date().toISOString().slice(0, 10)}.csv`,
      ["Invoice No", "Client", "Client Email", "Status", "Issue Date", "Due Date", "Paid Date", "Subtotal", "Tax", "Total", "Currency"],
      filteredInvoices.map((i) => [
        i.invoice_no, i.client_name, i.client_email, i.status,
        i.issue_date, i.due_date, i.paid_date,
        (i.subtotal / 100).toFixed(2), (i.tax_amount / 100).toFixed(2), (i.total / 100).toFixed(2), i.currency,
      ])
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // REPORT 3 — Outstanding / Overdue Invoices
  // ─────────────────────────────────────────────────────────────────────────────
  async function exportOutstandingPDF() {
    setExporting("outstanding-pdf");
    const outstanding = filteredInvoices.filter((i) => i.status === "sent" || i.status === "overdue");
    const rows = outstanding.map((i) => {
      const dueDate = i.due_date ? new Date(i.due_date) : null;
      const daysOverdue = dueDate ? Math.floor((Date.now() - dueDate.getTime()) / 86400000) : 0;
      return [
        i.invoice_no, i.client_name, i.client_email,
        formatDate(i.issue_date), formatDate(i.due_date),
        i.status.toUpperCase(),
        dueDate && daysOverdue > 0 ? `${daysOverdue} days` : "—",
        formatCurrency(i.total),
      ];
    });
    await generatePDF(
      "Outstanding Invoices",
      `Unpaid invoices requiring follow-up  |  ${outstanding.length} invoices  |  ${formatCurrency(outstandingAmt)} outstanding`,
      ["Invoice #", "Client", "Email", "Issue Date", "Due Date", "Status", "Days Overdue", "Amount"],
      [rows],
      [""],
      companyName
    );
    setExporting(null);
  }

  function exportOutstandingCSV() {
    const outstanding = filteredInvoices.filter((i) => i.status === "sent" || i.status === "overdue");
    downloadCSV(
      `Outstanding_Invoices_${new Date().toISOString().slice(0, 10)}.csv`,
      ["Invoice No", "Client", "Email", "Issue Date", "Due Date", "Status", "Amount"],
      outstanding.map((i) => [
        i.invoice_no, i.client_name, i.client_email,
        i.issue_date, i.due_date, i.status, (i.total / 100).toFixed(2),
      ])
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // REPORT 4 — Client Report
  // ─────────────────────────────────────────────────────────────────────────────
  async function exportClientsPDF() {
    setExporting("clients-pdf");
    const rows = filteredClients.map((c) => [
      c.full_name, c.email ?? "—", c.company ?? "—",
      c.industry ?? "—", c.pipeline_stage.charAt(0).toUpperCase() + c.pipeline_stage.slice(1),
      c.source ?? "—",
      c.expected_value ? formatCurrency(c.expected_value) : "—",
      formatDate(c.created_at),
      formatDate(c.last_contacted),
    ]);
    await generatePDF(
      "Client Report",
      `All clients  |  ${filteredClients.length} records  |  Pipeline value: ${formatCurrency(pipelineValue)}`,
      ["Name", "Email", "Company", "Industry", "Stage", "Source", "Expected Value", "Added", "Last Contact"],
      [rows],
      [""],
      companyName
    );
    setExporting(null);
  }

  function exportClientsCSV() {
    downloadCSV(
      `Clients_${new Date().toISOString().slice(0, 10)}.csv`,
      ["Full Name", "Email", "Company", "Industry", "Pipeline Stage", "Source", "Expected Value", "Created At", "Last Contacted"],
      filteredClients.map((c) => [
        c.full_name, c.email, c.company, c.industry,
        c.pipeline_stage, c.source,
        c.expected_value ? (c.expected_value / 100).toFixed(2) : "",
        c.created_at, c.last_contacted,
      ])
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // REPORT 5 — Sales Pipeline Report
  // ─────────────────────────────────────────────────────────────────────────────
  async function exportPipelinePDF() {
    setExporting("pipeline-pdf");
    const stages = ["lead", "contacted", "proposal", "closed", "churned"];
    const grouped = stages.map((stage) => ({
      label: stage.charAt(0).toUpperCase() + stage.slice(1),
      rows: filteredClients
        .filter((c) => c.pipeline_stage === stage)
        .map((c) => [
          c.full_name, c.email ?? "—", c.company ?? "—",
          c.expected_value ? formatCurrency(c.expected_value) : "—",
          formatDate(c.last_contacted), formatDate(c.created_at),
        ]),
    })).filter((g) => g.rows.length > 0);

    await generatePDF(
      "Sales Pipeline Report",
      `Pipeline stages breakdown  |  Total pipeline value: ${formatCurrency(pipelineValue)}`,
      ["Name", "Email", "Company", "Expected Value", "Last Contact", "Added"],
      grouped.map((g) => g.rows),
      grouped.map((g) => `Stage: ${g.label} (${g.rows.length} client${g.rows.length !== 1 ? "s" : ""})`),
      companyName
    );
    setExporting(null);
  }

  function exportPipelineCSV() {
    downloadCSV(
      `Pipeline_${new Date().toISOString().slice(0, 10)}.csv`,
      ["Full Name", "Email", "Company", "Stage", "Expected Value", "Last Contacted", "Created At"],
      filteredClients.map((c) => [
        c.full_name, c.email, c.company, c.pipeline_stage,
        c.expected_value ? (c.expected_value / 100).toFixed(2) : "",
        c.last_contacted, c.created_at,
      ])
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // REPORT 6 — Project Status Report
  // ─────────────────────────────────────────────────────────────────────────────
  async function exportProjectsPDF() {
    setExporting("projects-pdf");
    const statuses = ["planning", "in-progress", "review", "completed"];
    const grouped = statuses.map((status) => ({
      label: status === "in-progress" ? "In Progress" : status.charAt(0).toUpperCase() + status.slice(1),
      rows: filteredProjects
        .filter((p) => p.status === status)
        .map((p) => [
          p.title, p.client_name ?? "—",
          p.priority.charAt(0).toUpperCase() + p.priority.slice(1),
          p.assigned_to ?? "—",
          formatDate(p.due_date), formatDate(p.created_at),
        ]),
    })).filter((g) => g.rows.length > 0);

    await generatePDF(
      "Project Status Report",
      `All projects  |  ${filteredProjects.length} total`,
      ["Title", "Client", "Priority", "Assigned To", "Due Date", "Created"],
      grouped.map((g) => g.rows),
      grouped.map((g) => `${g.label} (${g.rows.length})`),
      companyName
    );
    setExporting(null);
  }

  function exportProjectsCSV() {
    downloadCSV(
      `Projects_${new Date().toISOString().slice(0, 10)}.csv`,
      ["Title", "Client", "Status", "Priority", "Assigned To", "Due Date", "Created At"],
      filteredProjects.map((p) => [
        p.title, p.client_name, p.status, p.priority,
        p.assigned_to, p.due_date, p.created_at,
      ])
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // REPORT 7 — Bookings Report
  // ─────────────────────────────────────────────────────────────────────────────
  async function exportBookingsPDF() {
    setExporting("bookings-pdf");
    const rows = filteredBookings.map((b) => [
      b.name, b.email, b.company ?? "—", b.topic ?? "—",
      formatDate(b.date),
      b.status.charAt(0).toUpperCase() + b.status.slice(1),
      b.amount_paid != null ? `R ${b.amount_paid.toFixed(2)}` : "—",
    ]);
    const bookingRevenue = filteredBookings
      .filter((b) => b.status === "confirmed" || b.status === "completed")
      .reduce((s, b) => s + (b.amount_paid ?? 0), 0);
    await generatePDF(
      "Bookings Report",
      `All bookings  |  ${filteredBookings.length} records  |  Revenue: R ${bookingRevenue.toFixed(2)}`,
      ["Name", "Email", "Company", "Topic", "Date", "Status", "Amount Paid"],
      [rows],
      [""],
      companyName
    );
    setExporting(null);
  }

  function exportBookingsCSV() {
    downloadCSV(
      `Bookings_${new Date().toISOString().slice(0, 10)}.csv`,
      ["Name", "Email", "Company", "Topic", "Date", "Status", "Amount Paid", "Reference", "Created At"],
      filteredBookings.map((b) => [
        b.name, b.email, b.company, b.topic,
        b.date, b.status, b.amount_paid, (b as any).reference, b.created_at,
      ])
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // REPORT 8 — Subscription Overview
  // ─────────────────────────────────────────────────────────────────────────────
  async function exportSubscriptionsPDF() {
    setExporting("subscriptions-pdf");

    // Active subscriptions
    const activeRows = activeSubs.map((s) => [
      s.client_name, s.client_email, s.plan_name,
      formatCurrency(s.amount), `Day ${s.billing_day}`,
      s.next_billing_date,
    ]);

    // Paused / cancelled
    const inactiveRows = subs.filter((s) => s.status !== "active").map((s) => [
      s.client_name, s.client_email, s.plan_name,
      formatCurrency(s.amount),
      s.status.charAt(0).toUpperCase() + s.status.slice(1),
      s.notes ?? "—",
    ]);

    // Monthly collected breakdown
    const monthMap = new Map<string, number>();
    subPays.filter((p) => p.status === "paid").forEach((p) => {
      monthMap.set(p.billing_month, (monthMap.get(p.billing_month) ?? 0) + p.amount);
    });
    const monthRows = Array.from(monthMap.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([m, total]) => [fmtSubMonth(m), formatCurrency(total)]);

    await generatePDF(
      "Subscription Overview Report",
      `MRR: ${formatCurrency(mrr)}  |  ${activeSubs.length} active  |  ${subs.length} total`,
      ["Client", "Email", "Plan", "Amount", "Billing Day", "Next Billing"],
      [
        activeRows,
        inactiveRows.length ? inactiveRows : [["No inactive subscriptions", "", "", "", "", ""]],
        monthRows.length ? monthRows : [["No payment history", ""]],
      ],
      [
        `Active Subscriptions (${activeSubs.length})`,
        `Paused / Cancelled (${subs.filter((s) => s.status !== "active").length})`,
        "Monthly Collected Revenue",
      ],
      companyName
    );
    setExporting(null);
  }

  function exportSubscriptionsCSV() {
    downloadCSV(
      `Subscriptions_${new Date().toISOString().slice(0, 10)}.csv`,
      ["Client Name", "Client Email", "Plan", "Amount (cents)", "Billing Day", "Start Date", "Next Billing", "Status", "Notes"],
      subs.map((s) => [
        s.client_name, s.client_email, s.plan_name, s.amount,
        s.billing_day, s.start_date, s.next_billing_date, s.status, s.notes,
      ])
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // REPORT 9 — Subscription Payments
  // ─────────────────────────────────────────────────────────────────────────────
  async function exportSubPaymentsPDF() {
    setExporting("subpayments-pdf");

    const subMap = new Map(subs.map((s) => [s.id, s]));
    const statusOrder = ["paid", "pending", "failed"];

    const grouped = statusOrder.map((status) => ({
      label: status.charAt(0).toUpperCase() + status.slice(1),
      rows: subPays
        .filter((p) => p.status === status)
        .map((p) => {
          const sub = subMap.get(p.subscription_id);
          return [
            sub?.client_name ?? "—",
            sub?.plan_name ?? "—",
            fmtSubMonth(p.billing_month),
            p.invoice_no ?? "—",
            formatCurrency(p.amount),
            p.paid_at ? p.paid_at.slice(0, 10) : "—",
            p.email_sent_at ? p.email_sent_at.slice(0, 10) : "—",
          ];
        }),
    })).filter((g) => g.rows.length > 0);

    await generatePDF(
      "Subscription Payments Report",
      `${subPays.length} records  |  Collected: ${formatCurrency(subPaidAmt)}  |  Pending: ${subPendingCt}  |  Failed: ${subFailedCt}`,
      ["Client", "Plan", "Month", "Invoice", "Amount", "Paid On", "Email Sent"],
      grouped.map((g) => g.rows),
      grouped.map((g) => `${g.label} (${g.rows.length})`),
      companyName
    );
    setExporting(null);
  }

  function exportSubPaymentsCSV() {
    const subMap = new Map(subs.map((s) => [s.id, s]));
    downloadCSV(
      `Subscription_Payments_${new Date().toISOString().slice(0, 10)}.csv`,
      ["Client", "Plan", "Billing Month", "Invoice No", "Amount (cents)", "Status", "Paid At", "Email Sent At"],
      subPays.map((p) => {
        const sub = subMap.get(p.subscription_id);
        return [
          sub?.client_name ?? "", sub?.plan_name ?? "",
          p.billing_month, p.invoice_no, p.amount, p.status,
          p.paid_at, p.email_sent_at,
        ];
      })
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Summary banner
  // ─────────────────────────────────────────────────────────────────────────────
  const summaryStats = [
    { label: "Total Revenue",     value: formatCurrency(totalRevenue),    sub: "paid invoices + bookings" },
    { label: "Outstanding",       value: formatCurrency(outstandingAmt),  sub: `${overdueCount} overdue` },
    { label: "MRR",               value: formatCurrency(mrr),             sub: `${activeSubs.length} active subs` },
    { label: "Pipeline Value",    value: formatCurrency(pipelineValue),   sub: `${closedClients} closed` },
    { label: "Clients",           value: String(filteredClients.length),  sub: "in database" },
    { label: "Active Projects",   value: String(filteredProjects.filter((p) => p.status === "in-progress").length), sub: `${filteredProjects.length} total` },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className={`text-2xl font-bold ${t.heading}`}>Reports</h1>
          <p className={`text-sm mt-0.5 ${t.subtext}`}>Export business data as PDF or Excel (CSV)</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Date range selector */}
          <div className="relative">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className={`pl-3 pr-8 py-2 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2F8F89] appearance-none transition-all ${
                isLight
                  ? "bg-black/[0.04] border border-black/10 text-black"
                  : "bg-white/[0.06] border border-white/10 text-white"
              }`}
            >
              {RANGES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <ChevronDown className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none ${t.muted}`} />
          </div>
          <button
            onClick={loadAll}
            disabled={loading}
            className={`p-2 rounded-xl transition-all ${
              isLight ? "text-black/40 hover:text-black hover:bg-black/[0.04]" : "text-white/40 hover:text-white hover:bg-white/[0.06]"
            }`}
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className={`rounded-2xl p-5 ${t.card}`}>
        <p className={`text-[10px] font-bold uppercase tracking-wider mb-4 ${t.muted}`}>
          Overview — {RANGES.find((r) => r.value === range)?.label}
        </p>
        {loading ? (
          <div className="flex items-center justify-center h-16">
            <div className="w-5 h-5 border-2 border-[#2F8F89] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {summaryStats.map((s) => (
              <div key={s.label}>
                <p className={`text-lg font-bold ${t.heading}`}>{s.value}</p>
                <p className={`text-xs font-medium ${isLight ? "text-black/60" : "text-white/60"}`}>{s.label}</p>
                <p className={`text-[10px] ${t.muted}`}>{s.sub}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report cards */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-[#2F8F89] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* 1. Revenue Summary */}
          <ReportCard
            icon={TrendingUp}
            title="Revenue Summary"
            description="Monthly revenue breakdown across paid invoices and confirmed bookings."
            accentColor={isLight ? "bg-[#2F8F89]/15 text-[#2F8F89]" : "bg-[#2F8F89]/20 text-[#3FE0D0]"}
            stats={[
              { label: "Paid", value: String(filteredInvoices.filter((i) => i.status === "paid").length) },
              { label: "Revenue", value: formatCurrency(totalRevenue) },
              { label: "Bookings", value: String(filteredBookings.filter((b) => b.status === "confirmed" || b.status === "completed").length) },
            ]}
            isLight={isLight}
            onPDF={exportRevenuePDF}
            onCSV={exportRevenueCSV}
            loading={exporting === "revenue-pdf"}
          />

          {/* 2. Full Invoice Report */}
          <ReportCard
            icon={FileText}
            title="Invoice Report"
            description="Complete list of all invoices with statuses, amounts, and dates."
            accentColor={isLight ? "bg-blue-50 text-blue-600" : "bg-blue-400/15 text-blue-400"}
            stats={[
              { label: "Total", value: String(filteredInvoices.length) },
              { label: "Paid", value: String(filteredInvoices.filter((i) => i.status === "paid").length) },
              { label: "Draft/Sent", value: String(filteredInvoices.filter((i) => i.status === "draft" || i.status === "sent").length) },
            ]}
            isLight={isLight}
            onPDF={exportInvoicesPDF}
            onCSV={exportInvoicesCSV}
            loading={exporting === "invoices-pdf"}
          />

          {/* 3. Outstanding Invoices */}
          <ReportCard
            icon={AlertTriangle}
            title="Outstanding Invoices"
            description="All unpaid and overdue invoices that need follow-up or collection."
            accentColor={isLight ? "bg-red-50 text-red-600" : "bg-red-400/15 text-red-400"}
            stats={[
              { label: "Outstanding", value: String(filteredInvoices.filter((i) => i.status === "sent" || i.status === "overdue").length) },
              { label: "Overdue", value: String(overdueCount) },
              { label: "Amount", value: formatCurrency(outstandingAmt) },
            ]}
            isLight={isLight}
            onPDF={exportOutstandingPDF}
            onCSV={exportOutstandingCSV}
            loading={exporting === "outstanding-pdf"}
          />

          {/* 4. Client Report */}
          <ReportCard
            icon={Users}
            title="Client Report"
            description="Full client list with contact details, industry, source, and expected value."
            accentColor={isLight ? "bg-purple-50 text-purple-600" : "bg-purple-400/15 text-purple-400"}
            stats={[
              { label: "Total", value: String(filteredClients.length) },
              { label: "Closed", value: String(closedClients) },
              { label: "Pipeline", value: formatCurrency(pipelineValue) },
            ]}
            isLight={isLight}
            onPDF={exportClientsPDF}
            onCSV={exportClientsCSV}
            loading={exporting === "clients-pdf"}
          />

          {/* 5. Sales Pipeline */}
          <ReportCard
            icon={BarChart3}
            title="Sales Pipeline"
            description="Clients grouped by pipeline stage with expected revenue values."
            accentColor={isLight ? "bg-yellow-50 text-yellow-600" : "bg-yellow-400/15 text-yellow-400"}
            stats={[
              { label: "Leads", value: String(filteredClients.filter((c) => c.pipeline_stage === "lead").length) },
              { label: "Proposals", value: String(filteredClients.filter((c) => c.pipeline_stage === "proposal").length) },
              { label: "Closed", value: String(closedClients) },
            ]}
            isLight={isLight}
            onPDF={exportPipelinePDF}
            onCSV={exportPipelineCSV}
            loading={exporting === "pipeline-pdf"}
          />

          {/* 6. Projects */}
          <ReportCard
            icon={FolderKanban}
            title="Project Status Report"
            description="All projects grouped by status (Planning, In Progress, Review, Completed)."
            accentColor={isLight ? "bg-green-50 text-green-600" : "bg-green-400/15 text-green-400"}
            stats={[
              { label: "In Progress", value: String(filteredProjects.filter((p) => p.status === "in-progress").length) },
              { label: "Review", value: String(filteredProjects.filter((p) => p.status === "review").length) },
              { label: "Completed", value: String(filteredProjects.filter((p) => p.status === "completed").length) },
            ]}
            isLight={isLight}
            onPDF={exportProjectsPDF}
            onCSV={exportProjectsCSV}
            loading={exporting === "projects-pdf"}
          />

          {/* 7. Bookings */}
          <ReportCard
            icon={Calendar}
            title="Bookings Report"
            description="All consultations and bookings with payment status and revenue breakdown."
            accentColor={isLight ? "bg-orange-50 text-orange-600" : "bg-orange-400/15 text-orange-400"}
            stats={[
              { label: "Total", value: String(filteredBookings.length) },
              { label: "Confirmed", value: String(filteredBookings.filter((b) => b.status === "confirmed").length) },
              { label: "Revenue", value: `R ${filteredBookings.filter((b) => b.status === "confirmed" || b.status === "completed").reduce((s, b) => s + (b.amount_paid ?? 0), 0).toFixed(0)}` },
            ]}
            isLight={isLight}
            onPDF={exportBookingsPDF}
            onCSV={exportBookingsCSV}
            loading={exporting === "bookings-pdf"}
          />

          {/* 8. Subscription Overview */}
          <ReportCard
            icon={RefreshCcw}
            title="Subscription Overview"
            description="Active subscriptions with MRR, billing schedule, and monthly collected revenue breakdown."
            accentColor={isLight ? "bg-[#2F8F89]/15 text-[#2F8F89]" : "bg-[#2F8F89]/20 text-[#3FE0D0]"}
            stats={[
              { label: "Active", value: String(activeSubs.length) },
              { label: "MRR",    value: formatCurrency(mrr) },
              { label: "Total",  value: String(subs.length) },
            ]}
            isLight={isLight}
            onPDF={exportSubscriptionsPDF}
            onCSV={exportSubscriptionsCSV}
            loading={exporting === "subscriptions-pdf"}
          />

          {/* 9. Subscription Payments */}
          <ReportCard
            icon={FileText}
            title="Subscription Payments"
            description="All monthly payment records — paid, pending, and failed — with invoice references."
            accentColor={isLight ? "bg-indigo-50 text-indigo-600" : "bg-indigo-400/15 text-indigo-400"}
            stats={[
              { label: "Collected", value: formatCurrency(subPaidAmt) },
              { label: "Pending",   value: String(subPendingCt) },
              { label: "Failed",    value: String(subFailedCt) },
            ]}
            isLight={isLight}
            onPDF={exportSubPaymentsPDF}
            onCSV={exportSubPaymentsCSV}
            loading={exporting === "subpayments-pdf"}
          />

          {/* 10. Full Business Snapshot */}
          <ReportCard
            icon={Download}
            title="Full Business Snapshot"
            description="Complete export of all data — invoices, clients, projects, and bookings in one file."
            accentColor={isLight ? "bg-[#2F8F89]/10 text-[#2F8F89]" : "bg-[#2F8F89]/15 text-[#3FE0D0]"}
            stats={[
              { label: "Invoices", value: String(filteredInvoices.length) },
              { label: "Clients", value: String(filteredClients.length) },
              { label: "Projects", value: String(filteredProjects.length) },
            ]}
            isLight={isLight}
            onPDF={async () => {
              await exportRevenuePDF();
              await exportInvoicesPDF();
              await exportClientsPDF();
              await exportProjectsPDF();
              await exportSubscriptionsPDF();
              await exportSubPaymentsPDF();
            }}
            onCSV={() => {
              exportRevenueCSV();
              exportInvoicesCSV();
              exportClientsCSV();
              exportProjectsCSV();
              exportBookingsCSV();
              exportSubscriptionsCSV();
              exportSubPaymentsCSV();
            }}
            loading={exporting !== null}
          />
        </div>
      )}

      {/* Export in progress indicator */}
      {exporting && (
        <div className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl z-50 ${
          isLight ? "bg-white border border-black/10" : "bg-[#111113] border border-white/10"
        }`}>
          <div className="w-4 h-4 border-2 border-[#2F8F89] border-t-transparent rounded-full animate-spin" />
          <span className={`text-sm font-medium ${t.heading}`}>Generating PDF…</span>
        </div>
      )}
    </div>
  );
}