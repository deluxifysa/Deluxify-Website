"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase";
import { Plus, Edit2, Trash2, X, Calendar, User, Flag, FileText, AlignLeft, Clock, Tag } from "lucide-react";

type ProjectStatus = "planning" | "in-progress" | "review" | "completed";
type ProjectPriority = "low" | "medium" | "high";

type Project = {
  id: string;
  title: string;
  description: string | null;
  client_name: string | null;
  status: ProjectStatus;
  assigned_to: string | null;
  priority: ProjectPriority;
  due_date: string | null;
  notes: string | null;
  created_at: string;
};

type ProjectForm = Omit<Project, "id" | "created_at">;

const STATUSES: { key: ProjectStatus; label: string; accent: string; dot: string }[] = [
  { key: "planning",    label: "Planning",     accent: "text-blue-500",   dot: "bg-blue-500"   },
  { key: "in-progress", label: "In Progress",  accent: "text-[#2F8F89]",  dot: "bg-[#2F8F89]"  },
  { key: "review",      label: "Review",       accent: "text-yellow-500", dot: "bg-yellow-500" },
  { key: "completed",   label: "Completed",    accent: "text-green-500",  dot: "bg-green-500"  },
];

const PRIORITY_OPTIONS: ProjectPriority[] = ["low", "medium", "high"];

const EMPTY_FORM: ProjectForm = {
  title: "",
  description: "",
  client_name: "",
  status: "planning",
  assigned_to: "",
  priority: "medium",
  due_date: "",
  notes: "",
};

export default function ProjectsPage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Project | null>(null);
  const [form, setForm] = useState<ProjectForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [viewProject, setViewProject] = useState<Project | null>(null);

  // drag state
  const dragId   = useRef<string | null>(null);
  const didDrag  = useRef(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<ProjectStatus | null>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => { loadProjects(); }, []);

  async function loadProjects() {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    setProjects(data ?? []);
    setLoading(false);
  }

  function openCreate(defaultStatus?: ProjectStatus) {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM, status: defaultStatus ?? "planning" });
    setShowModal(true);
  }

  function openEdit(p: Project) {
    setEditTarget(p);
    setForm({
      title: p.title,
      description: p.description ?? "",
      client_name: p.client_name ?? "",
      status: p.status,
      assigned_to: p.assigned_to ?? "",
      priority: p.priority,
      due_date: p.due_date ?? "",
      notes: p.notes ?? "",
    });
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      title: form.title,
      description: form.description || null,
      client_name: form.client_name || null,
      status: form.status,
      assigned_to: form.assigned_to || null,
      priority: form.priority,
      due_date: form.due_date || null,
      notes: form.notes || null,
    };
    if (editTarget) {
      await supabase.from("projects").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", editTarget.id);
    } else {
      await supabase.from("projects").insert(payload);
    }
    await loadProjects();
    setShowModal(false);
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    await supabase.from("projects").delete().eq("id", id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  // ── Drag handlers ──────────────────────────────────────────────
  function onDragStart(e: React.DragEvent, id: string) {
    dragId.current = id;
    didDrag.current = false;
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
  }

  function onDragEnd() {
    didDrag.current = true;
    dragId.current = null;
    setDraggingId(null);
    setOverCol(null);
    // Reset after click event fires so it doesn't suppress the next real click
    setTimeout(() => { didDrag.current = false; }, 50);
  }

  function onDragOver(e: React.DragEvent, col: ProjectStatus) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOverCol(col);
  }

  function onDragLeave() {
    setOverCol(null);
  }

  async function onDrop(e: React.DragEvent, newStatus: ProjectStatus) {
    e.preventDefault();
    const id = dragId.current;
    if (!id) return;
    const project = projects.find((p) => p.id === id);
    if (!project || project.status === newStatus) {
      setOverCol(null);
      return;
    }
    // Optimistic update
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
    setOverCol(null);
    await supabase
      .from("projects")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", id);
  }

  // ── Theme tokens ───────────────────────────────────────────────
  const isLight = mounted && theme === "light";
  const heading  = isLight ? "text-black"       : "text-white";
  const subtext  = isLight ? "text-black/40"    : "text-white/40";
  const colBg    = isLight ? "bg-black/[0.03]"  : "bg-white/[0.03]";
  const colBorder = isLight ? "border-black/[0.07]" : "border-white/[0.06]";
  const card     = isLight
    ? "bg-white border border-black/[0.07] shadow-sm hover:border-black/[0.14]"
    : "bg-[#111113] border border-white/[0.07] hover:border-white/[0.13]";
  const modal    = isLight
    ? "bg-white border border-black/10"
    : "bg-[#111113] border border-white/10";
  const inputCls = isLight
    ? "bg-black/[0.04] border border-black/10 text-black placeholder:text-black/25 focus:ring-[#2F8F89]"
    : "bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:ring-[#2F8F89]";
  const labelCls  = isLight ? "text-black/35" : "text-white/35";
  const cancelBtn = isLight
    ? "bg-black/[0.03] border border-black/[0.08] text-black/50 hover:text-black hover:bg-black/[0.06]"
    : "bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/[0.08]";
  const iconBtn   = isLight
    ? "text-black/25 hover:text-black hover:bg-black/[0.05]"
    : "text-white/30 hover:text-white hover:bg-white/5";
  const deleteBtn = isLight
    ? "text-black/25 hover:text-red-600 hover:bg-red-50"
    : "text-white/30 hover:text-red-400 hover:bg-red-400/5";
  const addBtn    = isLight
    ? "text-black/35 hover:text-black hover:bg-black/[0.05] border border-dashed border-black/15 hover:border-black/30"
    : "text-white/30 hover:text-white hover:bg-white/[0.04] border border-dashed border-white/10 hover:border-white/20";
  const modalDivider = isLight ? "border-black/[0.07]" : "border-white/[0.06]";

  const priorityColor: Record<string, string> = {
    low:    isLight ? "text-black/30"  : "text-white/30",
    medium: "text-yellow-500",
    high:   isLight ? "text-red-600"   : "text-red-400",
  };
  const priorityDot: Record<string, string> = {
    low:    isLight ? "bg-black/20"   : "bg-white/20",
    medium: "bg-yellow-500",
    high:   isLight ? "bg-red-600"    : "bg-red-400",
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-full space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className={`text-2xl font-bold ${heading}`}>Projects</h2>
          <p className={`text-sm mt-0.5 ${subtext}`}>{projects.length} total projects</p>
        </div>
        <button onClick={() => openCreate()} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Board */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-[#2F8F89] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1 items-start">
          {STATUSES.map(({ key, label, accent, dot }) => {
            const colProjects = projects.filter((p) => p.status === key);
            const isOver = overCol === key;
            return (
              <div
                key={key}
                onDragOver={(e) => onDragOver(e, key)}
                onDragLeave={onDragLeave}
                onDrop={(e) => onDrop(e, key)}
                className={`flex flex-col flex-shrink-0 w-72 rounded-2xl border transition-all duration-150 ${colBg} ${colBorder} ${
                  isOver
                    ? "border-[#2F8F89]/50 ring-2 ring-[#2F8F89]/20"
                    : ""
                }`}
              >
                {/* Column header */}
                <div className="flex items-center justify-between px-4 pt-4 pb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
                    <span className={`text-xs font-semibold uppercase tracking-wider ${accent}`}>
                      {label}
                    </span>
                  </div>
                  <span className={`text-xs font-medium tabular-nums ${subtext}`}>
                    {colProjects.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-2.5 px-3 pb-3 min-h-[80px]">
                  {colProjects.map((p) => (
                    <div
                      key={p.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, p.id)}
                      onDragEnd={onDragEnd}
                      onClick={() => { if (!didDrag.current) setViewProject(p); }}
                      className={`rounded-xl p-4 transition-all group cursor-grab active:cursor-grabbing select-none ${card} ${
                        draggingId === p.id ? "opacity-40 scale-95" : "opacity-100 scale-100"
                      }`}
                    >
                      {/* Card title row */}
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <p className={`text-sm font-semibold leading-snug flex-1 ${heading}`}>
                          {p.title}
                        </p>
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <button
                            onClick={(e) => { e.stopPropagation(); openEdit(p); }}
                            className={`p-1.5 rounded-lg transition-all ${iconBtn}`}
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                            className={`p-1.5 rounded-lg transition-all ${deleteBtn}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {p.description && (
                        <p className={`text-xs leading-relaxed mb-2.5 line-clamp-2 ${subtext}`}>
                          {p.description}
                        </p>
                      )}

                      {/* Priority badge */}
                      <div className="flex items-center gap-1.5 mb-2.5">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${priorityDot[p.priority]}`} />
                        <span className={`text-xs font-medium capitalize ${priorityColor[p.priority]}`}>
                          {p.priority === "high" ? "High Priority" : p.priority === "medium" ? "Medium" : "Low"}
                        </span>
                      </div>

                      {/* Meta row */}
                      <div className={`flex flex-col gap-1 text-xs ${subtext}`}>
                        {p.client_name && (
                          <div className="flex items-center gap-1.5">
                            <User className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{p.client_name}</span>
                          </div>
                        )}
                        {p.assigned_to && (
                          <div className="flex items-center gap-1.5">
                            <User className="w-3 h-3 flex-shrink-0 opacity-50" />
                            <span className="truncate opacity-70">{p.assigned_to}</span>
                          </div>
                        )}
                        {p.due_date && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            <span>{p.due_date}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Drop indicator when dragging over empty/any column */}
                  {isOver && draggingId && (
                    <div className="rounded-xl border-2 border-dashed border-[#2F8F89]/40 h-16 flex items-center justify-center">
                      <span className="text-xs text-[#2F8F89]/60">Drop here</span>
                    </div>
                  )}
                </div>

                {/* Add card button */}
                <div className="px-3 pb-3">
                  <button
                    onClick={() => openCreate(key)}
                    className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-all ${addBtn}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Project
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Project Detail Modal ─────────────────────────────────── */}
      {viewProject && (() => {
        const p = viewProject;
        const statusMeta = STATUSES.find(s => s.key === p.status)!;
        const invoiceRef = p.notes?.match(/^invoice:(INV-\S+)/)?.[1] ?? null;
        const displayNotes = invoiceRef ? (p.notes?.replace(/^invoice:\S+\n?/, "") || null) : p.notes;
        const formattedDate = (d: string | null) => d
          ? new Date(d).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })
          : null;

        return (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setViewProject(null)}
          >
            <div
              className={`rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto ${modal}`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={`p-6 border-b ${modalDivider}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold uppercase tracking-widest mb-1.5 ${subtext}`}>
                      Project
                    </p>
                    <h2 className={`text-lg font-bold leading-snug ${heading}`}>{p.title}</h2>
                  </div>
                  <button
                    onClick={() => setViewProject(null)}
                    className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${iconBtn}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Status + Priority badges */}
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                    isLight ? "bg-black/[0.05]" : "bg-white/[0.06]"
                  } ${statusMeta.accent}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                    {statusMeta.label}
                  </span>
                  <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                    isLight ? "bg-black/[0.05]" : "bg-white/[0.06]"
                  } ${priorityColor[p.priority]}`}>
                    <Flag className="w-3 h-3" />
                    {p.priority} priority
                  </span>
                  {invoiceRef && (
                    <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      isLight ? "bg-[#2F8F89]/10 text-[#2F8F89]" : "bg-[#2F8F89]/15 text-[#3FE0D0]"
                    }`}>
                      <FileText className="w-3 h-3" />
                      {invoiceRef}
                    </span>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">

                {/* Meta grid */}
                <div className="grid grid-cols-2 gap-4">
                  {p.client_name && (
                    <div>
                      <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${subtext}`}>Client</p>
                      <div className="flex items-center gap-1.5">
                        <User className={`w-3.5 h-3.5 flex-shrink-0 ${subtext}`} />
                        <p className={`text-sm font-medium ${heading}`}>{p.client_name}</p>
                      </div>
                    </div>
                  )}
                  {p.assigned_to && (
                    <div>
                      <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${subtext}`}>Assigned To</p>
                      <div className="flex items-center gap-1.5">
                        <User className={`w-3.5 h-3.5 flex-shrink-0 ${subtext}`} />
                        <p className={`text-sm font-medium ${heading}`}>{p.assigned_to}</p>
                      </div>
                    </div>
                  )}
                  {p.due_date && (
                    <div>
                      <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${subtext}`}>Due Date</p>
                      <div className="flex items-center gap-1.5">
                        <Calendar className={`w-3.5 h-3.5 flex-shrink-0 ${subtext}`} />
                        <p className={`text-sm font-medium ${heading}`}>{formattedDate(p.due_date)}</p>
                      </div>
                    </div>
                  )}
                  <div>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${subtext}`}>Created</p>
                    <div className="flex items-center gap-1.5">
                      <Clock className={`w-3.5 h-3.5 flex-shrink-0 ${subtext}`} />
                      <p className={`text-sm font-medium ${heading}`}>{formattedDate(p.created_at)}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {p.description && (
                  <div>
                    <div className={`flex items-center gap-2 mb-2 pb-2 border-b ${modalDivider}`}>
                      <AlignLeft className={`w-3.5 h-3.5 ${subtext}`} />
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${subtext}`}>Description</p>
                    </div>
                    <p className={`text-sm leading-relaxed ${isLight ? "text-black/70" : "text-white/70"}`}>
                      {p.description}
                    </p>
                  </div>
                )}

                {/* Notes */}
                {displayNotes && (
                  <div>
                    <div className={`flex items-center gap-2 mb-2 pb-2 border-b ${modalDivider}`}>
                      <Tag className={`w-3.5 h-3.5 ${subtext}`} />
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${subtext}`}>Notes</p>
                    </div>
                    <p className={`text-sm leading-relaxed ${isLight ? "text-black/70" : "text-white/70"}`}>
                      {displayNotes}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer actions */}
              <div className={`flex gap-3 p-6 pt-0`}>
                <button
                  onClick={() => { setViewProject(null); handleDelete(p.id); }}
                  className={`px-4 py-2.5 rounded-xl text-sm transition-all ${
                    isLight ? "text-red-600 hover:bg-red-50 border border-red-200" : "text-red-400 hover:bg-red-400/5 border border-red-400/20"
                  }`}
                >
                  Delete
                </button>
                <button
                  onClick={() => { setViewProject(null); openEdit(p); }}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit Project
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Edit / Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto ${modal}`}>
            <div className={`flex items-center justify-between p-6 border-b ${modalDivider}`}>
              <h3 className={`font-semibold ${heading}`}>
                {editTarget ? "Edit Project" : "New Project"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className={`transition-colors ${isLight ? "text-black/30 hover:text-black" : "text-white/30 hover:text-white"}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {[
                { key: "title",       label: "Title *",    required: true,  type: "text" },
                { key: "client_name", label: "Client Name", required: false, type: "text" },
              ].map(({ key, label, required, type }) => (
                <div key={key}>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${labelCls}`}>{label}</label>
                  <input
                    required={required}
                    type={type}
                    value={(form as any)[key] ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${inputCls}`}
                  />
                </div>
              ))}

              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${labelCls}`}>Description</label>
                <textarea
                  rows={3}
                  value={form.description ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 resize-none transition-all ${inputCls}`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${labelCls}`}>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ProjectStatus }))}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${inputCls}`}
                  >
                    {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${labelCls}`}>Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as ProjectPriority }))}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${inputCls}`}
                  >
                    {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${labelCls}`}>Assigned To</label>
                  <input
                    type="text"
                    value={form.assigned_to ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, assigned_to: e.target.value }))}
                    placeholder="staff@deluxify.ai"
                    className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${inputCls}`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${labelCls}`}>Due Date</label>
                  <input
                    type="date"
                    value={form.due_date ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${inputCls}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${labelCls}`}>Notes</label>
                <textarea
                  rows={2}
                  value={form.notes ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 resize-none transition-all ${inputCls}`}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm transition-all ${cancelBtn}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 btn-primary disabled:opacity-60"
                >
                  {saving ? "Saving…" : editTarget ? "Save Changes" : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}