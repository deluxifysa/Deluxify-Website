"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase";
import { getThemeTokens, formatCurrency } from "@/lib/crm-utils";
import { type Service, BILLING_TYPES, type BillingType } from "@/types/crm";
import { Plus, Edit2, Trash2, X, Package, ToggleLeft, ToggleRight } from "lucide-react";

const CATEGORIES = ["AI", "Development", "Design", "Consulting", "Support", "Marketing", "Other"];

const BILLING_LABELS: Record<BillingType, string> = {
  "one-time": "One-time",
  "monthly":  "Monthly",
  "annual":   "Annual",
};

const EMPTY: Omit<Service, "id" | "created_at" | "updated_at"> = {
  name: "", description: "", category: "", price: 0, billing_type: "one-time", is_active: true, sort_order: 0,
};

export default function ServicesPage() {
  const { theme } = useTheme();
  const [mounted,   setMounted]  = useState(false);
  const [services,  setServices] = useState<Service[]>([]);
  const [loading,   setLoading]  = useState(true);
  const [showModal, setShow]     = useState(false);
  const [edit,      setEdit]     = useState<Service | null>(null);
  const [form,      setForm]     = useState({ ...EMPTY, price: 0 });
  const [saving,    setSaving]   = useState(false);
  const [catFilter, setCatF]     = useState("all");

  useEffect(() => setMounted(true), []);
  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from("services").select("*").order("sort_order").order("created_at");
    setServices(data ?? []);
    setLoading(false);
  }

  function openCreate() { setEdit(null); setForm({ ...EMPTY, price: 0 }); setShow(true); }
  function openEdit(s: Service) { setEdit(s); setForm({ ...s, price: s.price / 100 }); setShow(true); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, price: Math.round((form.price || 0) * 100) };
    if (edit) await supabase.from("services").update(payload).eq("id", edit.id);
    else       await supabase.from("services").insert(payload);
    await load();
    setShow(false);
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this service?")) return;
    await supabase.from("services").delete().eq("id", id);
    setServices((p) => p.filter((s) => s.id !== id));
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from("services").update({ is_active: !current }).eq("id", id);
    setServices((p) => p.map((s) => s.id === id ? { ...s, is_active: !current } : s));
  }

  const isLight = mounted && theme === "light";
  const t = getThemeTokens(isLight);

  const cats = ["all", ...Array.from(new Set(services.map((s) => s.category).filter((c): c is string => Boolean(c))))];
  const filtered = catFilter === "all" ? services : services.filter((s) => s.category === catFilter);
  const activeCount = services.filter((s) => s.is_active).length;

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className={`text-2xl font-bold ${t.heading}`}>Services</h1>
          <p className={`text-sm mt-0.5 ${t.subtext}`}>{services.length} services · {activeCount} active</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Service
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {cats.map((c) => (
          <button key={c} onClick={() => setCatF(c)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${catFilter === c ? t.filterActive : t.filterIdle}`}>
            {c === "all" ? "All" : c} {c !== "all" && `(${services.filter((s) => s.category === c).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-[#2F8F89] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className={`rounded-2xl p-16 text-center ${t.card}`}>
          <Package className={`w-10 h-10 mx-auto mb-4 ${t.subtext}`} />
          <p className={`text-sm font-semibold mb-5 ${t.heading}`}>No services yet</p>
          <button onClick={openCreate} className="btn-primary">Add your first service</button>
        </div>
      ) : (
        <div className={`rounded-2xl overflow-hidden ${t.card}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${t.tableBorder}`}>
                  {["Service", "Category", "Price", "Billing", "Status", ""].map((h) => (
                    <th key={h} className={`text-left text-xs font-semibold uppercase tracking-wider px-4 py-3 first:pl-6 last:pr-6 ${t.th}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className={`border-b last:border-0 transition-colors ${t.rowBorder} ${t.rowHover}`}>
                    <td className="px-4 py-4 pl-6">
                      <p className={`text-sm font-semibold ${t.heading}`}>{s.name}</p>
                      {s.description && <p className={`text-xs ${t.subtext} line-clamp-1 max-w-xs`}>{s.description}</p>}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        isLight ? "text-black/50 bg-black/[0.05]" : "text-white/40 bg-white/[0.05]"
                      }`}>{s.category ?? "—"}</span>
                    </td>
                    <td className="px-4 py-4">
                      <p className={`text-sm font-bold ${t.heading}`}>{formatCurrency(s.price)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className={`text-xs ${t.bodyText}`}>{BILLING_LABELS[s.billing_type]}</p>
                    </td>
                    <td className="px-4 py-4">
                      <button onClick={() => toggleActive(s.id, s.is_active)} className="flex items-center gap-1.5 transition-colors">
                        {s.is_active
                          ? <ToggleRight className="w-5 h-5 text-[#2F8F89]" />
                          : <ToggleLeft className={`w-5 h-5 ${t.muted}`} />
                        }
                        <span className={`text-xs font-medium ${s.is_active ? "text-[#2F8F89]" : t.subtext}`}>
                          {s.is_active ? "Active" : "Inactive"}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-4 pr-6">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(s)} className={`p-1.5 rounded-lg transition-all ${isLight ? "text-black/25 hover:text-black hover:bg-black/[0.05]" : "text-white/25 hover:text-white hover:bg-white/[0.05]"}`}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(s.id)} className={`p-1.5 rounded-lg transition-all ${isLight ? "text-black/25 hover:text-red-600 hover:bg-red-50" : "text-white/25 hover:text-red-400 hover:bg-red-400/5"}`}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto ${t.modal}`}>
            <div className={`flex items-center justify-between p-6 border-b ${t.divider}`}>
              <h3 className={`font-semibold ${t.heading}`}>{edit ? "Edit Service" : "New Service"}</h3>
              <button onClick={() => setShow(false)} className={`transition-colors ${isLight ? "text-black/30 hover:text-black" : "text-white/30 hover:text-white"}`}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${t.label}`}>Service Name *</label>
                <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${t.input}`} />
              </div>
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${t.label}`}>Description</label>
                <textarea rows={2} value={form.description ?? ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 resize-none transition-all ${t.input}`} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${t.label}`}>Category</label>
                  <select value={form.category ?? ""} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${t.input}`}>
                    <option value="">Select…</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${t.label}`}>Billing Type</label>
                  <select value={form.billing_type} onChange={(e) => setForm((f) => ({ ...f, billing_type: e.target.value as BillingType }))}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${t.input}`}>
                    {BILLING_TYPES.map((b) => <option key={b} value={b}>{BILLING_LABELS[b]}</option>)}
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${t.label}`}>Price (R)</label>
                  <input type="number" min={0} value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${t.input}`} />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                      className="w-4 h-4 rounded accent-[#2F8F89]" />
                    <span className={`text-sm ${t.bodyText}`}>Active</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShow(false)} className={`flex-1 px-4 py-2.5 rounded-xl text-sm transition-all ${t.cancelBtn}`}>Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 btn-primary disabled:opacity-60">{saving ? "Saving…" : edit ? "Save Changes" : "Add Service"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
