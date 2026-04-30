"use client";

import { useEffect, useState, useCallback } from "react";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase";
import { getThemeTokens, formatCurrency } from "@/lib/crm-utils";
import {
  type Subscription, type SubscriptionPayment,
  SUBSCRIPTION_STATUSES, type SubscriptionStatus,
  SUBSCRIPTION_STATUS_META, SUBSCRIPTION_PAYMENT_STATUS_META,
} from "@/types/crm";
import {
  Plus, Edit2, Trash2, X, RefreshCcw, Mail, ReceiptText,
  ChevronDown, CheckCircle2, AlertCircle, Clock, History,
  Loader2, TrendingUp,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────

const EMPTY_FORM: Omit<Subscription, "id" | "created_at" | "updated_at"> = {
  client_id:         null,
  client_name:       "",
  client_email:      "",
  plan_name:         "",
  amount:            0,
  billing_day:       1,
  start_date:        new Date().toISOString().slice(0, 10),
  next_billing_date: new Date().toISOString().slice(0, 10),
  status:            "active",
  notes:             null,
};

function nextBillingDate(day: number, from: Date = new Date()): string {
  const d = new Date(from);
  d.setDate(day);
  if (d <= from) d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

function fmtMonth(ym: string) {
  const [y, m] = ym.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleString("default", { month: "long", year: "numeric" });
}

function currentBillingMonth(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SubscriptionsPage() {
  const { theme } = useTheme();
  const [mounted,  setMounted]  = useState(false);
  const [subs,     setSubs]     = useState<Subscription[]>([]);
  const [payments, setPayments] = useState<SubscriptionPayment[]>([]);
  const [loading,  setLoading]  = useState(true);

  // Modals
  const [showModal,   setShowModal]   = useState(false);
  const [edit,        setEdit]        = useState<Subscription | null>(null);
  const [form,        setForm]        = useState({ ...EMPTY_FORM, amount: 0 });
  const [saving,      setSaving]      = useState(false);

  const [historyFor,  setHistoryFor]  = useState<Subscription | null>(null);
  const [histPayments, setHistPayments] = useState<SubscriptionPayment[]>([]);
  const [histLoading, setHistLoading] = useState(false);

  // Per-row actions in progress
  const [billing, setBilling]   = useState<Set<string>>(new Set());
  const [emailing, setEmailing] = useState<Set<string>>(new Set());

  // Filter
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | "all">("all");

  useEffect(() => setMounted(true), []);

  const load = useCallback(async () => {
    const [{ data: subData }, { data: payData }] = await Promise.all([
      supabase.from("subscriptions").select("*").order("created_at", { ascending: false }),
      supabase.from("subscription_payments").select("*").order("billing_month", { ascending: false }),
    ]);
    setSubs(subData ?? []);
    setPayments(payData ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const activeSubs = subs.filter((s) => s.status === "active");
  const mrr        = activeSubs.reduce((acc, s) => acc + s.amount, 0);
  const thisMonth  = currentBillingMonth();
  const dueCount   = activeSubs.filter((s) => !payments.find(
    (p) => p.subscription_id === s.id && p.billing_month === thisMonth && p.status === "paid"
  )).length;

  // ── Form helpers ──────────────────────────────────────────────────────────
  function openCreate() {
    setEdit(null);
    const today = new Date().toISOString().slice(0, 10);
    setForm({ ...EMPTY_FORM, amount: 0, start_date: today, next_billing_date: nextBillingDate(1) });
    setShowModal(true);
  }

  function openEdit(s: Subscription) {
    setEdit(s);
    setForm({ ...s, amount: s.amount / 100 } as typeof form);
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      amount: Math.round((form.amount || 0) * 100),
      next_billing_date: nextBillingDate(form.billing_day),
    };
    if (edit) {
      await supabase.from("subscriptions").update(payload).eq("id", edit.id);
    } else {
      await supabase.from("subscriptions").insert(payload);
    }
    await load();
    setShowModal(false);
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this subscription? All payment records will also be removed.")) return;
    await supabase.from("subscriptions").delete().eq("id", id);
    setSubs((p) => p.filter((s) => s.id !== id));
  }

  // ── Billing action ────────────────────────────────────────────────────────
  async function handleBill(sub: Subscription) {
    setBilling((s) => new Set(s).add(sub.id));
    const bm = currentBillingMonth();

    // Idempotency: if a payment already exists for this month, skip
    const existing = payments.find((p) => p.subscription_id === sub.id && p.billing_month === bm);
    if (existing) {
      alert(`A payment record for ${fmtMonth(bm)} already exists (${SUBSCRIPTION_PAYMENT_STATUS_META[existing.status].label}).`);
      setBilling((s) => { const n = new Set(s); n.delete(sub.id); return n; });
      return;
    }

    // Generate invoice number
    const { data: settings } = await supabase.from("company_settings").select("id,invoice_prefix,invoice_counter").single();
    const prefix  = settings?.invoice_prefix ?? "INV";
    const counter = (settings?.invoice_counter ?? 0) + 1;
    const invoiceNo = `${prefix}-${String(counter).padStart(4, "0")}`;

    // Create invoice
    const issueDate = new Date().toISOString().slice(0, 10);
    const { data: invoice } = await supabase.from("invoices").insert({
      invoice_no:   invoiceNo,
      client_id:    sub.client_id,
      client_name:  sub.client_name,
      client_email: sub.client_email,
      project_name: sub.plan_name,
      status:       "sent",
      issue_date:   issueDate,
      due_date:     null,
      paid_date:    null,
      subtotal:     sub.amount,
      tax_rate:     0,
      tax_amount:   0,
      total:        sub.amount,
      currency:     "ZAR",
      notes:        `Monthly subscription – ${fmtMonth(bm)}`,
    }).select().single();

    if (invoice) {
      // Invoice line item
      await supabase.from("invoice_items").insert({
        invoice_id:  invoice.id,
        description: `${sub.plan_name} – ${fmtMonth(bm)}`,
        quantity:    1,
        unit_price:  sub.amount,
        total:       sub.amount,
        sort_order:  0,
      });

      // Bump invoice counter
      await supabase.from("company_settings").update({ invoice_counter: counter }).eq("id", settings?.id ?? "");

      // Create payment record
      const { data: payRec } = await supabase.from("subscription_payments").insert({
        subscription_id: sub.id,
        billing_month:   bm,
        invoice_id:      invoice.id,
        invoice_no:      invoiceNo,
        amount:          sub.amount,
        status:          "pending",
      }).select().single();

      // Advance next billing date
      const next = nextBillingDate(sub.billing_day, new Date(sub.next_billing_date));
      await supabase.from("subscriptions").update({ next_billing_date: next }).eq("id", sub.id);

      if (payRec) setPayments((p) => [payRec, ...p]);
    }

    await load();
    setBilling((s) => { const n = new Set(s); n.delete(sub.id); return n; });
  }

  // ── Bill all due ──────────────────────────────────────────────────────────
  async function handleBillAll() {
    const bm = currentBillingMonth();
    const due = activeSubs.filter((s) => !payments.find(
      (p) => p.subscription_id === s.id && p.billing_month === bm && p.status === "paid"
    ));
    if (!due.length) { alert("No subscriptions are due this month."); return; }
    if (!confirm(`Bill ${due.length} subscription(s) for ${fmtMonth(bm)}?`)) return;
    for (const sub of due) await handleBill(sub);
  }

  // ── Email action ──────────────────────────────────────────────────────────
  async function handleEmail(sub: Subscription, type: "payment_received" | "payment_reminder" | "overdue_notice") {
    setEmailing((s) => new Set(s).add(`${sub.id}-${type}`));
    const bm = currentBillingMonth();
    const pay = payments.find((p) => p.subscription_id === sub.id && p.billing_month === bm);

    await fetch("/api/subscriptions/notify", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        clientName:   sub.client_name,
        clientEmail:  sub.client_email,
        planName:     sub.plan_name,
        amount:       formatCurrency(sub.amount),
        billingMonth: fmtMonth(bm),
        invoiceNo:    pay?.invoice_no ?? undefined,
      }),
    });

    // Record email sent timestamp
    if (pay) {
      const now = new Date().toISOString();
      await supabase.from("subscription_payments").update({ email_sent_at: now }).eq("id", pay.id);
      setPayments((prev) => prev.map((p) => p.id === pay.id ? { ...p, email_sent_at: now } : p));
    }

    setEmailing((s) => { const n = new Set(s); n.delete(`${sub.id}-${type}`); return n; });
    alert(`Email sent to ${sub.client_email}`);
  }

  // ── Mark payment as paid ──────────────────────────────────────────────────
  async function markPaid(payId: string, subId: string) {
    const now = new Date().toISOString();
    await supabase.from("subscription_payments").update({ status: "paid", paid_at: now }).eq("id", payId);
    await supabase.from("invoices").update({ status: "paid", paid_date: now.slice(0, 10) })
      .eq("id", payments.find((p) => p.id === payId)?.invoice_id ?? "");
    setPayments((p) => p.map((py) => py.id === payId ? { ...py, status: "paid", paid_at: now } : py));
    // refresh
    await load();
  }

  // ── History modal ─────────────────────────────────────────────────────────
  async function openHistory(sub: Subscription) {
    setHistoryFor(sub);
    setHistLoading(true);
    const { data } = await supabase.from("subscription_payments")
      .select("*").eq("subscription_id", sub.id).order("billing_month", { ascending: false });
    setHistPayments(data ?? []);
    setHistLoading(false);
  }

  const isLight = mounted && theme === "light";
  const t       = getThemeTokens(isLight);

  const filtered = statusFilter === "all" ? subs : subs.filter((s) => s.status === statusFilter);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-6xl">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className={`text-2xl font-bold ${t.heading}`}>Subscriptions</h1>
          <p className={`text-sm mt-0.5 ${t.subtext}`}>
            {activeSubs.length} active · {dueCount} due this month
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {dueCount > 0 && (
            <button onClick={handleBillAll}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                isLight
                  ? "border-[#2F8F89]/30 text-[#2F8F89] hover:bg-[#2F8F89]/10"
                  : "border-[#3FE0D0]/20 text-[#3FE0D0] hover:bg-[#3FE0D0]/10"
              }`}>
              <RefreshCcw className="w-4 h-4" /> Bill All Due
            </button>
          )}
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Subscription
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "MRR",        value: formatCurrency(mrr),                            icon: TrendingUp,   accent: true },
          { label: "Active",     value: String(activeSubs.length),                      icon: CheckCircle2, accent: false },
          { label: "Due This Month", value: String(dueCount),                           icon: Clock,        accent: false },
          { label: "Total Subs", value: String(subs.length),                             icon: RefreshCcw,   accent: false },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl p-4 ${t.card}`}>
            <div className="flex items-center justify-between mb-2">
              <p className={`text-xs font-semibold uppercase tracking-wider ${t.subtext}`}>{s.label}</p>
              <s.icon className={`w-4 h-4 ${s.accent ? "text-[#2F8F89]" : t.muted}`} />
            </div>
            <p className={`text-xl font-bold ${s.accent ? "text-[#2F8F89]" : t.heading}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {(["all", ...SUBSCRIPTION_STATUSES] as const).map((f) => (
          <button key={f} onClick={() => setStatusFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${statusFilter === f ? t.filterActive : t.filterIdle}`}>
            {f === "all" ? "All" : SUBSCRIPTION_STATUS_META[f as SubscriptionStatus].label}
            {f !== "all" && ` (${subs.filter((s) => s.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-[#2F8F89] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className={`rounded-2xl p-16 text-center ${t.card}`}>
          <RefreshCcw className={`w-10 h-10 mx-auto mb-4 ${t.subtext}`} />
          <p className={`text-sm font-semibold mb-5 ${t.heading}`}>No subscriptions yet</p>
          <button onClick={openCreate} className="btn-primary">Add your first subscription</button>
        </div>
      ) : (
        <div className={`rounded-2xl overflow-hidden ${t.card}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${t.tableBorder}`}>
                  {["Client", "Plan", "Amount", "Next Billing", "Status", "This Month", ""].map((h) => (
                    <th key={h} className={`text-left text-xs font-semibold uppercase tracking-wider px-4 py-3 first:pl-6 last:pr-6 ${t.th}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((sub) => {
                  const bm         = currentBillingMonth();
                  const thisPay    = payments.find((p) => p.subscription_id === sub.id && p.billing_month === bm);
                  const isBilling  = billing.has(sub.id);
                  const isEmailing = emailing.has(`${sub.id}-payment_reminder`);
                  const meta       = SUBSCRIPTION_STATUS_META[sub.status];

                  return (
                    <tr key={sub.id} className={`border-b last:border-0 transition-colors ${t.rowBorder} ${t.rowHover}`}>
                      {/* Client */}
                      <td className="px-4 py-4 pl-6">
                        <p className={`text-sm font-semibold ${t.heading}`}>{sub.client_name}</p>
                        <p className={`text-xs ${t.subtext}`}>{sub.client_email}</p>
                      </td>

                      {/* Plan */}
                      <td className="px-4 py-4">
                        <p className={`text-sm font-medium ${t.bodyText}`}>{sub.plan_name}</p>
                        <p className={`text-xs ${t.subtext}`}>Day {sub.billing_day} monthly</p>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-4">
                        <p className={`text-sm font-bold ${t.heading}`}>{formatCurrency(sub.amount)}</p>
                      </td>

                      {/* Next billing */}
                      <td className="px-4 py-4">
                        <p className={`text-sm ${t.bodyText}`}>{sub.next_billing_date}</p>
                      </td>

                      {/* Status badge */}
                      <td className="px-4 py-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isLight ? meta.light : meta.dark}`}>
                          {meta.label}
                        </span>
                      </td>

                      {/* This month payment */}
                      <td className="px-4 py-4">
                        {thisPay ? (
                          <div className="flex items-center gap-1.5">
                            {thisPay.status === "paid" ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                            ) : thisPay.status === "failed" ? (
                              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                            ) : (
                              <Clock className="w-4 h-4 text-blue-400 flex-shrink-0" />
                            )}
                            <div>
                              <p className={`text-xs font-medium ${t.bodyText}`}>
                                {SUBSCRIPTION_PAYMENT_STATUS_META[thisPay.status].label}
                              </p>
                              {thisPay.invoice_no && (
                                <p className={`text-[10px] ${t.subtext}`}>{thisPay.invoice_no}</p>
                              )}
                            </div>
                            {thisPay.status === "pending" && (
                              <button
                                onClick={() => markPaid(thisPay.id, sub.id)}
                                className={`ml-1 text-[10px] font-semibold px-1.5 py-0.5 rounded transition-all ${
                                  isLight ? "text-green-700 hover:bg-green-50" : "text-green-400 hover:bg-green-400/10"
                                }`}
                              >Mark paid</button>
                            )}
                          </div>
                        ) : (
                          <span className={`text-xs ${t.subtext}`}>—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 pr-6">
                        <div className="flex gap-1 items-center">
                          {/* Bill */}
                          {sub.status === "active" && (
                            <button
                              onClick={() => handleBill(sub)}
                              disabled={isBilling}
                              title="Generate invoice for this month"
                              className={`p-1.5 rounded-lg transition-all ${
                                isLight ? "text-black/25 hover:text-[#2F8F89] hover:bg-[#2F8F89]/10" : "text-white/25 hover:text-[#3FE0D0] hover:bg-[#3FE0D0]/10"
                              }`}
                            >
                              {isBilling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ReceiptText className="w-3.5 h-3.5" />}
                            </button>
                          )}

                          {/* Email dropdown */}
                          <EmailMenu
                            sub={sub}
                            onSend={handleEmail}
                            emailing={emailing}
                            isLight={isLight}
                            t={t}
                          />

                          {/* History */}
                          <button
                            onClick={() => openHistory(sub)}
                            title="Payment history"
                            className={`p-1.5 rounded-lg transition-all ${
                              isLight ? "text-black/25 hover:text-black hover:bg-black/[0.05]" : "text-white/25 hover:text-white hover:bg-white/[0.05]"
                            }`}
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button onClick={() => openEdit(sub)}
                            className={`p-1.5 rounded-lg transition-all ${isLight ? "text-black/25 hover:text-black hover:bg-black/[0.05]" : "text-white/25 hover:text-white hover:bg-white/[0.05]"}`}>
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button onClick={() => handleDelete(sub.id)}
                            className={`p-1.5 rounded-lg transition-all ${isLight ? "text-black/25 hover:text-red-600 hover:bg-red-50" : "text-white/25 hover:text-red-400 hover:bg-red-400/5"}`}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Create / Edit modal ──────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto ${t.modal}`}>
            <div className={`flex items-center justify-between p-6 border-b ${t.divider}`}>
              <h3 className={`font-semibold ${t.heading}`}>{edit ? "Edit Subscription" : "New Subscription"}</h3>
              <button onClick={() => setShowModal(false)} className={`transition-colors ${isLight ? "text-black/30 hover:text-black" : "text-white/30 hover:text-white"}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-1 sm:col-span-2">
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${t.label}`}>Client Name *</label>
                  <input required value={form.client_name}
                    onChange={(e) => setForm((f) => ({ ...f, client_name: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${t.input}`} />
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${t.label}`}>Client Email *</label>
                  <input required type="email" value={form.client_email}
                    onChange={(e) => setForm((f) => ({ ...f, client_email: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${t.input}`} />
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${t.label}`}>Plan Name *</label>
                  <input required value={form.plan_name}
                    onChange={(e) => setForm((f) => ({ ...f, plan_name: e.target.value }))}
                    placeholder="e.g. AI Starter, Pro Package"
                    className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${t.input}`} />
                </div>
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${t.label}`}>Monthly Amount (R) *</label>
                  <input required type="number" min={0} step="0.01" value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${t.input}`} />
                </div>
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${t.label}`}>Billing Day (1–28) *</label>
                  <input required type="number" min={1} max={28} value={form.billing_day}
                    onChange={(e) => {
                      const d = Math.min(28, Math.max(1, parseInt(e.target.value) || 1));
                      setForm((f) => ({ ...f, billing_day: d, next_billing_date: nextBillingDate(d) }));
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${t.input}`} />
                </div>
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${t.label}`}>Start Date</label>
                  <input type="date" value={form.start_date}
                    onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${t.input}`} />
                </div>
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${t.label}`}>Status</label>
                  <select value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as SubscriptionStatus }))}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${t.input}`}>
                    {SUBSCRIPTION_STATUSES.map((s) => (
                      <option key={s} value={s}>{SUBSCRIPTION_STATUS_META[s].label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${t.label}`}>Notes</label>
                  <textarea rows={2} value={form.notes ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value || null }))}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 resize-none transition-all ${t.input}`} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm transition-all ${t.cancelBtn}`}>Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 btn-primary disabled:opacity-60">
                  {saving ? "Saving…" : edit ? "Save Changes" : "Add Subscription"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Payment history modal ────────────────────────────────────────────── */}
      {historyFor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto ${t.modal}`}>
            <div className={`flex items-center justify-between p-6 border-b ${t.divider}`}>
              <div>
                <h3 className={`font-semibold ${t.heading}`}>Payment History</h3>
                <p className={`text-xs mt-0.5 ${t.subtext}`}>{historyFor.client_name} · {historyFor.plan_name}</p>
              </div>
              <button onClick={() => setHistoryFor(null)}
                className={`transition-colors ${isLight ? "text-black/30 hover:text-black" : "text-white/30 hover:text-white"}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              {histLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-5 h-5 animate-spin text-[#2F8F89]" />
                </div>
              ) : histPayments.length === 0 ? (
                <p className={`text-center py-10 text-sm ${t.subtext}`}>No payment records yet.</p>
              ) : (
                <div className="space-y-2">
                  {histPayments.map((p) => {
                    const pm = SUBSCRIPTION_PAYMENT_STATUS_META[p.status];
                    return (
                      <div key={p.id} className={`rounded-xl p-4 flex items-center justify-between gap-3 ${
                        isLight ? "bg-black/[0.03]" : "bg-white/[0.03]"
                      }`}>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold ${t.heading}`}>{fmtMonth(p.billing_month)}</p>
                          <p className={`text-xs ${t.subtext}`}>
                            {p.invoice_no ?? "No invoice"}
                            {p.email_sent_at && " · Email sent"}
                            {p.paid_at && ` · Paid ${p.paid_at.slice(0, 10)}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className={`text-sm font-bold ${t.heading}`}>{formatCurrency(p.amount)}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isLight ? pm.light : pm.dark}`}>
                            {pm.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Email dropdown sub-component ────────────────────────────────────────────

type EmailMenuProps = {
  sub: Subscription;
  onSend: (sub: Subscription, type: "payment_received" | "payment_reminder" | "overdue_notice") => void;
  emailing: Set<string>;
  isLight: boolean;
  t: ReturnType<typeof getThemeTokens>;
};

const EMAIL_OPTIONS: { type: "payment_received" | "payment_reminder" | "overdue_notice"; label: string }[] = [
  { type: "payment_received", label: "Payment Received" },
  { type: "payment_reminder", label: "Payment Reminder" },
  { type: "overdue_notice",   label: "Overdue Notice" },
];

function EmailMenu({ sub, onSend, emailing, isLight, t }: EmailMenuProps) {
  const [open, setOpen] = useState(false);
  const anyEmailing = EMAIL_OPTIONS.some((o) => emailing.has(`${sub.id}-${o.type}`));

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={anyEmailing}
        title="Send email"
        className={`p-1.5 rounded-lg transition-all ${
          isLight ? "text-black/25 hover:text-black hover:bg-black/[0.05]" : "text-white/25 hover:text-white hover:bg-white/[0.05]"
        }`}
      >
        {anyEmailing
          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
          : <Mail className="w-3.5 h-3.5" />
        }
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className={`absolute right-0 top-full mt-1 w-44 rounded-xl border shadow-xl z-20 overflow-hidden ${
            isLight ? "bg-white border-black/[0.08]" : "bg-[#111113] border-white/[0.08]"
          }`}>
            {EMAIL_OPTIONS.map((opt) => (
              <button
                key={opt.type}
                onClick={() => { setOpen(false); onSend(sub, opt.type); }}
                className={`w-full text-left px-3 py-2.5 text-xs font-medium transition-colors ${
                  isLight ? "text-black/70 hover:bg-black/[0.05]" : "text-white/60 hover:bg-white/[0.06]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
