"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase";
import { getThemeTokens, getInitials, formatDate } from "@/lib/crm-utils";
import { type TeamMember } from "@/types/crm";
import {
  Plus, X, Shield, Mail, Phone,
  ToggleLeft, ToggleRight, Edit2, Lock,
  Crown, UserCheck, GraduationCap,
} from "lucide-react";

const DEPARTMENTS = ["Development", "Design", "Sales", "Marketing", "Operations", "Consulting"];

// ── Role definitions ──────────────────────────────────────────────────────────
const ROLE_OPTIONS = [
  {
    value:  "admin" as const,
    label:  "Admin",
    Icon:   Crown,
    desc:   "Full access to the entire portal",
    perms:  ["Manage team members & roles", "Edit company settings & billing", "Access all client & invoice data"],
    light:  "text-purple-700 bg-purple-50 border border-purple-200",
    dark:   "text-purple-400 bg-purple-400/10 border border-purple-400/20",
    selLight: "border-purple-400 bg-purple-50/60 ring-2 ring-purple-300/50",
    selDark:  "border-purple-500/60 bg-purple-500/8 ring-2 ring-purple-500/20",
  },
  {
    value:  "staff" as const,
    label:  "Staff",
    Icon:   UserCheck,
    desc:   "Standard access for day-to-day operations",
    perms:  ["Manage clients, projects & bookings", "Create and send invoices", "Cannot edit settings or team"],
    light:  "text-blue-700 bg-blue-50 border border-blue-200",
    dark:   "text-blue-400 bg-blue-400/10 border border-blue-400/20",
    selLight: "border-blue-400 bg-blue-50/60 ring-2 ring-blue-300/50",
    selDark:  "border-blue-500/60 bg-blue-500/8 ring-2 ring-blue-500/20",
  },
  {
    value:  "intern" as const,
    label:  "Intern",
    Icon:   GraduationCap,
    desc:   "Read-only access across the portal",
    perms:  ["View clients, projects & data", "Cannot create or edit any records", "Cannot access settings"],
    light:  "text-gray-600 bg-gray-100 border border-gray-200",
    dark:   "text-white/40 bg-white/5 border border-white/10",
    selLight: "border-gray-400 bg-gray-100 ring-2 ring-gray-300/50",
    selDark:  "border-white/30 bg-white/8 ring-2 ring-white/10",
  },
] as const;

type RoleValue = typeof ROLE_OPTIONS[number]["value"];

const EMPTY: Omit<TeamMember, "id" | "user_id" | "created_at"> = {
  full_name: "", email: "", role: "staff", department: null,
  avatar_url: null, phone: null, is_active: true, joined_at: null,
};

export default function TeamPage() {
  const { theme } = useTheme();
  const [mounted,   setMounted]  = useState(false);
  const [members,   setMembers]  = useState<TeamMember[]>([]);
  const [loading,   setLoading]  = useState(true);
  const [showModal, setShow]     = useState(false);
  const [edit,      setEdit]     = useState<TeamMember | null>(null);
  const [form,      setForm]     = useState({ ...EMPTY });
  const [saving,    setSaving]   = useState(false);
  const [isAdmin,   setIsAdmin]  = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        // Match by email — user_id is only set if the member has explicitly
        // linked their Supabase Auth account; email is always present.
        const { data: member } = await supabase
          .from("team_members")
          .select("role")
          .eq("email", user.email)
          .maybeSingle();
        // No record = portal owner / first-time setup → grant admin
        setIsAdmin(!member || member.role === "admin");
      }
      const { data } = await supabase.from("team_members").select("*").order("full_name");
      setMembers(data ?? []);
      setLoading(false);
    }
    init();
  }, []);

  function openCreate() { setEdit(null); setForm({ ...EMPTY }); setShow(true); }
  function openEdit(m: TeamMember) {
    setEdit(m);
    setForm({
      full_name: m.full_name, email: m.email, role: m.role,
      department: m.department, avatar_url: m.avatar_url,
      phone: m.phone, is_active: m.is_active, joined_at: m.joined_at,
    });
    setShow(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!isAdmin) return;
    setSaving(true);
    if (edit) await supabase.from("team_members").update(form).eq("id", edit.id);
    else      await supabase.from("team_members").insert(form);
    const { data } = await supabase.from("team_members").select("*").order("full_name");
    setMembers(data ?? []);
    setShow(false);
    setSaving(false);
  }

  async function toggleActive(id: string, current: boolean) {
    if (!isAdmin) return;
    await supabase.from("team_members").update({ is_active: !current }).eq("id", id);
    setMembers((p) => p.map((m) => m.id === id ? { ...m, is_active: !current } : m));
  }

  const isLight = mounted && theme === "light";
  const t = getThemeTokens(isLight);
  const activeCount = members.filter((m) => m.is_active).length;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className={`text-2xl font-bold ${t.heading}`}>Team</h1>
          <p className={`text-sm mt-0.5 ${t.subtext}`}>{members.length} members · {activeCount} active</p>
        </div>
        {isAdmin && (
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Member
          </button>
        )}
      </div>

      {/* Read-only notice */}
      {!loading && !isAdmin && (
        <div className={`flex items-start gap-3 px-4 py-3.5 rounded-2xl border ${
          isLight ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-amber-400/8 border-amber-400/20 text-amber-300"
        }`}>
          <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold">Read-only access</p>
            <p className="text-xs mt-0.5 opacity-75">Only admins can add or modify team members.</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-[#2F8F89] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : members.length === 0 ? (
        <div className={`rounded-2xl p-16 text-center ${t.card}`}>
          <Shield className={`w-10 h-10 mx-auto mb-4 ${t.subtext}`} />
          <p className={`text-sm font-semibold mb-5 ${t.heading}`}>No team members yet</p>
          {isAdmin && <button onClick={openCreate} className="btn-primary">Add your first team member</button>}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m) => {
            const ro = ROLE_OPTIONS.find((r) => r.value === m.role) ?? ROLE_OPTIONS[1];
            return (
              <div key={m.id} className={`rounded-2xl p-5 transition-all group ${t.card} ${t.cardHover} ${!m.is_active ? "opacity-60" : ""}`}>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      isLight ? "bg-[#2F8F89]/10 text-[#2F8F89]" : "bg-[#2F8F89]/15 text-[#3FE0D0]"
                    }`}>
                      {getInitials(m.full_name)}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${t.heading}`}>{m.full_name}</p>
                      {/* Role badge with icon */}
                      <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full font-medium capitalize ${
                        isLight ? ro.light : ro.dark
                      }`}>
                        <ro.Icon className="w-2.5 h-2.5" />
                        {ro.label}
                      </span>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(m)}
                        className={`p-1.5 rounded-lg transition-all ${
                          isLight ? "text-black/25 hover:text-black hover:bg-black/[0.05]" : "text-white/25 hover:text-white hover:bg-white/[0.05]"
                        }`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className={`space-y-1.5 text-xs ${t.subtext}`}>
                  {m.email && (
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{m.email}</span>
                    </div>
                  )}
                  {m.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 flex-shrink-0" />
                      <span>{m.phone}</span>
                    </div>
                  )}
                  {m.department && <p className={`mt-2 ${t.muted}`}>{m.department}</p>}
                  {m.joined_at && <p className={t.muted}>Joined {formatDate(m.joined_at)}</p>}
                </div>

                <div className={`flex items-center mt-4 pt-3 border-t ${t.divider}`}>
                  {isAdmin ? (
                    <button onClick={() => toggleActive(m.id, m.is_active)} className="flex items-center gap-1.5 transition-colors">
                      {m.is_active
                        ? <ToggleRight className="w-4 h-4 text-[#2F8F89]" />
                        : <ToggleLeft className={`w-4 h-4 ${t.muted}`} />
                      }
                      <span className={`text-xs ${m.is_active ? "text-[#2F8F89]" : t.subtext}`}>
                        {m.is_active ? "Active" : "Inactive"}
                      </span>
                    </button>
                  ) : (
                    <span className={`text-xs ${m.is_active ? "text-[#2F8F89]" : t.subtext}`}>
                      {m.is_active ? "Active" : "Inactive"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal (admin only) ──────────────────────────────────────────── */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto ${t.modal}`}>
            <div className={`flex items-center justify-between p-6 border-b ${t.divider}`}>
              <h3 className={`font-semibold ${t.heading}`}>{edit ? "Edit Member" : "Add Team Member"}</h3>
              <button onClick={() => setShow(false)} className={`transition-colors ${isLight ? "text-black/30 hover:text-black" : "text-white/30 hover:text-white"}`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              {/* Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${t.label}`}>Full Name *</label>
                  <input required value={form.full_name}
                    onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${t.input}`} />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${t.label}`}>Email *</label>
                  <input required type="email" value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${t.input}`} />
                </div>
              </div>

              {/* Role cards */}
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-3 ${t.label}`}>Role &amp; Permissions</label>
                <div className="space-y-2.5">
                  {ROLE_OPTIONS.map((ro) => {
                    const selected = form.role === ro.value;
                    return (
                      <button
                        key={ro.value}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, role: ro.value }))}
                        className={`w-full text-left rounded-xl border p-4 transition-all ${
                          selected
                            ? isLight ? ro.selLight : ro.selDark
                            : isLight
                              ? "border-black/[0.08] hover:border-black/20 hover:bg-black/[0.02]"
                              : "border-white/[0.07] hover:border-white/20 hover:bg-white/[0.03]"
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          {/* Radio dot */}
                          <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            selected
                              ? "border-[#2F8F89] bg-[#2F8F89]"
                              : isLight ? "border-black/20" : "border-white/20"
                          }`}>
                            {selected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </span>
                          <ro.Icon className={`w-4 h-4 flex-shrink-0 ${
                            selected
                              ? isLight ? ro.light.split(" ")[0] : ro.dark.split(" ")[0]
                              : t.subtext
                          }`} />
                          <span className={`text-sm font-semibold ${t.heading}`}>{ro.label}</span>
                          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${isLight ? ro.light : ro.dark}`}>
                            {ro.value}
                          </span>
                        </div>
                        <p className={`text-xs mb-2 ml-7 ${t.subtext}`}>{ro.desc}</p>
                        <ul className={`text-xs space-y-0.5 ml-7 ${t.muted}`}>
                          {ro.perms.map((p) => (
                            <li key={p} className="flex items-center gap-1.5">
                              <span className={`w-1 h-1 rounded-full flex-shrink-0 ${
                                selected ? "bg-[#2F8F89]" : isLight ? "bg-black/20" : "bg-white/20"
                              }`} />
                              {p}
                            </li>
                          ))}
                        </ul>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Department + Phone + Joined */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${t.label}`}>Department</label>
                  <select value={form.department ?? ""} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value || null }))}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${t.input}`}>
                    <option value="">Select…</option>
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${t.label}`}>Phone</label>
                  <input type="tel" value={form.phone ?? ""} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value || null }))}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${t.input}`} />
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${t.label}`}>Joined Date</label>
                  <input type="date" value={form.joined_at ?? ""} onChange={(e) => setForm((f) => ({ ...f, joined_at: e.target.value || null }))}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${t.input}`} />
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShow(false)}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm transition-all ${t.cancelBtn}`}>Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 btn-primary disabled:opacity-60">
                  {saving ? "Saving…" : edit ? "Save Changes" : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}