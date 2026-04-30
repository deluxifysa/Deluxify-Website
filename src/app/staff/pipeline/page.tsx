"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase";
import { getThemeTokens, formatCurrency, getInitials } from "@/lib/crm-utils";
import { PIPELINE_STAGES, STAGE_META, type Client, type PipelineStage } from "@/types/crm";
import { Plus, Building2, TrendingUp, Users, DollarSign, Target } from "lucide-react";

const STAGE_COLOR: Record<PipelineStage, { dot: string; bar: string; cardBorder: string; cardBorderDark: string; dropLight: string; dropDark: string }> = {
  lead:      { dot: "bg-purple-500", bar: "bg-purple-500",  cardBorder: "border-t-purple-400",  cardBorderDark: "border-t-purple-500",  dropLight: "ring-2 ring-purple-300 bg-purple-50/60",  dropDark: "ring-2 ring-purple-500/40 bg-purple-500/5"  },
  contacted: { dot: "bg-blue-500",   bar: "bg-blue-500",    cardBorder: "border-t-blue-400",    cardBorderDark: "border-t-blue-500",    dropLight: "ring-2 ring-blue-300   bg-blue-50/60",    dropDark: "ring-2 ring-blue-500/40   bg-blue-500/5"    },
  proposal:  { dot: "bg-amber-500",  bar: "bg-amber-500",   cardBorder: "border-t-amber-400",   cardBorderDark: "border-t-amber-500",   dropLight: "ring-2 ring-amber-300  bg-amber-50/60",   dropDark: "ring-2 ring-amber-500/40  bg-amber-500/5"   },
  closed:    { dot: "bg-emerald-500",bar: "bg-emerald-500", cardBorder: "border-t-emerald-400", cardBorderDark: "border-t-emerald-500", dropLight: "ring-2 ring-emerald-300 bg-emerald-50/60", dropDark: "ring-2 ring-emerald-500/40 bg-emerald-500/5"},
  churned:   { dot: "bg-red-500",    bar: "bg-red-500",     cardBorder: "border-t-red-400",     cardBorderDark: "border-t-red-500",     dropLight: "ring-2 ring-red-300    bg-red-50/60",     dropDark: "ring-2 ring-red-500/40    bg-red-500/5"     },
};

export default function PipelinePage() {
  const { theme } = useTheme();
  const [mounted,   setMounted]   = useState(false);
  const [clients,   setClients]   = useState<Client[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [dragId,    setDragId]    = useState<string | null>(null);
  const [overStage, setOverStage] = useState<PipelineStage | null>(null);
  const fromStageRef = useRef<PipelineStage | null>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from("clients").select("*").order("expected_value", { ascending: false });
    setClients(data ?? []);
    setLoading(false);
  }

  function onDragStart(e: React.DragEvent, clientId: string, fromStage: PipelineStage) {
    setDragId(clientId);
    fromStageRef.current = fromStage;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("clientId", clientId);
  }

  function onDragEnd() {
    setDragId(null);
    setOverStage(null);
    fromStageRef.current = null;
  }

  function onDragOver(e: React.DragEvent, stage: PipelineStage) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (overStage !== stage) setOverStage(stage);
  }

  async function onDrop(e: React.DragEvent, toStage: PipelineStage) {
    e.preventDefault();
    const clientId = e.dataTransfer.getData("clientId");
    setOverStage(null);
    setDragId(null);
    if (!clientId || fromStageRef.current === toStage) return;
    setClients((prev) => prev.map((c) => c.id === clientId ? { ...c, pipeline_stage: toStage } : c));
    await supabase.from("clients").update({ pipeline_stage: toStage }).eq("id", clientId);
  }

  const isLight = mounted && theme === "light";
  const t = getThemeTokens(isLight);

  const active       = clients.filter((c) => c.pipeline_stage !== "churned");
  const totalValue   = active.reduce((s, c) => s + (c.expected_value ?? 0), 0);
  const closedValue  = clients.filter((c) => c.pipeline_stage === "closed").reduce((s, c) => s + (c.expected_value ?? 0), 0);
  const winRate      = active.length > 0 ? Math.round((clients.filter((c) => c.pipeline_stage === "closed").length / (active.length || 1)) * 100) : 0;

  const topStats = [
    { label: "Pipeline Value",  value: formatCurrency(totalValue),  icon: TrendingUp, color: isLight ? "text-[#2F8F89]"    : "text-[#3FE0D0]" },
    { label: "Closed Revenue",  value: formatCurrency(closedValue), icon: DollarSign, color: isLight ? "text-emerald-600"  : "text-emerald-400" },
    { label: "Active Leads",    value: String(active.length),       icon: Users,      color: isLight ? "text-blue-600"     : "text-blue-400"   },
    { label: "Win Rate",        value: `${winRate}%`,               icon: Target,     color: isLight ? "text-purple-600"   : "text-purple-400" },
  ];

  return (
    <div className="flex flex-col h-full space-y-5">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap flex-shrink-0">
        <div>
          <h1 className={`text-2xl font-bold ${t.heading}`}>Pipeline</h1>
          <p className={`text-sm mt-0.5 ${t.subtext}`}>Drag cards between stages to update deal progress</p>
        </div>
        <a href="/staff/crm" className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Lead
        </a>
      </div>

      {/* ── Stats row ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-shrink-0">
        {topStats.map((s) => (
          <div key={s.label} className={`rounded-2xl px-5 py-4 flex items-center gap-3 ${t.card}`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isLight ? "bg-black/[0.04]" : "bg-white/[0.06]"}`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div>
              <p className={`text-lg font-bold leading-tight ${t.heading}`}>{s.value}</p>
              <p className={`text-xs ${t.subtext}`}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Kanban ──────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center flex-1 h-48">
          <div className="w-6 h-6 border-2 border-[#2F8F89] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex gap-3 flex-1 overflow-x-auto pb-2 select-none min-h-0">
          {PIPELINE_STAGES.map((stage) => {
            const meta   = STAGE_META[stage];
            const col    = STAGE_COLOR[stage];
            const cards  = clients.filter((c) => c.pipeline_stage === stage);
            const colVal = cards.reduce((s, c) => s + (c.expected_value ?? 0), 0);
            const isOver = overStage === stage;

            return (
              <div
                key={stage}
                className="flex flex-col flex-1 min-w-[190px] max-w-[260px]"
                onDragOver={(e) => onDragOver(e, stage)}
                onDragLeave={() => setOverStage(null)}
                onDrop={(e) => onDrop(e, stage)}
              >
                {/* Column header */}
                <div className={`rounded-2xl mb-2 px-3 py-3 flex-shrink-0 ${t.card}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${col.dot}`} />
                    <span className={`text-xs font-bold flex-1 ${t.heading}`}>{meta.label}</span>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-lg ${isLight ? "bg-black/[0.06] text-black/50" : "bg-white/[0.08] text-white/50"}`}>
                      {cards.length}
                    </span>
                  </div>
                  {colVal > 0 && (
                    <p className={`text-xs font-semibold truncate ${isLight ? "text-black/40" : "text-white/30"}`}>
                      {formatCurrency(colVal)}
                    </p>
                  )}
                </div>

                {/* Drop zone */}
                <div
                  className={`flex-1 rounded-2xl p-2 space-y-2 overflow-y-auto transition-all duration-150 ${
                    isOver
                      ? isLight ? col.dropLight : col.dropDark
                      : isLight ? "bg-black/[0.02]" : "bg-white/[0.02]"
                  }`}
                  style={{ minHeight: 80 }}
                >
                  {/* Empty state */}
                  {cards.length === 0 && (
                    <div className={`rounded-xl p-4 text-center border-2 border-dashed transition-colors ${
                      isOver
                        ? isLight ? "border-current opacity-60" : "border-current opacity-40"
                        : isLight ? "border-black/[0.08]" : "border-white/[0.06]"
                    }`}>
                      <p className={`text-xs ${t.muted}`}>Drop here</p>
                    </div>
                  )}

                  {/* Cards */}
                  {cards.map((c) => (
                    <div
                      key={c.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, c.id, stage)}
                      onDragEnd={onDragEnd}
                      className={`rounded-xl border-t-2 cursor-grab active:cursor-grabbing transition-all group ${
                        isLight ? `bg-white shadow-sm border border-black/[0.06] ${col.cardBorder}` : `bg-[#1A1A1D] border border-white/[0.07] ${col.cardBorderDark}`
                      } ${dragId === c.id ? "opacity-30 scale-95 shadow-none" : "hover:shadow-md hover:-translate-y-0.5"}`}
                    >
                      <div className="p-3">
                        {/* Avatar + name */}
                        <div className="flex items-center gap-2 mb-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${isLight ? "bg-[#2F8F89]/10 text-[#2F8F89]" : "bg-[#2F8F89]/20 text-[#3FE0D0]"}`}>
                            {getInitials(c.full_name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={`text-xs font-semibold truncate leading-tight ${t.heading}`}>{c.full_name}</p>
                            {c.company && <p className={`text-[11px] truncate ${t.muted}`}>{c.company}</p>}
                          </div>
                        </div>

                        {/* Meta */}
                        <div className={`space-y-1 text-[11px] ${t.subtext}`}>
                          {c.industry && (
                            <div className="flex items-center gap-1.5">
                              <Building2 className="w-3 h-3 flex-shrink-0 opacity-60" />
                              <span className="truncate">{c.industry}</span>
                            </div>
                          )}
                          {c.assigned_to && (
                            <div className="flex items-center gap-1.5">
                              <span className="opacity-60">→</span>
                              <span className="truncate">{c.assigned_to}</span>
                            </div>
                          )}
                        </div>

                        {/* Value */}
                        {c.expected_value ? (
                          <div className={`mt-2.5 pt-2 border-t ${t.divider}`}>
                            <p className={`text-sm font-bold ${t.heading}`}>{formatCurrency(c.expected_value)}</p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
