"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase";
import { getThemeTokens } from "@/lib/crm-utils";
import { Building2, CreditCard, FileText, Check, AlertCircle, Lock } from "lucide-react";

type CompanySettings = {
  id: string;
  company_name: string | null;
  company_email: string | null;
  company_phone: string | null;
  company_address: string | null;
  company_website: string | null;
  vat_number: string | null;
  reg_number: string | null;
  invoice_prefix: string;
  invoice_counter: number;
  currency: string;
  tax_rate: number;
  payment_terms: number;
  bank_name: string | null;
  bank_account: string | null;
  bank_branch: string | null;
};

const DEFAULTS: Omit<CompanySettings, "id"> = {
  company_name: "", company_email: "", company_phone: "", company_address: "",
  company_website: "", vat_number: "", reg_number: "",
  invoice_prefix: "INV", invoice_counter: 1, currency: "ZAR",
  tax_rate: 15, payment_terms: 30,
  bank_name: "", bank_account: "", bank_branch: "",
};

type SaveState = "idle" | "saving" | "saved" | "error";

export default function SettingsPage() {
  const { theme } = useTheme();
  const [mounted,     setMounted]    = useState(false);
  const [form,        setForm]       = useState<Omit<CompanySettings, "id">>(DEFAULTS);
  const [settingsId,  setSettingsId] = useState<string | null>(null);
  const [loading,     setLoading]    = useState(true);
  const [saveState,   setSaveState]  = useState<SaveState>("idle");
  const [saveErrMsg,  setSaveErrMsg] = useState("");
  const [isAdmin,     setIsAdmin]    = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    async function init() {
      // Resolve current user's role
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        // Match by email — user_id is null until a member links their auth
        // account, but email is always present and uniquely identifies them.
        const { data: member } = await supabase
          .from("team_members")
          .select("role")
          .eq("email", user.email)
          .maybeSingle();
        // No record = portal owner / first-time setup → grant admin
        setIsAdmin(!member || member.role === "admin");
      }
      // Load settings — select only the exact columns we manage
      const { data } = await supabase
        .from("company_settings")
        .select("id,company_name,company_email,company_phone,company_address,company_website,vat_number,reg_number,invoice_prefix,invoice_counter,currency,tax_rate,payment_terms,bank_name,bank_account,bank_branch")
        .limit(1)
        .maybeSingle();
      if (data) {
        const { id, ...rest } = data;
        setSettingsId(id);
        setForm({ ...DEFAULTS, ...rest });
      }
      setLoading(false);
    }
    init();
  }, []);

  function set(key: keyof Omit<CompanySettings, "id">, value: string | number | null) {
    if (!isAdmin) return;
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!isAdmin) return;
    setSaveState("saving");

    // Build payload with only the known columns — never send timestamps
    const payload = {
      company_name:    form.company_name    || null,
      company_email:   form.company_email   || null,
      company_phone:   form.company_phone   || null,
      company_address: form.company_address || null,
      company_website: form.company_website || null,
      vat_number:      form.vat_number      || null,
      reg_number:      form.reg_number      || null,
      invoice_prefix:  form.invoice_prefix  || "INV",
      invoice_counter: form.invoice_counter,
      currency:        form.currency        || "ZAR",
      tax_rate:        form.tax_rate,
      payment_terms:   form.payment_terms,
      bank_name:       form.bank_name       || null,
      bank_account:    form.bank_account    || null,
      bank_branch:     form.bank_branch     || null,
    };

    let error;
    if (settingsId) {
      ({ error } = await supabase
        .from("company_settings")
        .update(payload)
        .eq("id", settingsId));
    } else {
      const { data: inserted, error: insError } = await supabase
        .from("company_settings")
        .insert(payload)
        .select("id")
        .single();
      if (inserted?.id) setSettingsId(inserted.id);
      error = insError;
    }

    if (error) {
      setSaveErrMsg(error.message || "Unknown error");
      setSaveState("error");
    } else {
      setSaveErrMsg("");
      setSaveState("saved");
    }
    setTimeout(() => setSaveState("idle"), 4000);
  }

  const isLight = mounted && theme === "light";
  const t = getThemeTokens(isLight);

  const inputCls = `w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-all ${
    isAdmin
      ? `focus:ring-2 ${t.input}`
      : isLight
        ? "bg-black/[0.02] border border-black/[0.06] text-black/50 cursor-not-allowed"
        : "bg-white/[0.02] border border-white/[0.05] text-white/35 cursor-not-allowed"
  }`;
  const labelCls = `block text-xs font-semibold uppercase tracking-wider mb-1.5 ${t.label}`;
  const accentIcon = isLight ? "text-[#2F8F89]" : "text-[#3FE0D0]";

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className={`text-2xl font-bold ${t.heading}`}>Settings</h1>
        <p className={`text-sm mt-0.5 ${t.subtext}`}>Company configuration and preferences</p>
      </div>

      {/* Admin-only notice for non-admins */}
      {!loading && !isAdmin && (
        <div className={`flex items-start gap-3 px-4 py-3.5 rounded-2xl border ${
          isLight
            ? "bg-amber-50 border-amber-200 text-amber-800"
            : "bg-amber-400/8 border-amber-400/20 text-amber-300"
        }`}>
          <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold">Read-only access</p>
            <p className="text-xs mt-0.5 opacity-75">Only admins can edit company settings. Contact your administrator to make changes.</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-[#2F8F89] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">

          {/* Company Info */}
          <div className={`rounded-2xl p-6 space-y-4 ${t.card}`}>
            <div className="flex items-center gap-2 mb-2">
              <Building2 className={`w-4 h-4 ${accentIcon}`} />
              <h2 className={`font-semibold text-sm ${t.heading}`}>Company Information</h2>
              {!isAdmin && <Lock className={`w-3 h-3 ml-auto ${t.muted}`} />}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-1 sm:col-span-2">
                <label className={labelCls}>Company Name</label>
                <input
                  readOnly={!isAdmin}
                  value={form.company_name ?? ""}
                  onChange={(e) => set("company_name", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input
                  type="email"
                  readOnly={!isAdmin}
                  value={form.company_email ?? ""}
                  onChange={(e) => set("company_email", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input
                  type="tel"
                  readOnly={!isAdmin}
                  value={form.company_phone ?? ""}
                  onChange={(e) => set("company_phone", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Website</label>
                <input
                  type="url"
                  readOnly={!isAdmin}
                  value={form.company_website ?? ""}
                  onChange={(e) => set("company_website", e.target.value)}
                  placeholder="https://"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>VAT Number</label>
                <input
                  readOnly={!isAdmin}
                  value={form.vat_number ?? ""}
                  onChange={(e) => set("vat_number", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Registration Number</label>
                <input
                  readOnly={!isAdmin}
                  value={form.reg_number ?? ""}
                  onChange={(e) => set("reg_number", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="col-span-1 sm:col-span-2">
                <label className={labelCls}>Address</label>
                <textarea
                  rows={2}
                  readOnly={!isAdmin}
                  value={form.company_address ?? ""}
                  onChange={(e) => set("company_address", e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none resize-none transition-all ${
                    isAdmin ? `focus:ring-2 ${t.input}` : inputCls.replace("w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-all", "")
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Invoice & Tax */}
          <div className={`rounded-2xl p-6 space-y-4 ${t.card}`}>
            <div className="flex items-center gap-2 mb-2">
              <FileText className={`w-4 h-4 ${accentIcon}`} />
              <h2 className={`font-semibold text-sm ${t.heading}`}>Invoice &amp; Tax</h2>
              {!isAdmin && <Lock className={`w-3 h-3 ml-auto ${t.muted}`} />}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Invoice Prefix</label>
                <input
                  readOnly={!isAdmin}
                  value={form.invoice_prefix}
                  onChange={(e) => set("invoice_prefix", e.target.value)}
                  placeholder="INV"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Next Invoice Number</label>
                <input
                  type="number"
                  min={1}
                  readOnly={!isAdmin}
                  value={form.invoice_counter}
                  onChange={(e) => set("invoice_counter", parseInt(e.target.value) || 1)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Currency</label>
                <select
                  disabled={!isAdmin}
                  value={form.currency}
                  onChange={(e) => set("currency", e.target.value)}
                  className={inputCls}
                >
                  <option value="ZAR">ZAR — South African Rand</option>
                  <option value="USD">USD — US Dollar</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="GBP">GBP — British Pound</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Default Tax Rate (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  readOnly={!isAdmin}
                  value={form.tax_rate}
                  onChange={(e) => set("tax_rate", parseFloat(e.target.value) || 0)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Payment Terms (days)</label>
                <input
                  type="number"
                  min={0}
                  readOnly={!isAdmin}
                  value={form.payment_terms}
                  onChange={(e) => set("payment_terms", parseInt(e.target.value) || 30)}
                  className={inputCls}
                />
              </div>
            </div>
            <p className={`text-xs mt-1 ${t.muted}`}>
              Invoices will be numbered:{" "}
              <span className="font-mono font-medium">
                {form.invoice_prefix}-{new Date().getFullYear()}-{String(form.invoice_counter).padStart(4, "0")}
              </span>
            </p>
          </div>

          {/* Banking Details */}
          <div className={`rounded-2xl p-6 space-y-4 ${t.card}`}>
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className={`w-4 h-4 ${accentIcon}`} />
              <h2 className={`font-semibold text-sm ${t.heading}`}>Banking Details</h2>
              {!isAdmin && <Lock className={`w-3 h-3 ml-auto ${t.muted}`} />}
            </div>
            <p className={`text-xs -mt-2 mb-3 ${t.muted}`}>These appear on invoices for EFT payment.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Bank Name</label>
                <input
                  readOnly={!isAdmin}
                  value={form.bank_name ?? ""}
                  onChange={(e) => set("bank_name", e.target.value)}
                  placeholder="e.g. FNB"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Account Number</label>
                <input
                  readOnly={!isAdmin}
                  value={form.bank_account ?? ""}
                  onChange={(e) => set("bank_account", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Branch Code</label>
                <input
                  readOnly={!isAdmin}
                  value={form.bank_branch ?? ""}
                  onChange={(e) => set("bank_branch", e.target.value)}
                  placeholder="e.g. 250655"
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* Save button — only rendered for admins */}
          {isAdmin && (
            <div className="space-y-3">
              {saveState === "error" && saveErrMsg && (
                <div className={`flex items-start gap-2 px-4 py-3 rounded-xl border text-sm ${
                  isLight ? "bg-red-50 border-red-200 text-red-700" : "bg-red-400/8 border-red-400/20 text-red-400"
                }`}>
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{saveErrMsg}</span>
                </div>
              )}
              <div className="flex items-center justify-between gap-4">
                {saveState === "saved" && (
                  <div className={`flex items-center gap-2 text-sm ${isLight ? "text-green-700" : "text-green-400"}`}>
                    <Check className="w-4 h-4" /> Settings saved successfully
                  </div>
                )}
                {saveState === "error" && <div />}
                {saveState === "idle"  && <div />}
                {saveState === "saving" && <div className={`text-sm ${t.subtext}`}>Saving…</div>}
                <button
                  type="submit"
                  disabled={saveState === "saving"}
                  className="btn-primary px-8 disabled:opacity-60"
                >
                  {saveState === "saving" ? "Saving…" : "Save Settings"}
                </button>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
}