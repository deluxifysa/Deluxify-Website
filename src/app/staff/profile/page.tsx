"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase";
import { getThemeTokens } from "@/lib/crm-utils";
import {
  User, Lock, Mail, Check, AlertCircle,
  Building2, CreditCard, FileText, ScrollText,
  PlusCircle, Pencil, Trash2, Search, ChevronDown,
} from "lucide-react";

// Sections restricted to admins only
const ADMIN_ONLY_SECTIONS = new Set(["company", "invoice", "banking"]);
import type { User as SupabaseUser } from "@supabase/supabase-js";

type AuditLog = {
  id: string;
  action: "created" | "updated" | "deleted";
  table_name: string;
  record_label: string | null;
  performed_by: string | null;
  details: string | null;
  created_at: string;
};

type SaveState = "idle" | "saving" | "saved" | "error";

type CompanySettings = {
  company_name: string; company_email: string; company_phone: string;
  company_address: string; company_website: string; vat_number: string;
  reg_number: string; invoice_prefix: string; invoice_counter: number;
  currency: string; tax_rate: number; payment_terms: number;
  bank_name: string; bank_account: string; bank_branch: string;
};

const COMPANY_DEFAULTS: CompanySettings = {
  company_name: "", company_email: "", company_phone: "", company_address: "",
  company_website: "", vat_number: "", reg_number: "",
  invoice_prefix: "INV", invoice_counter: 1, currency: "ZAR",
  tax_rate: 15, payment_terms: 30,
  bank_name: "", bank_account: "", bank_branch: "",
};

const SECTIONS = [
  { id: "profile",  label: "Profile",          icon: User       },
  { id: "company",  label: "Company",           icon: Building2  },
  { id: "invoice",  label: "Invoice & Tax",     icon: FileText   },
  { id: "banking",  label: "Banking Details",   icon: CreditCard },
  { id: "security", label: "Security",          icon: Lock       },
  { id: "logs",     label: "Activity Logs",     icon: ScrollText },
];

function SaveFeedback({ state, isLight }: { state: SaveState; isLight: boolean }) {
  if (state === "idle" || state === "saving") return null;
  return state === "saved"
    ? <span className={`flex items-center gap-1.5 text-sm font-medium ${isLight ? "text-green-700" : "text-green-400"}`}><Check className="w-4 h-4" />Saved</span>
    : <span className={`flex items-center gap-1.5 text-sm font-medium ${isLight ? "text-red-600" : "text-red-400"}`}><AlertCircle className="w-4 h-4" />Failed to save</span>;
}

export default function ProfilePage() {
  const { theme } = useTheme();
  const [mounted,       setMounted]       = useState(false);
  const [user,          setUser]          = useState<SupabaseUser | null>(null);
  const [activeSection, setActiveSection] = useState("profile");
  const [isAdmin,       setIsAdmin]       = useState(false);

  // Personal
  const [firstName,     setFirstName]     = useState("");
  const [surname,       setSurname]       = useState("");
  const [profileState,  setProfileState]  = useState<SaveState>("idle");

  // Password
  const [currentPw, setCurrentPw] = useState("");
  const [newPw,     setNewPw]     = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwState,   setPwState]   = useState<SaveState>("idle");
  const [pwError,   setPwError]   = useState("");

  // Company
  const [company,      setCompany]      = useState<CompanySettings>(COMPANY_DEFAULTS);
  const [companyState, setCompanyState] = useState<SaveState>("idle");

  // Logs
  const [logs,        setLogs]        = useState<AuditLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logFilter,   setLogFilter]   = useState<"all" | "created" | "updated" | "deleted">("all");
  const [logSearch,   setLogSearch]   = useState("");
  const [logPage,     setLogPage]     = useState(0);
  const LOG_PAGE_SIZE = 15;


  useEffect(() => setMounted(true), []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
        setFirstName(user.user_metadata?.first_name ?? "");
        setSurname(user.user_metadata?.last_name ?? "");
        // Role check — match by email
        if (user.email) {
          supabase
            .from("team_members")
            .select("role")
            .eq("email", user.email)
            .maybeSingle()
            .then(({ data: member }) => {
              setIsAdmin(!member || member.role === "admin");
            });
        } else {
          setIsAdmin(true);
        }
      }
    });
    supabase.from("company_settings").select("*").limit(1).maybeSingle().then(({ data }) => {
      if (data) { const { id, ...rest } = data; setCompany({ ...COMPANY_DEFAULTS, ...rest }); }
    });
  }, []);

  useEffect(() => {
    if (activeSection === "logs") loadLogs();
  }, [activeSection]);

  async function loadLogs() {
    setLogsLoading(true);
    const { data } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    setLogs(data ?? []);
    setLogsLoading(false);
  }


  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setProfileState("saving");
    const { error } = await supabase.auth.updateUser({
      data: { first_name: firstName, last_name: surname, full_name: `${firstName} ${surname}`.trim() },
    });
    setProfileState(error ? "error" : "saved");
    if (!error) setUser((u) => u ? { ...u, user_metadata: { ...u.user_metadata, first_name: firstName, last_name: surname } } : u);
    setTimeout(() => setProfileState("idle"), 3000);
  }

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    if (newPw.length < 8)   { setPwError("Password must be at least 8 characters."); return; }
    if (newPw !== confirmPw) { setPwError("Passwords do not match."); return; }
    setPwState("saving");
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email: user?.email ?? "", password: currentPw });
    if (signInErr) { setPwError("Current password is incorrect."); setPwState("error"); setTimeout(() => setPwState("idle"), 3000); return; }
    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) { setPwError(error.message); setPwState("error"); }
    else { setPwState("saved"); setCurrentPw(""); setNewPw(""); setConfirmPw(""); }
    setTimeout(() => setPwState("idle"), 3000);
  }

  async function handleCompanySave(e: React.FormEvent) {
    e.preventDefault();
    setCompanyState("saving");
    const { error } = await supabase.from("company_settings").upsert({ ...company }, { onConflict: "id" });
    if (error) await supabase.from("company_settings").insert(company);
    setCompanyState("saved");
    setTimeout(() => setCompanyState("idle"), 3000);
  }

  function setC(key: keyof CompanySettings, value: string | number) {
    setCompany((c) => ({ ...c, [key]: value }));
  }

  const isLight = mounted && theme === "light";
  const t = getThemeTokens(isLight);

  const input       = `w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${t.input}`;
  const label       = `block text-xs font-medium mb-1.5 ${t.subtext}`;
  const readOnly    = `w-full px-3 py-2.5 rounded-xl text-sm ${isLight ? "bg-black/[0.025] border border-black/[0.07] text-black/40" : "bg-white/[0.03] border border-white/[0.06] text-white/30"} cursor-not-allowed`;
  // Used for admin-only fields when the current user is not an admin
  const lockedInput = isAdmin ? input : `w-full px-3 py-2.5 rounded-xl text-sm ${isLight ? "bg-black/[0.02] border border-black/[0.06] text-black/40" : "bg-white/[0.02] border border-white/[0.05] text-white/30"} cursor-not-allowed`;

  if (!user) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-[#2F8F89] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const initials = [firstName[0], surname[0]].filter(Boolean).join("").toUpperCase() || user.email?.[0]?.toUpperCase() || "S";

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 max-w-5xl">

      {/* ── Mobile section selector ──────────────────────────────────── */}
      <div className="lg:hidden">
        <select
          value={activeSection}
          onChange={(e) => setActiveSection(e.target.value)}
          className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${t.input}`}
        >
          {SECTIONS.map((s) => (
            <option key={s.id} value={s.id}>{s.label}{!isAdmin && ADMIN_ONLY_SECTIONS.has(s.id) ? " (Admin only)" : ""}</option>
          ))}
        </select>
      </div>

      {/* ── Left sticky nav ─────────────────────────────────────────── */}
      <aside className="hidden lg:block w-48 flex-shrink-0">
        <div className="sticky top-8 space-y-0.5">
          <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${t.muted}`}>Settings</p>
          {SECTIONS.map((s) => {
            const active = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-left transition-all ${
                  active
                    ? isLight ? "bg-[#2F8F89]/10 text-[#2F8F89] font-medium" : "bg-[#2F8F89]/15 text-[#3FE0D0] font-medium"
                    : isLight ? "text-black/45 hover:text-black hover:bg-black/[0.04]" : "text-white/40 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                <s.icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="flex-1">{s.label}</span>
                {!isAdmin && ADMIN_ONLY_SECTIONS.has(s.id) && (
                  <Lock className={`w-3 h-3 flex-shrink-0 ${t.muted}`} />
                )}
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">

        {/* ── Profile ─────────────────────────────────────────────── */}
        {activeSection === "profile" && (
          <div className={`rounded-2xl overflow-hidden ${t.card}`}>

            {/* Section header */}
            <div className={`px-6 py-4 border-b ${t.divider}`}>
              <p className={`text-sm font-semibold ${t.heading}`}>Profile</p>
              <p className={`text-xs mt-0.5 ${t.subtext}`}>Your personal details shown across the portal</p>
            </div>

            {/* Avatar row */}
            <div className={`px-6 py-5 flex items-center gap-4 border-b ${t.divider}`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0 ${isLight ? "bg-[#2F8F89]/10 text-[#2F8F89]" : "bg-[#2F8F89]/20 text-[#3FE0D0]"}`}>
                {initials}
              </div>
              <div>
                <p className={`text-sm font-semibold ${t.heading}`}>{firstName ? `${firstName}${surname ? ` ${surname}` : ""}` : user.email?.split("@")[0]}</p>
                <p className={`text-xs mt-0.5 ${t.subtext}`}>{user.email}</p>
                <p className={`text-xs mt-0.5 ${t.muted}`}>Member since {new Date(user.created_at).toLocaleDateString("en-ZA", { year: "numeric", month: "long" })}</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleProfileSave} className="px-6 py-5 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={label}>First Name</label>
                  <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane" className={input} />
                </div>
                <div>
                  <label className={label}>Surname</label>
                  <input value={surname} onChange={(e) => setSurname(e.target.value)} placeholder="Smith" className={input} />
                </div>
              </div>
              <div>
                <label className={label}>Email Address</label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${t.muted}`} />
                  <input type="email" value={user.email ?? ""} readOnly className={`${readOnly} pl-9`} />
                </div>
                <p className={`text-xs mt-1.5 ${t.muted}`}>Contact your administrator to change your email.</p>
              </div>
              <div className={`flex items-center justify-between pt-2 border-t ${t.divider}`}>
                <SaveFeedback state={profileState} isLight={isLight} />
                <button type="submit" disabled={profileState === "saving"} className="btn-primary text-sm px-5 disabled:opacity-60 ml-auto">
                  {profileState === "saving" ? "Saving…" : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Company ─────────────────────────────────────────────── */}
        {activeSection === "company" && (
          <div className={`rounded-2xl overflow-hidden ${t.card}`}>
            <div className={`px-6 py-4 border-b ${t.divider}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold ${t.heading}`}>Company</p>
                  <p className={`text-xs mt-0.5 ${t.subtext}`}>Business details that appear on invoices and documents</p>
                </div>
                {!isAdmin && <Lock className={`w-4 h-4 flex-shrink-0 ${t.muted}`} />}
              </div>
            </div>
            {!isAdmin && (
              <div className={`mx-6 mt-4 flex items-start gap-3 px-4 py-3.5 rounded-xl border ${
                isLight ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-amber-400/8 border-amber-400/20 text-amber-300"
              }`}>
                <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold">Admin only</p>
                  <p className="text-xs mt-0.5 opacity-75">Only admins can edit company settings.</p>
                </div>
              </div>
            )}
            <form onSubmit={isAdmin ? handleCompanySave : (e) => e.preventDefault()}>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className={label}>Company Name</label>
                  <input readOnly={!isAdmin} value={company.company_name} onChange={(e) => setC("company_name", e.target.value)} className={lockedInput} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={label}>Business Email</label>
                    <input type="email" readOnly={!isAdmin} value={company.company_email} onChange={(e) => setC("company_email", e.target.value)} className={lockedInput} />
                  </div>
                  <div>
                    <label className={label}>Phone</label>
                    <input type="tel" readOnly={!isAdmin} value={company.company_phone} onChange={(e) => setC("company_phone", e.target.value)} className={lockedInput} />
                  </div>
                  <div>
                    <label className={label}>Website</label>
                    <input type="url" readOnly={!isAdmin} value={company.company_website} onChange={(e) => setC("company_website", e.target.value)} placeholder="https://" className={lockedInput} />
                  </div>
                  <div>
                    <label className={label}>VAT Number</label>
                    <input readOnly={!isAdmin} value={company.vat_number} onChange={(e) => setC("vat_number", e.target.value)} className={lockedInput} />
                  </div>
                  <div>
                    <label className={label}>Registration Number</label>
                    <input readOnly={!isAdmin} value={company.reg_number} onChange={(e) => setC("reg_number", e.target.value)} className={lockedInput} />
                  </div>
                </div>
                <div>
                  <label className={label}>Address</label>
                  <textarea rows={2} readOnly={!isAdmin} value={company.company_address} onChange={(e) => setC("company_address", e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm resize-none transition-all ${isAdmin ? `focus:outline-none focus:ring-2 ${t.input}` : lockedInput}`} />
                </div>
              </div>
              {isAdmin && (
                <div className={`px-6 py-4 border-t flex items-center justify-between ${t.divider}`}>
                  <SaveFeedback state={companyState} isLight={isLight} />
                  <button type="submit" disabled={companyState === "saving"} className="btn-primary text-sm px-5 disabled:opacity-60 ml-auto">
                    {companyState === "saving" ? "Saving…" : "Save Company"}
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* ── Invoice & Tax ────────────────────────────────────────── */}
        {activeSection === "invoice" && (
          <div className={`rounded-2xl overflow-hidden ${t.card}`}>
            <div className={`px-6 py-4 border-b ${t.divider}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold ${t.heading}`}>Invoice &amp; Tax</p>
                  <p className={`text-xs mt-0.5 ${t.subtext}`}>Numbering, currency, and default tax settings</p>
                </div>
                {!isAdmin && <Lock className={`w-4 h-4 flex-shrink-0 ${t.muted}`} />}
              </div>
            </div>
            {!isAdmin && (
              <div className={`mx-6 mt-4 flex items-start gap-3 px-4 py-3.5 rounded-xl border ${
                isLight ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-amber-400/8 border-amber-400/20 text-amber-300"
              }`}>
                <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold">Admin only</p>
                  <p className="text-xs mt-0.5 opacity-75">Only admins can edit invoice and tax settings.</p>
                </div>
              </div>
            )}
            <form onSubmit={isAdmin ? handleCompanySave : (e) => e.preventDefault()}>
              <div className="px-6 py-5 grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={label}>Invoice Prefix</label>
                  <input readOnly={!isAdmin} value={company.invoice_prefix} onChange={(e) => setC("invoice_prefix", e.target.value)} placeholder="INV" className={lockedInput} />
                  <p className={`text-xs mt-1.5 ${t.muted}`}>
                    Preview: <span className="font-mono">{company.invoice_prefix}-{new Date().getFullYear()}-{String(company.invoice_counter).padStart(4, "0")}</span>
                  </p>
                </div>
                <div>
                  <label className={label}>Next Invoice Number</label>
                  <input type="number" min={1} readOnly={!isAdmin} value={company.invoice_counter} onChange={(e) => setC("invoice_counter", parseInt(e.target.value) || 1)} className={lockedInput} />
                </div>
                <div>
                  <label className={label}>Currency</label>
                  <select disabled={!isAdmin} value={company.currency} onChange={(e) => setC("currency", e.target.value)} className={lockedInput}>
                    <option value="ZAR">ZAR — South African Rand</option>
                    <option value="USD">USD — US Dollar</option>
                    <option value="EUR">EUR — Euro</option>
                    <option value="GBP">GBP — British Pound</option>
                  </select>
                </div>
                <div>
                  <label className={label}>Default Tax Rate (%)</label>
                  <input type="number" min={0} max={100} step={0.1} readOnly={!isAdmin} value={company.tax_rate} onChange={(e) => setC("tax_rate", parseFloat(e.target.value) || 0)} className={lockedInput} />
                </div>
                <div>
                  <label className={label}>Payment Terms (days)</label>
                  <input type="number" min={0} readOnly={!isAdmin} value={company.payment_terms} onChange={(e) => setC("payment_terms", parseInt(e.target.value) || 30)} className={lockedInput} />
                  <p className={`text-xs mt-1.5 ${t.muted}`}>Invoices due {company.payment_terms} days after issue</p>
                </div>
              </div>
              {isAdmin && (
                <div className={`px-6 py-4 border-t flex items-center justify-between ${t.divider}`}>
                  <SaveFeedback state={companyState} isLight={isLight} />
                  <button type="submit" disabled={companyState === "saving"} className="btn-primary text-sm px-5 disabled:opacity-60 ml-auto">
                    {companyState === "saving" ? "Saving…" : "Save Invoice Settings"}
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* ── Banking ──────────────────────────────────────────────── */}
        {activeSection === "banking" && (
          <div className={`rounded-2xl overflow-hidden ${t.card}`}>
            <div className={`px-6 py-4 border-b ${t.divider}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold ${t.heading}`}>Banking Details</p>
                  <p className={`text-xs mt-0.5 ${t.subtext}`}>EFT payment details printed on your invoices</p>
                </div>
                {!isAdmin && <Lock className={`w-4 h-4 flex-shrink-0 ${t.muted}`} />}
              </div>
            </div>
            {!isAdmin && (
              <div className={`mx-6 mt-4 flex items-start gap-3 px-4 py-3.5 rounded-xl border ${
                isLight ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-amber-400/8 border-amber-400/20 text-amber-300"
              }`}>
                <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold">Admin only</p>
                  <p className="text-xs mt-0.5 opacity-75">Only admins can edit banking details.</p>
                </div>
              </div>
            )}
            <form onSubmit={isAdmin ? handleCompanySave : (e) => e.preventDefault()}>
              <div className="px-6 py-5 grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={label}>Bank Name</label>
                  <input readOnly={!isAdmin} value={company.bank_name} onChange={(e) => setC("bank_name", e.target.value)} placeholder="e.g. FNB" className={lockedInput} />
                </div>
                <div>
                  <label className={label}>Account Number</label>
                  <input readOnly={!isAdmin} value={company.bank_account} onChange={(e) => setC("bank_account", e.target.value)} className={lockedInput} />
                </div>
                <div>
                  <label className={label}>Branch Code</label>
                  <input readOnly={!isAdmin} value={company.bank_branch} onChange={(e) => setC("bank_branch", e.target.value)} placeholder="e.g. 250655" className={lockedInput} />
                </div>
              </div>
              {isAdmin && (
                <div className={`px-6 py-4 border-t flex items-center justify-between ${t.divider}`}>
                  <SaveFeedback state={companyState} isLight={isLight} />
                  <button type="submit" disabled={companyState === "saving"} className="btn-primary text-sm px-5 disabled:opacity-60 ml-auto">
                    {companyState === "saving" ? "Saving…" : "Save Banking"}
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* ── Security ─────────────────────────────────────────────── */}
        {activeSection === "security" && (
          <div className={`rounded-2xl overflow-hidden ${t.card}`}>
            <div className={`px-6 py-4 border-b ${t.divider}`}>
              <p className={`text-sm font-semibold ${t.heading}`}>Security</p>
              <p className={`text-xs mt-0.5 ${t.subtext}`}>Update your password to keep your account secure</p>
            </div>
            <form onSubmit={handlePasswordSave} className="px-6 py-5 space-y-4">
              <div>
                <label className={label}>Current Password</label>
                <input type="password" required value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="••••••••" className={input} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={label}>New Password</label>
                  <input type="password" required value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Min. 8 characters" className={input} />
                </div>
                <div>
                  <label className={label}>Confirm New Password</label>
                  <input type="password" required value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="••••••••" className={input} />
                </div>
              </div>
              {pwError && (
                <p className={`flex items-center gap-1.5 text-sm ${isLight ? "text-red-600" : "text-red-400"}`}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{pwError}
                </p>
              )}
              <div className={`flex items-center justify-between pt-2 border-t ${t.divider}`}>
                <SaveFeedback state={pwState} isLight={isLight} />
                <button type="submit" disabled={pwState === "saving"} className="btn-primary text-sm px-5 disabled:opacity-60 ml-auto">
                  {pwState === "saving" ? "Updating…" : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Activity Logs ────────────────────────────────────── */}
        {activeSection === "logs" && (() => {
          const ACTION_META = {
            created: { label: "Created", icon: PlusCircle, light: "text-emerald-700 bg-emerald-50 border border-emerald-200", dark: "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20" },
            updated: { label: "Updated", icon: Pencil,     light: "text-blue-700   bg-blue-50   border border-blue-200",    dark: "text-blue-400   bg-blue-400/10   border border-blue-400/20"   },
            deleted: { label: "Deleted", icon: Trash2,     light: "text-red-600    bg-red-50    border border-red-200",     dark: "text-red-400    bg-red-400/10    border border-red-400/20"    },
          };

          const TABLE_LABELS: Record<string, string> = {
            clients: "Clients", invoices: "Invoices", projects: "Projects",
            bookings: "Bookings", team_members: "Team", services: "Services",
            content_posts: "Content", settings: "Settings", audit_logs: "Logs",
          };

          const filtered = logs
            .filter((l) => logFilter === "all" || l.action === logFilter)
            .filter((l) => {
              if (!logSearch) return true;
              const q = logSearch.toLowerCase();
              return (
                l.record_label?.toLowerCase().includes(q) ||
                l.performed_by?.toLowerCase().includes(q) ||
                l.table_name?.toLowerCase().includes(q) ||
                l.details?.toLowerCase().includes(q)
              );
            });

          const paginated = filtered.slice(0, (logPage + 1) * LOG_PAGE_SIZE);
          const hasMore   = filtered.length > paginated.length;

          function formatTimeAgo(dateStr: string) {
            const diff = Date.now() - new Date(dateStr).getTime();
            const mins  = Math.floor(diff / 60000);
            const hours = Math.floor(diff / 3600000);
            const days  = Math.floor(diff / 86400000);
            if (mins < 1)  return "just now";
            if (mins < 60) return `${mins}m ago`;
            if (hours < 24) return `${hours}h ago`;
            if (days < 7)  return `${days}d ago`;
            return new Date(dateStr).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
          }

          return (
            <div className={`rounded-2xl overflow-hidden ${t.card}`}>
              {/* Header */}
              <div className={`px-6 py-4 border-b ${t.divider}`}>
                <p className={`text-sm font-semibold ${t.heading}`}>Activity Logs</p>
                <p className={`text-xs mt-0.5 ${t.subtext}`}>Full audit trail of actions taken across the platform</p>
              </div>

              {/* Toolbar */}
              <div className={`px-6 py-3 flex flex-wrap items-center gap-3 border-b ${t.divider}`}>
                {/* Search */}
                <div className="relative flex-1 min-w-[180px]">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${t.muted}`} />
                  <input
                    value={logSearch}
                    onChange={(e) => { setLogSearch(e.target.value); setLogPage(0); }}
                    placeholder="Search logs…"
                    className={`w-full pl-8 pr-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 transition-all ${t.input}`}
                  />
                </div>
                {/* Filter chips */}
                <div className="flex gap-1.5">
                  {(["all", "created", "updated", "deleted"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => { setLogFilter(f); setLogPage(0); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${
                        logFilter === f ? t.filterActive : t.filterIdle
                      }`}
                    >
                      {f === "all" ? "All" : ACTION_META[f].label}
                    </button>
                  ))}
                </div>
                <button onClick={loadLogs} className={`ml-auto text-xs px-3 py-1.5 rounded-xl transition-all ${t.filterIdle}`}>
                  Refresh
                </button>
              </div>

              {/* Log list */}
              {logsLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="w-5 h-5 border-2 border-[#2F8F89] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-16 text-center">
                  <ScrollText className={`w-8 h-8 mx-auto mb-3 ${t.muted}`} />
                  <p className={`text-sm font-medium ${t.heading}`}>No logs found</p>
                  <p className={`text-xs mt-1 ${t.subtext}`}>Try adjusting your search or filter</p>
                </div>
              ) : (
                <>
                  <div className="divide-y divide-white/[0.04]">
                    {paginated.map((log) => {
                      const am    = ACTION_META[log.action as keyof typeof ACTION_META];
                      const Icon  = am?.icon ?? Pencil;
                      const badge = isLight ? am?.light : am?.dark;
                      return (
                        <div key={log.id} className={`flex items-start gap-4 px-6 py-4 transition-colors ${t.rowHover}`}>
                          {/* Icon */}
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            log.action === "created" ? (isLight ? "bg-emerald-50" : "bg-emerald-500/10")
                            : log.action === "deleted" ? (isLight ? "bg-red-50" : "bg-red-500/10")
                            : (isLight ? "bg-blue-50" : "bg-blue-500/10")
                          }`}>
                            <Icon className={`w-3.5 h-3.5 ${
                              log.action === "created" ? (isLight ? "text-emerald-600" : "text-emerald-400")
                              : log.action === "deleted" ? (isLight ? "text-red-600" : "text-red-400")
                              : (isLight ? "text-blue-600" : "text-blue-400")
                            }`} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${badge}`}>
                                {am?.label}
                              </span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${isLight ? "bg-black/[0.05] text-black/50" : "bg-white/[0.06] text-white/40"}`}>
                                {TABLE_LABELS[log.table_name] ?? log.table_name}
                              </span>
                            </div>
                            <p className={`text-sm font-medium ${t.heading}`}>{log.record_label ?? "—"}</p>
                            {log.details && <p className={`text-xs mt-0.5 ${t.subtext}`}>{log.details}</p>}
                          </div>

                          {/* Right side */}
                          <div className="flex-shrink-0 text-right">
                            <p className={`text-xs font-medium ${t.subtext}`}>{log.performed_by?.split("@")[0] ?? "system"}</p>
                            <p className={`text-xs mt-0.5 ${t.muted}`}>{formatTimeAgo(log.created_at)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Load more */}
                  {hasMore && (
                    <div className={`px-6 py-4 border-t ${t.divider}`}>
                      <button
                        onClick={() => setLogPage((p) => p + 1)}
                        className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm transition-all ${t.filterIdle}`}
                      >
                        <ChevronDown className="w-4 h-4" />
                        Show more ({filtered.length - paginated.length} remaining)
                      </button>
                    </div>
                  )}

                  <div className={`px-6 py-3 border-t ${t.divider}`}>
                    <p className={`text-xs ${t.muted}`}>{filtered.length} log{filtered.length !== 1 ? "s" : ""} · showing {paginated.length}</p>
                  </div>
                </>
              )}
            </div>
          );
        })()}

      </div>
    </div>
  );
}
