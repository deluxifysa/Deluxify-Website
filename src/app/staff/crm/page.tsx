"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase";
import { getThemeTokens, formatCurrency, formatDate, getInitials } from "@/lib/crm-utils";
import { PIPELINE_STAGES, STAGE_META, type Client, type PipelineStage } from "@/types/crm";
import { Plus, Search, Edit2, Trash2, X, Building2, Mail, Phone, Globe, Users } from "lucide-react";

const INDUSTRIES = ["Technology", "Finance", "Healthcare", "Retail", "Education", "Manufacturing", "Media", "Consulting", "Other"];
const SOURCES    = ["Website", "Referral", "Social Media", "Cold Outreach", "Event", "Partner"];

const EMPTY: Omit<Client, "id" | "created_at" | "updated_at"> = {
  full_name: "", email: "", phone: "", company: "", website: "", address: "",
  industry: "", pipeline_stage: "lead", source: "", assigned_to: "",
  notes: "", tags: null, last_contacted: null, expected_value: 0,
};

export default function CRMPage() {
  const { theme } = useTheme();
  const [mounted, setMounted]   = useState(false);
  const [clients, setClients]   = useState<Client[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search,  setSearch]    = useState("");
  const [stageF,  setStageF]    = useState("all");
  const [showModal, setShow]    = useState(false);
  const [edit,    setEdit]      = useState<Client | null>(null);
  const [form,    setForm]      = useState({ ...EMPTY, expected_value: 0 });
  const [saving,  setSaving]    = useState(false);
  const [saveErr, setSaveErr]   = useState("");

  useEffect(() => setMounted(true), []);
  useEffect(() => { loadClients(); }, []);

  async function loadClients() {
    const { data } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
    setClients(data ?? []);
    setLoading(false);
  }

  function openCreate() { setEdit(null); setForm({ ...EMPTY, expected_value: 0 }); setSaveErr(""); setShow(true); }
  function openEdit(c: Client) {
    setEdit(c);
    setForm({ ...c, expected_value: (c.expected_value ?? 0) / 100 });
    setSaveErr("");
    setShow(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveErr("");
    const payload = { ...form, expected_value: Math.round((form.expected_value || 0) * 100) };
    const { error } = edit
      ? await supabase.from("clients").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", edit.id)
      : await supabase.from("clients").insert(payload);
    if (error) {
      setSaveErr(error.message);
      setSaving(false);
      return;
    }
    await loadClients();
    setShow(false);
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this client? This cannot be undone.")) return;
    await supabase.from("clients").delete().eq("id", id);
    setClients((p) => p.filter((c) => c.id !== id));
  }

  const isLight = mounted && theme === "light";
  const t = getThemeTokens(isLight);

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    const matchQ = !search || [c.full_name, c.email, c.company, c.industry].some((v) => v?.toLowerCase().includes(q));
    const matchS = stageF === "all" || c.pipeline_stage === stageF;
    return matchQ && matchS;
  });

  const stageCounts = Object.fromEntries(PIPELINE_STAGES.map((s) => [s, clients.filter((c) => c.pipeline_stage === s).length]));

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className={`text-2xl font-bold ${t.heading}`}>Clients</h1>
          <p className={`text-sm mt-0.5 ${t.subtext}`}>{clients.length} total clients</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Client
        </button>
      </div>

      {/* Stage summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {PIPELINE_STAGES.map((s) => {
          const meta = STAGE_META[s];
          return (
            <button
              key={s}
              onClick={() => setStageF(stageF === s ? "all" : s)}
              className={`rounded-2xl p-4 text-left transition-all border ${
                stageF === s
                  ? isLight ? meta.light : meta.dark
                  : t.card
              } ${t.cardHover}`}
            >
              <p className={`text-2xl font-bold ${t.heading}`}>{stageCounts[s] ?? 0}</p>
              <p className={`text-xs mt-0.5 ${t.subtext}`}>{meta.label}</p>
            </button>
          );
        })}
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isLight ? "text-black/25" : "text-white/25"}`} />
          <input
            type="text"
            placeholder="Search clients…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${t.input}`}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setStageF("all")} className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${stageF === "all" ? t.filterActive : t.filterIdle}`}>All</button>
          {PIPELINE_STAGES.map((s) => (
            <button key={s} onClick={() => setStageF(s)} className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all ${stageF === s ? t.filterActive : t.filterIdle}`}>
              {STAGE_META[s].label}
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
        <div className={`rounded-2xl p-16 text-center ${t.card}`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isLight ? "bg-black/[0.04]" : "bg-white/[0.04]"}`}>
            <Users className={`w-5 h-5 ${t.subtext}`} />
          </div>
          <p className={`text-sm font-semibold mb-1 ${t.heading}`}>{search || stageF !== "all" ? "No results found" : "No clients yet"}</p>
          <p className={`text-xs mb-5 ${t.subtext}`}>{search || stageF !== "all" ? "Try adjusting your filters." : "Add your first client to get started."}</p>
          {!search && stageF === "all" && <button onClick={openCreate} className="btn-primary">Add Client</button>}
        </div>
      ) : (
        <div className={`rounded-2xl overflow-hidden ${t.card}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${t.tableBorder}`}>
                  {["Client", "Contact", "Stage", "Industry", "Value", "Last Contact", ""].map((h) => (
                    <th key={h} className={`text-left text-xs font-semibold uppercase tracking-wider px-4 py-3 first:pl-6 last:pr-6 ${t.th}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const stage = STAGE_META[c.pipeline_stage];
                  return (
                    <tr key={c.id} className={`border-b last:border-0 transition-colors ${t.rowBorder} ${t.rowHover}`}>
                      <td className="px-4 py-3.5 pl-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${isLight ? "bg-[#2F8F89]/10 text-[#2F8F89]" : "bg-[#2F8F89]/15 text-[#3FE0D0]"}`}>
                            {getInitials(c.full_name)}
                          </div>
                          <div>
                            <p className={`text-sm font-semibold ${t.heading}`}>{c.full_name}</p>
                            {c.company && <p className={`text-xs ${t.subtext}`}>{c.company}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {c.email && <p className={`text-xs ${t.bodyText}`}>{c.email}</p>}
                        {c.phone && <p className={`text-xs ${t.subtext}`}>{c.phone}</p>}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isLight ? stage.light : stage.dark}`}>
                          {stage.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className={`text-sm ${t.bodyText}`}>{c.industry ?? "—"}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className={`text-sm font-medium ${t.heading}`}>
                          {c.expected_value ? formatCurrency(c.expected_value) : "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className={`text-xs ${t.subtext}`}>{formatDate(c.last_contacted)}</p>
                      </td>
                      <td className="px-4 py-3.5 pr-6">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(c)} className={`p-1.5 rounded-lg transition-all ${isLight ? "text-black/25 hover:text-black hover:bg-black/[0.05]" : "text-white/25 hover:text-white hover:bg-white/[0.05]"}`}>
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(c.id)} className={`p-1.5 rounded-lg transition-all ${isLight ? "text-black/25 hover:text-red-600 hover:bg-red-50" : "text-white/25 hover:text-red-400 hover:bg-red-400/5"}`}>
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto ${t.modal}`}>
            <div className={`flex items-center justify-between p-6 border-b ${t.divider}`}>
              <h3 className={`font-semibold ${t.heading}`}>{edit ? "Edit Client" : "Add Client"}</h3>
              <button onClick={() => setShow(false)} className={`transition-colors ${isLight ? "text-black/30 hover:text-black" : "text-white/30 hover:text-white"}`}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: "full_name", label: "Full Name *", required: true },
                  { key: "company",   label: "Company" },
                  { key: "email",     label: "Email" },
                  { key: "phone",     label: "Phone" },
                  { key: "website",   label: "Website" },
                ].map(({ key, label, required }) => (
                  <div key={key} className={key === "full_name" ? "col-span-1 sm:col-span-2" : ""}>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${t.label}`}>{label}</label>
                    <input
                      required={required}
                      type={key === "email" ? "email" : "text"}
                      value={(form as any)[key] ?? ""}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${t.input}`}
                    />
                  </div>
                ))}
                <div className="col-span-1 sm:col-span-2">
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${t.label}`}>Address</label>
                  <textarea
                    rows={2}
                    value={form.address ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    placeholder="Street, City, Province, Postal Code"
                    className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 resize-none transition-all ${t.input}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${t.label}`}>Stage</label>
                  <select value={form.pipeline_stage} onChange={(e) => setForm((f) => ({ ...f, pipeline_stage: e.target.value as PipelineStage }))}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${t.input}`}>
                    {PIPELINE_STAGES.map((s) => <option key={s} value={s}>{STAGE_META[s].label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${t.label}`}>Industry</label>
                  <select value={form.industry ?? ""} onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${t.input}`}>
                    <option value="">Select…</option>
                    {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${t.label}`}>Source</label>
                  <select value={form.source ?? ""} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${t.input}`}>
                    <option value="">Select…</option>
                    {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${t.label}`}>Expected Value (R)</label>
                  <input type="number" min={0} value={form.expected_value ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, expected_value: parseFloat(e.target.value) || 0 }))}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${t.input}`}
                    placeholder="0" />
                </div>
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${t.label}`}>Assigned To</label>
                  <input type="text" value={form.assigned_to ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, assigned_to: e.target.value }))}
                    placeholder="staff@deluxify.ai"
                    className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${t.input}`} />
                </div>
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${t.label}`}>Last Contacted</label>
                  <input type="date" value={form.last_contacted ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, last_contacted: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${t.input}`} />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${t.label}`}>Notes</label>
                <textarea rows={3} value={form.notes ?? ""} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 resize-none transition-all ${t.input}`} />
              </div>

              {saveErr && (
                <p className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                  {saveErr}
                </p>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShow(false)} className={`flex-1 px-4 py-2.5 rounded-xl text-sm transition-all ${t.cancelBtn}`}>Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 btn-primary disabled:opacity-60">
                  {saving ? "Saving…" : edit ? "Save Changes" : "Add Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
