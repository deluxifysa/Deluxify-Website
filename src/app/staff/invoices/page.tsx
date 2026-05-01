"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase";
import {
  getThemeTokens, formatCurrency, formatDate,
  generateInvoiceNo, computeInvoiceTotals,
} from "@/lib/crm-utils";
import {
  INVOICE_STATUSES, INVOICE_STATUS_META,
  type Invoice, type InvoiceStatus, type Client, type Service,
} from "@/types/crm";
import {
  Plus, X, FileText, Trash2, Edit2, Download,
  ChevronDown, ChevronLeft,
  CheckCircle2, Clock, AlertCircle,
  User, CreditCard, StickyNote, Building2,
  Info, Pen, Mail, Eye, Package, Search,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type LineItem = {
  description: string;
  quantity: number;
  unit_price: number;    // rands (not cents)
  total: number;
  service_id: string | null; // null = manual entry
};

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

// ─── Load logo as base64 ──────────────────────────────────────────────────────
function loadImageDataUrl(src: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(""); return; }
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve("");
    img.src = src;
  });
}

// ─── PDF generator ────────────────────────────────────────────────────────────
async function downloadInvoicePDF(
  invoice: Invoice,
  lineItems: LineItem[],
  company: CompanySettings
) {
  const { default: jsPDF }     = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W   = doc.internal.pageSize.getWidth();
  const H   = doc.internal.pageSize.getHeight();
  const ML  = 16;
  const MR  = W - 16;
  const CW  = MR - ML;

  type RGB = [number,number,number];
  const DARK:  RGB = [30,  30,  30];
  const GRAY:  RGB = [107, 107, 107];
  const LGRAY: RGB = [212, 212, 212];
  const WHITE: RGB = [255, 255, 255];

  const logoData = await loadImageDataUrl("/logo.png");

  let y = 18;

  // Logo — top right
  if (logoData) {
    doc.addImage(logoData, "PNG", MR - 32, y - 7, 32, 10, undefined, "FAST");
  }

  // "Invoice" heading — top left
  doc.setFont("helvetica", "bold"); doc.setFontSize(26); doc.setTextColor(...DARK);
  doc.text("Invoice", ML, y);
  y += 10;

  // Thin rule
  doc.setDrawColor(...LGRAY); doc.setLineWidth(0.3);
  doc.line(ML, y, MR, y); y += 7;

  // Metadata key-value rows
  const meta: [string, string][] = [
    ["Invoice number", invoice.invoice_no],
    ["Date of issue",  formatDate(invoice.issue_date)],
    ["Due date",       invoice.due_date ? formatDate(invoice.due_date) : "—"],
    ...(company.vat_number ? [["VAT Registration", company.vat_number] as [string, string]] : []),
  ];
  const LBL_W = 44;
  meta.forEach(([label, val]) => {
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...GRAY);
    doc.text(label, ML, y);
    doc.setFont("helvetica", "bold"); doc.setTextColor(...DARK);
    doc.text(val, ML + LBL_W, y);
    y += 5;
  });
  y += 6;

  // From / Bill To — two columns
  const COL2 = ML + CW / 2 + 4;

  // Company name
  doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...DARK);
  doc.text(company.company_name ?? "", ML, y);
  // "Bill to" label
  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...GRAY);
  doc.text("Bill to", COL2, y);
  y += 5.5;

  // From details
  let fromY = y;
  const fromLines = [
    ...(company.company_address?.split(/[\n,]/).map(s => s.trim()).filter(Boolean) ?? []),
    company.company_email,
    company.company_phone,
    company.company_website,
  ].filter(Boolean) as string[];
  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...GRAY);
  fromLines.forEach(l => { doc.text(l, ML, fromY); fromY += 4.5; });

  // Bill To details
  let toY = y;
  doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...DARK);
  doc.text(invoice.client_name || "—", COL2, toY); toY += 5.5;
  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...GRAY);
  const toLines = [
    ...((invoice as any).client_address?.split(/\n/).map((s: string) => s.trim()).filter(Boolean) ?? []),
    (invoice as any).client_phone as string | undefined,
    invoice.client_email,
  ].filter(Boolean) as string[];
  toLines.forEach(l => { doc.text(l, COL2, toY); toY += 4.5; });

  y = Math.max(fromY, toY) + 10;

  // Large amount-due heading
  doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.setTextColor(...DARK);
  doc.text(
    `${formatCurrency(invoice.total)} ${invoice.currency} due ${invoice.due_date ? formatDate(invoice.due_date) : "—"}`,
    ML, y
  );
  y += 10;

  // Thin rule
  doc.setDrawColor(...LGRAY); doc.setLineWidth(0.3);
  doc.line(ML, y, MR, y); y += 7;

  // Notes
  if (invoice.notes) {
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...GRAY);
    const nl = doc.splitTextToSize(invoice.notes, CW);
    doc.text(nl, ML, y); y += nl.length * 4.5 + 6;
  }

  // Banking — plain text list
  if (company.bank_name || company.bank_account) {
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...GRAY);
    doc.text("Payment Details", ML, y); y += 5;
    doc.setFont("helvetica", "normal");
    if (company.bank_name)    { doc.text(`Bank: ${company.bank_name}`,          ML, y); y += 4.5; }
    if (company.bank_account) { doc.text(`Account No: ${company.bank_account}`, ML, y); y += 4.5; }
    if (company.bank_branch)  { doc.text(`Branch Code: ${company.bank_branch}`, ML, y); y += 4.5; }
    doc.text(`Reference: ${invoice.invoice_no}`, ML, y); y += 8;
  }

  // Line items table — plain, horizontal rules only
  autoTable(doc, {
    startY: y,
    head: [["Description", "Qty", "Unit Price", "Tax", "Amount"]],
    body: lineItems.map(it => [
      it.description || "—",
      Number.isInteger(it.quantity) ? String(it.quantity) : it.quantity.toFixed(2),
      formatCurrency(Math.round(it.unit_price * 100)),
      `${invoice.tax_rate}%`,
      formatCurrency(Math.round(it.quantity * it.unit_price * 100)),
    ]),
    theme: "plain",
    headStyles: {
      textColor: GRAY, fontStyle: "normal", fontSize: 8,
      cellPadding: { top: 3, bottom: 6, left: 0, right: 0 },
    },
    bodyStyles: {
      fontSize: 9, textColor: DARK,
      cellPadding: { top: 5, bottom: 5, left: 0, right: 0 },
    },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { cellWidth: 14, halign: "right" },
      2: { cellWidth: 30, halign: "right" },
      3: { cellWidth: 14, halign: "right", textColor: GRAY },
      4: { cellWidth: 30, halign: "right" },
    },
    margin: { left: ML, right: W - MR },
    didDrawCell: (data: any) => {
      if (data.column.index !== data.table.columns.length - 1) return;
      doc.setDrawColor(...LGRAY); doc.setLineWidth(0.25);
      doc.line(ML, data.cell.y + data.cell.height, MR, data.cell.y + data.cell.height);
    },
  });

  y = (doc as any).lastAutoTable.finalY + 6;

  // Thin rule above totals
  doc.setDrawColor(...LGRAY); doc.setLineWidth(0.3);
  doc.line(ML, y, MR, y); y += 6;

  // Totals — right-aligned with thin dividers
  const totW  = 120;
  const totLX = MR - totW;
  const totRows: [string, string][] = [
    ["Subtotal",            formatCurrency(invoice.subtotal)],
    ["Total excluding tax", formatCurrency(invoice.subtotal)],
    [`VAT (${invoice.tax_rate}% on ${formatCurrency(invoice.subtotal)})`, formatCurrency(invoice.tax_amount)],
    ["Total",               formatCurrency(invoice.total)],
  ];
  totRows.forEach(([label, val]) => {
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...GRAY);
    doc.text(label, totLX, y);
    doc.setTextColor(...DARK); doc.text(val, MR, y, { align: "right" });
    y += 4;
    doc.setDrawColor(...LGRAY); doc.setLineWidth(0.2);
    doc.line(totLX, y, MR, y); y += 4;
  });

  y += 2;
  doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...DARK);
  doc.text("Amount due", totLX, y);
  doc.text(`${formatCurrency(invoice.total)} ${invoice.currency}`, MR, y, { align: "right" });

  // Footer — thin rule + page number
  doc.setDrawColor(...LGRAY); doc.setLineWidth(0.3);
  doc.line(ML, H - 14, MR, H - 14);
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(...LGRAY);
    doc.text(`Page ${p} of ${totalPages}`, MR, H - 8, { align: "right" });
  }

  doc.save(`${invoice.invoice_no}.pdf`);
}

// ─── Service combobox ─────────────────────────────────────────────────────────
function ServiceCombobox({
  description, serviceId, services, onSelect, isLight, t,
}: {
  description: string;
  serviceId: string | null;
  services: Service[];
  onSelect: (patch: Partial<LineItem>) => void;
  isLight: boolean;
  t: ReturnType<typeof getThemeTokens>;
}) {
  const [query, setQuery]   = useState(description);
  const [open,  setOpen]    = useState(false);

  // Keep query in sync when parent resets the form
  useEffect(() => { setQuery(description); }, [description]);

  const filtered = services.filter(s =>
    !query ||
    s.name.toLowerCase().includes(query.toLowerCase()) ||
    (s.category ?? "").toLowerCase().includes(query.toLowerCase())
  );

  function selectService(s: Service) {
    const price = s.price / 100; // cents → rands
    onSelect({ description: s.name, unit_price: price, service_id: s.id });
    setQuery(s.name);
    setOpen(false);
  }

  function handleManualChange(val: string) {
    setQuery(val);
    onSelect({ description: val, service_id: null });
    setOpen(true);
  }

  return (
    <div className="relative">
      {/* Input row */}
      <div className="relative">
        <Search className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none ${
          isLight ? "text-black/25" : "text-white/25"
        }`} />
        <input
          type="text"
          value={query}
          onChange={e => handleManualChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 180)}
          placeholder="Search service or type custom…"
          className={`w-full pl-7 pr-7 py-2 rounded-lg text-xs focus:outline-none focus:ring-2 transition-all ${t.input}`}
        />
        {/* Lock badge — service selected */}
        {serviceId && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2" title="Price auto-filled from Services">
            <Package className={`w-3 h-3 ${isLight ? "text-[#2F8F89]" : "text-[#3FE0D0]"}`} />
          </span>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className={`absolute left-0 right-0 top-full mt-1 z-50 rounded-xl border overflow-hidden shadow-2xl max-h-52 overflow-y-auto ${
          isLight ? "bg-white border-black/10" : "bg-[#18181c] border-white/10"
        }`}>

          {/* Services list */}
          {filtered.length > 0 ? (
            <>
              <div className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest border-b ${
                isLight ? "text-black/25 border-black/[0.06]" : "text-white/20 border-white/[0.06]"
              }`}>
                Services
              </div>
              {filtered.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onMouseDown={e => { e.preventDefault(); selectService(s); }}
                  className={`w-full text-left px-3 py-2.5 flex items-center justify-between gap-3 text-xs transition-colors ${
                    isLight ? "hover:bg-[#2F8F89]/[0.07] text-black/80" : "hover:bg-[#2F8F89]/[0.12] text-white/80"
                  }`}
                >
                  <div className="min-w-0">
                    <p className={`font-medium truncate ${isLight ? "text-black" : "text-white"}`}>{s.name}</p>
                    {s.category && (
                      <p className={`text-[10px] truncate ${isLight ? "text-black/35" : "text-white/30"}`}>{s.category}</p>
                    )}
                  </div>
                  <span className={`flex-shrink-0 font-semibold font-mono ${isLight ? "text-[#2F8F89]" : "text-[#3FE0D0]"}`}>
                    {formatCurrency(s.price)}
                  </span>
                </button>
              ))}
            </>
          ) : (
            <div className={`px-3 py-3 text-xs text-center ${isLight ? "text-black/30" : "text-white/25"}`}>
              No matching services
            </div>
          )}

          {/* Custom entry hint */}
          {query && (
            <>
              <div className={`border-t ${isLight ? "border-black/[0.06]" : "border-white/[0.06]"}`} />
              <div className={`px-3 py-2 text-[10px] flex items-center gap-1.5 ${isLight ? "text-black/35" : "text-white/25"}`}>
                <Plus className="w-3 h-3 flex-shrink-0" />
                <span>Custom: <span className={`font-medium ${isLight ? "text-black/60" : "text-white/50"}`}>&ldquo;{query}&rdquo;</span> — enter price manually</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Accordion section ────────────────────────────────────────────────────────
function AccordionSection({
  title, subtitle, icon: Icon, isOpen, onToggle, children, isLight, t,
}: {
  id: string; title: string; subtitle?: string;
  icon: React.ElementType; isOpen: boolean; onToggle: () => void;
  children: React.ReactNode; isLight: boolean;
  t: ReturnType<typeof getThemeTokens>;
}) {
  return (
    <div className={`border-b ${t.divider}`}>
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors ${
          isLight ? "hover:bg-black/[0.015]" : "hover:bg-white/[0.02]"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
            isOpen
              ? isLight ? "bg-[#2F8F89]/10 text-[#2F8F89]" : "bg-[#2F8F89]/15 text-[#3FE0D0]"
              : isLight ? "bg-black/[0.04] text-black/30"   : "bg-white/[0.04] text-white/25"
          }`}>
            <Icon className="w-3 h-3" />
          </div>
          <div>
            <p className={`text-sm font-medium leading-tight ${t.heading}`}>{title}</p>
            {subtitle && !isOpen && <p className={`text-xs mt-0.5 truncate max-w-[180px] ${t.muted}`}>{subtitle}</p>}
          </div>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-all duration-200 ${
          isOpen
            ? isLight ? "rotate-180 text-[#2F8F89]" : "rotate-180 text-[#3FE0D0]"
            : t.muted
        }`} />
      </button>
      <div className={`overflow-hidden transition-all duration-200 ${isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-5 pb-4 pt-0.5 space-y-3">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Live invoice preview ─────────────────────────────────────────────────────
function InvoicePreview({
  invoiceNo, issueDate, dueDate, clientName, clientEmail, clientPhone, clientAddress,
  items, taxRate, notes, company, project,
}: {
  invoiceNo: string; issueDate: string; dueDate: string;
  clientName: string; clientEmail: string; clientPhone: string; clientAddress: string;
  items: LineItem[]; taxRate: number; notes: string;
  company: CompanySettings | null; project: string;
}) {
  const liveItems = items.map(it => ({
    quantity: it.quantity,
    unit_price: Math.round(it.unit_price * 100),
  }));
  const { subtotal, tax_amount, total } = computeInvoiceTotals(liveItems, taxRate);

  const DARK  = "#1E1E1E";
  const GRAY  = "#6B6B6B";
  const LGRAY = "#D4D4D4";

  const fromLines = [
    ...(company?.company_address?.split(/[\n,]/).map(s => s.trim()).filter(Boolean) ?? []),
    company?.company_email,
    company?.company_phone,
    company?.company_website,
  ].filter(Boolean) as string[];

  const toLines = [
    ...(clientAddress ? clientAddress.split(/\n/).map(s => s.trim()).filter(Boolean) : []),
    clientPhone || null,
    clientEmail || null,
  ].filter(Boolean) as string[];

  const meta = [
    { label: "Invoice number",  value: invoiceNo || "DRAFT" },
    { label: "Date of issue",   value: issueDate },
    { label: "Due date",        value: dueDate || "—" },
    ...(company?.vat_number ? [{ label: "VAT Registration", value: company.vat_number }] : []),
  ];

  const totRows = [
    { label: "Subtotal",            value: formatCurrency(subtotal) },
    { label: "Total excluding tax", value: formatCurrency(subtotal) },
    { label: `VAT (${taxRate}% on ${formatCurrency(subtotal)})`, value: formatCurrency(tax_amount) },
    { label: "Total",               value: formatCurrency(total) },
  ];

  return (
    <div style={{
      background: "white",
      fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
      color: DARK,
      padding: "44px 52px",
      minWidth: 520,
      borderRadius: 8,
      boxShadow: "0 4px 32px rgba(0,0,0,0.10)",
    }}>

      {/* ── Header: "Invoice" + logo ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <h1 style={{ fontSize: 30, fontWeight: 700, margin: 0, letterSpacing: -0.5, color: DARK }}>Invoice</h1>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="logo" style={{ height: 26, display: "block", marginTop: 4 }} />
      </div>

      {/* ── Thin rule ── */}
      <div style={{ height: 1, background: LGRAY, marginBottom: 18 }} />

      {/* ── Metadata ── */}
      <div style={{ marginBottom: 24 }}>
        {meta.map(({ label, value }) => (
          <div key={label} style={{ display: "flex", marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: GRAY, width: 140, flexShrink: 0 }}>{label}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: DARK }}>{value}</span>
          </div>
        ))}
      </div>

      {/* ── From / Bill To ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 28 }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: 12, margin: "0 0 6px 0", color: DARK }}>
            {company?.company_name ?? "Your Company"}
          </p>
          {fromLines.map((l, i) => (
            <p key={i} style={{ fontSize: 11, color: GRAY, margin: "2px 0", lineHeight: 1.5 }}>{l}</p>
          ))}
        </div>
        <div>
          <p style={{ fontSize: 11, color: GRAY, margin: "0 0 6px 0" }}>Bill to</p>
          <p style={{ fontWeight: 700, fontSize: 12, margin: "0 0 5px 0", color: DARK }}>
            {clientName || "Client Name"}
          </p>
          {toLines.map((l, i) => (
            <p key={i} style={{ fontSize: 11, color: GRAY, margin: "2px 0", lineHeight: 1.5 }}>{l}</p>
          ))}
        </div>
      </div>

      {/* ── Large amount-due heading ── */}
      <p style={{ fontSize: 20, fontWeight: 700, margin: "0 0 18px 0", color: DARK }}>
        {formatCurrency(total)} {company?.currency ?? "ZAR"}{dueDate ? ` due ${dueDate}` : ""}
      </p>

      {/* ── Thin rule ── */}
      <div style={{ height: 1, background: LGRAY, marginBottom: 18 }} />

      {/* ── Notes ── */}
      {notes && (
        <p style={{ fontSize: 11, color: GRAY, margin: "0 0 18px 0", lineHeight: 1.7 }}>{notes}</p>
      )}

      {/* ── Banking — plain text ── */}
      {(company?.bank_name || company?.bank_account) && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: GRAY, margin: "0 0 5px 0" }}>Payment Details</p>
          {company?.bank_name    && <p style={{ fontSize: 11, color: GRAY, margin: "2px 0" }}>Bank: {company.bank_name}</p>}
          {company?.bank_account && <p style={{ fontSize: 11, color: GRAY, margin: "2px 0" }}>Account No: {company.bank_account}</p>}
          {company?.bank_branch  && <p style={{ fontSize: 11, color: GRAY, margin: "2px 0" }}>Branch Code: {company.bank_branch}</p>}
          <p style={{ fontSize: 11, color: GRAY, margin: "2px 0" }}>Reference: {invoiceNo || "—"}</p>
        </div>
      )}

      {/* ── Line items table ── */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${LGRAY}` }}>
            <th style={{ textAlign: "left",   padding: "6px 0 10px",      fontSize: 11, fontWeight: 400, color: GRAY }}>Description</th>
            <th style={{ textAlign: "right",  padding: "6px 8px 10px",    fontSize: 11, fontWeight: 400, color: GRAY, width: 44 }}>Qty</th>
            <th style={{ textAlign: "right",  padding: "6px 8px 10px",    fontSize: 11, fontWeight: 400, color: GRAY, width: 100 }}>Unit price</th>
            <th style={{ textAlign: "right",  padding: "6px 8px 10px",    fontSize: 11, fontWeight: 400, color: GRAY, width: 52 }}>Tax</th>
            <th style={{ textAlign: "right",  padding: "6px 0 10px 8px",  fontSize: 11, fontWeight: 400, color: GRAY, width: 100 }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${LGRAY}` }}>
              <td style={{ padding: "12px 0", fontSize: 12, color: DARK, verticalAlign: "top" }}>
                <div>{item.description || <span style={{ color: LGRAY }}>—</span>}</div>
                {project && i === 0 && (
                  <div style={{ fontSize: 10, color: GRAY, marginTop: 2 }}>{project}</div>
                )}
              </td>
              <td style={{ padding: "12px 8px", fontSize: 12, color: DARK, textAlign: "right", verticalAlign: "top" }}>
                {Number.isInteger(item.quantity) ? item.quantity : item.quantity.toFixed(2)}
              </td>
              <td style={{ padding: "12px 8px", fontSize: 12, color: DARK, textAlign: "right", verticalAlign: "top" }}>
                {item.unit_price > 0 ? formatCurrency(Math.round(item.unit_price * 100)) : "—"}
              </td>
              <td style={{ padding: "12px 8px", fontSize: 12, color: GRAY, textAlign: "right", verticalAlign: "top" }}>
                {taxRate}%
              </td>
              <td style={{ padding: "12px 0 12px 8px", fontSize: 12, color: DARK, textAlign: "right", verticalAlign: "top" }}>
                {item.unit_price > 0 ? formatCurrency(Math.round(item.quantity * item.unit_price * 100)) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── Thin rule above totals ── */}
      <div style={{ height: 1, background: LGRAY, margin: "0 0 16px 0" }} />

      {/* ── Totals — right-aligned with thin dividers ── */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div style={{ width: 340 }}>
          {totRows.map(({ label, value }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${LGRAY}` }}>
              <span style={{ fontSize: 11, color: GRAY }}>{label}</span>
              <span style={{ fontSize: 11, color: DARK }}>{value}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 0" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: DARK }}>Amount due</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: DARK }}>
              {formatCurrency(total)} {company?.currency ?? "ZAR"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ height: 1, background: LGRAY, margin: "32px 0 12px" }} />
      <p style={{ fontSize: 9, color: LGRAY, textAlign: "right", margin: 0 }}>Page 1 of 1</p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function InvoicesPage() {
  const { theme } = useTheme();
  const [mounted,      setMounted]      = useState(false);
  const [invoices,     setInvoices]     = useState<Invoice[]>([]);
  const [clients,      setClients]      = useState<Client[]>([]);
  const [services,     setServices]     = useState<Service[]>([]);
  const [company,      setCompany]      = useState<CompanySettings | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [view,         setView]         = useState<"list"|"editor">("list");
  const [edit,         setEdit]         = useState<Invoice | null>(null);
  const [statusF,      setStatusF]      = useState("all");
  const [saving,       setSaving]       = useState(false);
  const [saveError,    setSaveError]    = useState("");
  const [updating,     setUpdating]     = useState<string | null>(null);
  const [downloading,   setDownloading]   = useState<string | null>(null);
  const [loadingItems,  setLoadingItems]  = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [previewTab,    setPreviewTab]    = useState<"preview"|"pdf"|"email"|"payment">("preview");

  // Hidden print state — used to render an off-screen preview then capture it
  const [printInv,   setPrintInv]   = useState<Invoice | null>(null);
  const [printItems, setPrintItems] = useState<LineItem[]>([]);
  const printRef = useRef<HTMLDivElement>(null);

  // Accordion — "client" + "details" open by default
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(["client","details"])
  );

  // Form
  const [fClientId,      setFClientId]      = useState("");
  const [fClientName,    setFClientName]    = useState("");
  const [fClientEmail,   setFClientEmail]   = useState("");
  const [fClientPhone,   setFClientPhone]   = useState("");
  const [fClientAddress, setFClientAddress] = useState("");
  const [fProject,       setFProject]       = useState("");
  const [fDue,           setFDue]           = useState("");
  const [fNotes,         setFNotes]         = useState("");
  const [fTax,           setFTax]           = useState(15);
  const [items,          setItems]          = useState<LineItem[]>([
    { description:"", quantity:1, unit_price:0, total:0, service_id:null },
  ]);

  useEffect(() => setMounted(true), []);
  useEffect(() => { loadAll(); }, []);

  const loadAll = useCallback(async () => {
    const [{ data: inv }, { data: cli }, { data: svc }, { data: co }] = await Promise.all([
      supabase.from("invoices").select("*").order("created_at", { ascending: false }),
      supabase.from("clients").select("*").order("full_name"),
      supabase.from("services").select("*").eq("is_active", true).order("sort_order").order("name"),
      supabase.from("company_settings").select("*").limit(1).maybeSingle(),
    ]);
    setInvoices(inv ?? []);
    setClients(cli ?? []);
    setServices(svc ?? []);
    setCompany(co ?? null);
    setLoading(false);
  }, []);

  function toggleSection(id: string) {
    setOpenSections(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function updateItem(i: number, patch: Partial<LineItem>) {
    setItems(prev => {
      const next = [...prev];
      next[i] = { ...next[i], ...patch };
      next[i].total = Math.round(next[i].quantity * next[i].unit_price);
      return next;
    });
  }
  function addLine()            { setItems(p => [...p, { description:"", quantity:1, unit_price:0, total:0, service_id:null }]); }
  function removeLine(i:number) { setItems(p => p.filter((_,idx) => idx !== i)); }

  function resetForm() {
    setFClientId(""); setFClientName(""); setFClientEmail(""); setFClientPhone(""); setFClientAddress("");
    setFProject(""); setFDue(""); setFNotes("");
    setFTax(company?.tax_rate ?? 15);
    setItems([{ description:"", quantity:1, unit_price:0, total:0, service_id:null }]);
    setOpenSections(new Set(["client","details"]));
    setPreviewTab("preview");
  }

  function openCreate() {
    setEdit(null);
    resetForm();
    setSaveError("");
    setView("editor");
  }

  async function openEdit(inv: Invoice) {
    setSaveError("");
    setEdit(inv);
    setFClientId(inv.client_id ?? "");
    const c = clients.find(c => c.id === inv.client_id);
    setFClientName(c?.full_name ?? inv.client_name);
    setFClientEmail(c?.email ?? inv.client_email ?? "");
    setFClientPhone(c?.phone ?? inv.client_phone ?? "");
    setFClientAddress(c?.address ?? inv.client_address ?? "");
    setFProject(inv.project_name ?? "");
    setFDue(inv.due_date ?? "");
    setFNotes(inv.notes ?? "");
    setFTax(inv.tax_rate);
    setLoadingItems(true);
    setView("editor");
    setPreviewTab("preview");
    const { data } = await supabase
      .from("invoice_items").select("*").eq("invoice_id", inv.id).order("sort_order");
    setItems(
      data && data.length > 0
        ? data.map(it => ({ description:it.description, quantity:it.quantity, unit_price:it.unit_price/100, total:it.total/100, service_id:null }))
        : [{ description:"", quantity:1, unit_price:0, total:0, service_id:null }]
    );
    setLoadingItems(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    const client        = clients.find(c => c.id === fClientId);
    const resolvedName  = (client?.full_name ?? fClientName) || "Unknown";
    const resolvedEmail = client?.email      ?? fClientEmail ?? "";
    const resolvedPhone   = (client?.phone   ?? fClientPhone)   || null;
    const resolvedAddress = (client?.address ?? fClientAddress) || null;
    const lineItems = items.map(it => ({
      description: it.description,
      quantity:    it.quantity,
      unit_price:  Math.round(it.unit_price * 100),
      total:       Math.round(it.quantity * it.unit_price * 100),
    }));
    const totals = computeInvoiceTotals(lineItems, fTax);

    if (edit) {
      const { error } = await supabase.from("invoices").update({
        client_id: fClientId || null, client_name: resolvedName, client_email: resolvedEmail,
        client_phone: resolvedPhone, client_address: resolvedAddress,
        project_name: fProject || null, due_date: fDue || null, notes: fNotes || null, tax_rate: fTax,
        ...totals, updated_at: new Date().toISOString(),
      }).eq("id", edit.id);
      if (error) { setSaveError(error.message); setSaving(false); return; }
      await supabase.from("invoice_items").delete().eq("invoice_id", edit.id);
      if (lineItems.length > 0)
        await supabase.from("invoice_items").insert(lineItems.map((it,idx) => ({ invoice_id:edit.id, ...it, sort_order:idx })));
    } else {
      const { data: settings } = await supabase.from("company_settings").select("*").limit(1).maybeSingle();
      const prefix = settings?.invoice_prefix ?? "INV";
      const year   = new Date().getFullYear();

      // Derive next counter from the highest existing invoice number — avoids duplicate key
      const { data: existing } = await supabase
        .from("invoices")
        .select("invoice_no")
        .like("invoice_no", `${prefix}-${year}-%`);
      const maxUsed = (existing ?? []).reduce((max, row) => {
        const n = parseInt(row.invoice_no.split("-").pop() ?? "0", 10);
        return Number.isNaN(n) ? max : Math.max(max, n);
      }, 0);
      const counter = Math.max(settings?.invoice_counter ?? 1, maxUsed + 1);

      // Base payload — columns that have always existed
      const basePayload = {
        invoice_no:   generateInvoiceNo(prefix, counter),
        issue_date:   new Date().toISOString().split("T")[0],
        client_id:    fClientId || null,
        client_name:  resolvedName,
        client_email: resolvedEmail,
        status:       "draft" as const,
        due_date:     fDue || null,
        notes:        fNotes || null,
        tax_rate:     fTax,
        currency:     company?.currency ?? "ZAR",
        ...totals,
      };

      // Try with extended columns first; fall back to base if columns don't exist yet
      let { data: inv, error: invErr } = await supabase
        .from("invoices")
        .insert({ ...basePayload, project_name: fProject || null, client_phone: resolvedPhone, client_address: resolvedAddress })
        .select()
        .single();

      // code 42703 = PostgreSQL "undefined_column" — migration hasn't been run yet
      if (invErr?.code === "42703") {
        ({ data: inv, error: invErr } = await supabase
          .from("invoices")
          .insert(basePayload)
          .select()
          .single());
      }

      if (invErr || !inv) {
        setSaveError(invErr?.message ?? "Invoice could not be saved — unknown error.");
        setSaving(false);
        return;
      }

      await Promise.all([
        lineItems.length > 0
          ? supabase.from("invoice_items").insert(lineItems.map((it, idx) => ({ invoice_id: inv!.id, ...it, sort_order: idx })))
          : Promise.resolve(),
        settings?.id
          ? supabase.from("company_settings").update({ invoice_counter: counter + 1 }).eq("id", settings.id)
          : Promise.resolve(),
      ]);
    }
    await loadAll();
    setView("list");
    setSaving(false);
  }

  async function updateStatus(id: string, status: InvoiceStatus) {
    setUpdating(id);
    const extra = status === "paid" ? { paid_date: new Date().toISOString().split("T")[0] } : {};
    await supabase.from("invoices").update({ status, ...extra }).eq("id", id);
    setInvoices(p => p.map(inv => inv.id === id ? { ...inv, status, ...extra } : inv));

    const inv = invoices.find(i => i.id === id);
    if (inv) {
      if (status === "paid") {
        // Auto-create a planning project when invoice is marked paid
        const { data: existing } = await supabase
          .from("projects")
          .select("id")
          .eq("notes", `invoice:${inv.invoice_no}`)
          .maybeSingle();
        if (!existing) {
          await supabase.from("projects").insert({
            title: inv.project_name || `Project from ${inv.invoice_no}`,
            description: `Auto-created from invoice ${inv.invoice_no}`,
            client_name: inv.client_name,
            status: "planning",
            priority: "medium",
            due_date: inv.due_date ?? null,
            notes: `invoice:${inv.invoice_no}`,
          });
        }
      } else if (inv.status === "paid") {
        // Invoice is being moved back from paid — remove the auto-created project
        await supabase
          .from("projects")
          .delete()
          .eq("notes", `invoice:${inv.invoice_no}`)
          .eq("status", "planning");
      }
    }

    setUpdating(null);
  }

  async function handleDelete(id: string) {
    await supabase.from("invoice_items").delete().eq("invoice_id", id);
    await supabase.from("invoices").delete().eq("id", id);
    setInvoices(p => p.filter(inv => inv.id !== id));
    setDeleteConfirm(null);
  }

  async function handleDownload(inv: Invoice) {
    setDownloading(inv.id);
    const { data } = await supabase
      .from("invoice_items").select("*").eq("invoice_id", inv.id).order("sort_order");
    const li: LineItem[] = (data ?? []).map(it => ({
      description: it.description, quantity: it.quantity,
      unit_price: it.unit_price / 100, total: it.total / 100, service_id: null,
    }));
    setPrintItems(li);
    setPrintInv(inv);
    // capture happens in the useEffect below once the hidden div renders
  }

  // Once printInv is set and the hidden div has rendered, capture → PDF → cleanup
  useEffect(() => {
    if (!printInv || !printRef.current) return;

    const el = printRef.current;
    // Give the browser one frame to fully paint the hidden element
    const raf = requestAnimationFrame(async () => {
      try {
        const html2canvas = (await import("html2canvas")).default;
        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
        });

        const { default: jsPDF } = await import("jspdf");
        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();

        // Scale canvas to page width
        const imgW  = pageW;
        const imgH  = (canvas.height * pageW) / canvas.width;

        if (imgH <= pageH) {
          // Fits on one page
          doc.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, imgW, imgH);
        } else {
          // Multi-page: slice the canvas into A4 height segments
          const pxPerPage = Math.floor((canvas.width * pageH) / pageW);
          let srcY = 0;
          while (srcY < canvas.height) {
            if (srcY > 0) doc.addPage();
            const sliceH = Math.min(pxPerPage, canvas.height - srcY);
            const slice  = document.createElement("canvas");
            slice.width  = canvas.width;
            slice.height = sliceH;
            slice.getContext("2d")!.drawImage(canvas, 0, srcY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
            const slicePdfH = (sliceH * pageW) / canvas.width;
            doc.addImage(slice.toDataURL("image/png"), "PNG", 0, 0, pageW, slicePdfH);
            srcY += pxPerPage;
          }
        }

        doc.save(`${printInv.invoice_no}.pdf`);
      } catch (err) {
        console.error("PDF capture error:", err);
      } finally {
        setPrintInv(null);
        setDownloading(null);
      }
    });
    return () => cancelAnimationFrame(raf);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [printInv]);

  // ── Derived ───────────────────────────────────────────────────────────────────
  const isLight  = mounted && theme === "light";
  const t        = getThemeTokens(isLight);
  const filtered = statusF === "all" ? invoices : invoices.filter(i => i.status === statusF);

  const stats = {
    total:   invoices.reduce((s,i) => s+i.total, 0),
    paid:    invoices.filter(i=>i.status==="paid").reduce((s,i)=>s+i.total,0),
    pending: invoices.filter(i=>i.status==="sent").reduce((s,i)=>s+i.total,0),
    overdue: invoices.filter(i=>i.status==="overdue").reduce((s,i)=>s+i.total,0),
  };

  const selectedClient = clients.find(c => c.id === fClientId);
  const previewName    = selectedClient?.full_name ?? fClientName;
  const previewEmail   = selectedClient?.email ?? fClientEmail ?? "";
  const previewNo      = edit?.invoice_no ?? (
    company ? `${company.invoice_prefix}-${new Date().getFullYear()}-${String(company.invoice_counter).padStart(4,"0")}` : "DRAFT"
  );
  const previewIssue   = edit?.issue_date
    ? formatDate(edit.issue_date)
    : new Date().toLocaleDateString("en-ZA", { day:"numeric", month:"short", year:"numeric" });
  const previewDue     = fDue ? formatDate(fDue) : "";

  const inputCls = `w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${t.input}`;
  const labelCls = `block text-xs font-semibold uppercase tracking-wider mb-1.5 ${t.label}`;

  // ════════════════════════════════════════════════════════════════════════════
  // EDITOR VIEW
  // ════════════════════════════════════════════════════════════════════════════
  if (view === "editor") {
    return (
      <div className="flex flex-col min-h-[calc(100vh-56px)] -m-5 lg:-m-8">

        {/* ── Left sidebar + right preview ── */}
        <div className="flex flex-col lg:flex-row flex-1 lg:overflow-hidden">

          {/* LEFT — Accordion form */}
          <div className={`w-full lg:w-72 xl:w-80 flex-shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r overflow-y-auto ${t.divider} ${
            isLight ? "bg-white" : "bg-[#0D0D0F]"
          }`}>

            {/* Sidebar header */}
            <div className={`px-5 pt-5 pb-4 border-b ${t.divider}`}>
              <button
                onClick={() => setView("list")}
                className={`flex items-center gap-1.5 text-xs font-medium mb-3 transition-colors ${
                  isLight ? "text-black/35 hover:text-black" : "text-white/35 hover:text-white"
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Invoices
              </button>
              <h2 className={`text-base font-bold ${t.heading}`}>
                {edit ? "Edit Invoice" : "Create New Invoice"}
              </h2>
              <p className={`text-xs mt-0.5 ${t.muted}`}>Fill in invoice details.</p>
            </div>

            {/* Info banner */}
            <div className={`mx-4 my-3 px-3 py-2.5 rounded-xl flex items-start gap-2.5 ${
              isLight ? "bg-[#2F8F89]/[0.06] border border-[#2F8F89]/20" : "bg-[#2F8F89]/[0.08] border border-[#2F8F89]/20"
            }`}>
              <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-[#2F8F89]" />
              <p className={`text-xs leading-relaxed ${isLight ? "text-[#2F8F89]" : "text-[#3FE0D0]/80"}`}>
                You can save an unfinished invoice as draft and complete it later.
              </p>
            </div>

            {loadingItems ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-5 h-5 border-2 border-[#2F8F89] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <form id="invoice-form" onSubmit={handleSave} className="flex-1 flex flex-col">

                {/* ① My Details */}
                <AccordionSection
                  id="my-details" title="My Details"
                  subtitle={company?.company_name ?? "Company info from Settings"}
                  icon={Building2} isOpen={openSections.has("my-details")}
                  onToggle={() => toggleSection("my-details")}
                  isLight={isLight} t={t}
                >
                  <div className={`rounded-xl p-3 space-y-1.5 text-sm ${isLight?"bg-black/[0.03]":"bg-white/[0.03]"}`}>
                    {[
                      ["Name",    company?.company_name],
                      ["Email",   company?.company_email],
                      ["Phone",   company?.company_phone],
                      ["VAT No",  company?.vat_number],
                    ].filter(([,v]) => v).map(([label, val]) => (
                      <div key={label as string} className="flex justify-between gap-2">
                        <span className={`flex-shrink-0 ${t.muted}`}>{label}</span>
                        <span className={`text-right truncate font-medium ${t.heading}`}>{val}</span>
                      </div>
                    ))}
                    {!company?.company_name && (
                      <p className={`text-xs ${t.muted}`}>
                        <a href="/staff/settings" className="underline text-[#2F8F89]">Configure in Settings →</a>
                      </p>
                    )}
                  </div>
                </AccordionSection>

                {/* ② Client Details */}
                <AccordionSection
                  id="client" title="Client Details"
                  subtitle={previewName || "Select a client"}
                  icon={User} isOpen={openSections.has("client")}
                  onToggle={() => toggleSection("client")}
                  isLight={isLight} t={t}
                >
                  <div>
                    <label className={labelCls}>Select Client</label>
                    <select
                      value={fClientId}
                      onChange={e => {
                        const c = clients.find(cl => cl.id === e.target.value);
                        setFClientId(e.target.value);
                        setFClientName(c?.full_name ?? "");
                        setFClientEmail(c?.email ?? "");
                        setFClientPhone(c?.phone ?? "");
                        setFClientAddress(c?.address ?? "");
                      }}
                      className={inputCls}
                    >
                      <option value="">Manual entry…</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.full_name}{c.company ? ` · ${c.company}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  {!fClientId && (
                    <>
                      <div>
                        <label className={labelCls}>Client Name</label>
                        <input value={fClientName} onChange={e => setFClientName(e.target.value)}
                          placeholder="e.g. Tony Stark" className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Client Email</label>
                        <input type="email" value={fClientEmail} onChange={e => setFClientEmail(e.target.value)}
                          placeholder="tony@example.com" className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Phone Number</label>
                        <input type="tel" value={fClientPhone} onChange={e => setFClientPhone(e.target.value)}
                          placeholder="+27 82 000 0000" className={inputCls} />
                      </div>
                    </>
                  )}
                  {fClientId && (selectedClient?.phone || selectedClient?.email) && (
                    <div className={`rounded-xl p-3 space-y-1.5 text-xs ${isLight ? "bg-black/[0.03]" : "bg-white/[0.03]"}`}>
                      {selectedClient?.email && (
                        <div className="flex justify-between gap-2">
                          <span className={t.muted}>Email</span>
                          <span className={`font-medium truncate ${t.heading}`}>{selectedClient.email}</span>
                        </div>
                      )}
                      {selectedClient?.phone && (
                        <div className="flex justify-between gap-2">
                          <span className={t.muted}>Phone</span>
                          <span className={`font-medium ${t.heading}`}>{selectedClient.phone}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div>
                    <label className={labelCls}>Client Address</label>
                    <textarea rows={2} value={fClientAddress} onChange={e => setFClientAddress(e.target.value)}
                      placeholder="Street, City, Province, Postal Code"
                      className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 resize-none transition-all ${t.input}`} />
                  </div>
                </AccordionSection>

                {/* ③ Invoice Details */}
                <AccordionSection
                  id="details" title="Invoice Details"
                  subtitle={`${items.length} line item${items.length !== 1 ? "s" : ""}`}
                  icon={FileText} isOpen={openSections.has("details")}
                  onToggle={() => toggleSection("details")}
                  isLight={isLight} t={t}
                >
                  <div>
                    <label className={labelCls}>Project Name</label>
                    <input value={fProject} onChange={e => setFProject(e.target.value)}
                      placeholder="e.g. Website Redesign" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Due Date</label>
                    <input type="date" value={fDue} onChange={e => setFDue(e.target.value)} className={inputCls} />
                  </div>

                  {/* Line items */}
                  <div>
                    <label className={labelCls}>Line Items</label>
                    <div className="space-y-2">
                      {items.map((item, i) => (
                        <div key={i} className={`rounded-xl p-2.5 space-y-2 ${
                          isLight ? "bg-black/[0.025] border border-black/[0.06]" : "bg-white/[0.03] border border-white/[0.06]"
                        }`}>
                          {/* Row 1: combobox + remove */}
                          <div className="flex items-center gap-1.5">
                            <div className="flex-1 min-w-0">
                              <ServiceCombobox
                                description={item.description}
                                serviceId={item.service_id}
                                services={services}
                                onSelect={patch => updateItem(i, patch)}
                                isLight={isLight}
                                t={t}
                              />
                            </div>
                            {items.length > 1 && (
                              <button type="button" onClick={() => removeLine(i)}
                                className={`flex-shrink-0 p-1 rounded-lg transition-colors ${isLight?"text-black/20 hover:text-red-500 hover:bg-red-50":"text-white/20 hover:text-red-400 hover:bg-red-400/5"}`}>
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          {/* Row 2: Qty | Price | = Total */}
                          <div className="grid grid-cols-3 gap-1.5 items-center">
                            <div>
                              <p className={`text-[9px] uppercase tracking-wider mb-1 ${t.muted}`}>Qty</p>
                              <input
                                type="number" min={0.01} step={0.01}
                                value={item.quantity}
                                onChange={e => updateItem(i, { quantity: parseFloat(e.target.value) || 1 })}
                                className={`w-full px-2 py-1.5 rounded-lg text-xs text-center focus:outline-none focus:ring-2 transition-all ${t.input}`}
                              />
                            </div>
                            <div>
                              <p className={`text-[9px] uppercase tracking-wider mb-1 flex items-center gap-1 ${t.muted}`}>
                                Price (R)
                                {item.service_id && (
                                  <span title="Price auto-filled from Services">
                                    <Package className={`w-2.5 h-2.5 ${isLight ? "text-[#2F8F89]" : "text-[#3FE0D0]"}`} />
                                  </span>
                                )}
                              </p>
                              <input
                                type="number" min={0} step={0.01}
                                value={item.unit_price === 0 ? "" : item.unit_price}
                                placeholder="0.00"
                                onChange={e => updateItem(i, { unit_price: parseFloat(e.target.value) || 0, service_id: null })}
                                className={`w-full px-2 py-1.5 rounded-lg text-xs focus:outline-none focus:ring-2 transition-all ${t.input}`}
                              />
                            </div>
                            <div>
                              <p className={`text-[9px] uppercase tracking-wider mb-1 ${t.muted}`}>Total</p>
                              <div className={`px-2 py-1.5 rounded-lg text-xs font-semibold text-right ${
                                isLight ? "bg-black/[0.03] text-black/60" : "bg-white/[0.04] text-white/50"
                              }`}>
                                {formatCurrency(Math.round(item.quantity * item.unit_price * 100))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={addLine}
                      className={`mt-2 text-xs font-medium flex items-center gap-1 transition-colors ${
                        isLight ? "text-[#2F8F89] hover:text-[#1F6F6A]" : "text-[#2F8F89] hover:text-[#3FE0D0]"
                      }`}>
                      <Plus className="w-3 h-3" /> Add line item
                    </button>
                  </div>

                  <div>
                    <label className={labelCls}>Tax / VAT Rate (%)</label>
                    <input type="number" min={0} max={100} step={0.1} value={fTax}
                      onChange={e => setFTax(parseFloat(e.target.value)||0)} className={inputCls} />
                  </div>

                  {/* Totals mini summary */}
                  {(() => {
                    const li = items.map(it => ({ quantity:it.quantity, unit_price:Math.round(it.unit_price*100) }));
                    const { subtotal, tax_amount, total } = computeInvoiceTotals(li, fTax);
                    return (
                      <div className={`rounded-xl p-3 space-y-1 ${isLight?"bg-black/[0.03] border border-black/[0.06]":"bg-white/[0.03] border border-white/[0.06]"}`}>
                        <div className={`flex justify-between text-xs ${t.subtext}`}>
                          <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
                        </div>
                        {fTax > 0 && (
                          <div className={`flex justify-between text-xs ${t.subtext}`}>
                            <span>VAT ({fTax}%)</span><span>{formatCurrency(tax_amount)}</span>
                          </div>
                        )}
                        <div className={`flex justify-between text-sm font-bold pt-1.5 border-t ${t.divider} ${t.heading}`}>
                          <span>Total</span><span>{formatCurrency(total)}</span>
                        </div>
                      </div>
                    );
                  })()}
                </AccordionSection>

                {/* ④ Payment Details */}
                <AccordionSection
                  id="payment" title="Payment Details"
                  subtitle={company?.bank_name ?? "Banking info from Settings"}
                  icon={CreditCard} isOpen={openSections.has("payment")}
                  onToggle={() => toggleSection("payment")}
                  isLight={isLight} t={t}
                >
                  {company?.bank_name || company?.bank_account ? (
                    <div className={`rounded-xl p-3 space-y-2 text-sm ${isLight?"bg-black/[0.03]":"bg-white/[0.03]"}`}>
                      {company.bank_name    && <div className="flex justify-between"><span className={t.muted}>Bank</span><span className={`font-medium ${t.heading}`}>{company.bank_name}</span></div>}
                      {company.bank_account && <div className="flex justify-between"><span className={t.muted}>Account</span><span className={`font-medium font-mono ${t.heading}`}>{company.bank_account}</span></div>}
                      {company.bank_branch  && <div className="flex justify-between"><span className={t.muted}>Branch</span><span className={`font-medium ${t.heading}`}>{company.bank_branch}</span></div>}
                    </div>
                  ) : (
                    <p className={`text-xs ${t.muted}`}>
                      No banking details configured.{" "}
                      <a href="/staff/settings" className="underline text-[#2F8F89]">Add in Settings →</a>
                    </p>
                  )}
                </AccordionSection>

                {/* ⑤ Notes */}
                <AccordionSection
                  id="notes" title="Add Notes"
                  subtitle={fNotes ? fNotes.slice(0, 40) + (fNotes.length > 40 ? "…" : "") : "Optional note for the client"}
                  icon={StickyNote} isOpen={openSections.has("notes")}
                  onToggle={() => toggleSection("notes")}
                  isLight={isLight} t={t}
                >
                  <textarea rows={3} value={fNotes}
                    onChange={e => setFNotes(e.target.value)}
                    placeholder="e.g. Payment is due within 30 days. Thank you for your business."
                    className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 resize-none transition-all ${t.input}`}
                  />
                </AccordionSection>

                {/* ⑥ Add Signature */}
                <AccordionSection
                  id="signature" title="Add Signature"
                  subtitle="Draw or upload your signature"
                  icon={Pen} isOpen={openSections.has("signature")}
                  onToggle={() => toggleSection("signature")}
                  isLight={isLight} t={t}
                >
                  <div className={`rounded-xl flex items-center justify-center h-20 border-2 border-dashed text-xs ${
                    isLight ? "border-black/10 text-black/25" : "border-white/10 text-white/20"
                  }`}>
                    Signature upload coming soon
                  </div>
                </AccordionSection>

                {/* ⑦ Email Details */}
                <AccordionSection
                  id="email-details" title="Email Details"
                  subtitle="Send invoice to client by email"
                  icon={Mail} isOpen={openSections.has("email-details")}
                  onToggle={() => toggleSection("email-details")}
                  isLight={isLight} t={t}
                >
                  <div className={`rounded-xl p-3 text-xs ${isLight?"bg-black/[0.03]":"bg-white/[0.03]"}`}>
                    <p className={t.muted}>
                      Email delivery coming soon. Save the invoice first and use the PDF export to email your client.
                    </p>
                  </div>
                </AccordionSection>

                {/* Save button at bottom */}
                <div className="p-4 mt-auto space-y-2">
                  {saveError && (
                    <p className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 leading-relaxed">
                      {saveError}
                    </p>
                  )}
                  <button
                    form="invoice-form"
                    type="submit"
                    disabled={saving}
                    className={`w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 ${
                      isLight
                        ? "bg-black text-white hover:bg-black/80"
                        : "bg-white/10 text-white hover:bg-white/[0.15] border border-white/10"
                    }`}
                  >
                    {saving ? "Saving…" : edit ? "Save Changes" : "Save Invoice"}
                  </button>
                </div>

              </form>
            )}
          </div>

          {/* RIGHT — Preview panel */}
          <div className={`flex-1 flex flex-col lg:overflow-hidden ${isLight?"bg-[#F0F0F2]":"bg-[#0B0B0C]"}`}>

            {/* ── Preview toolbar with tabs ── */}
            <div className={`flex items-center justify-between px-5 py-2.5 border-b flex-shrink-0 ${t.divider} ${
              isLight ? "bg-white" : "bg-[#0D0D0F]"
            }`}>
              {/* Tabs */}
              <div className="flex items-center gap-1">
                {([
                  { id: "preview",  label: "Preview",        icon: Eye          },
                  { id: "pdf",      label: "PDF",             icon: Download     },
                  { id: "email",    label: "Email",           icon: Mail         },
                  { id: "payment",  label: "Online Payment",  icon: CreditCard   },
                ] as const).map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      if (tab.id === "pdf") {
                        if (edit) handleDownload(edit);
                        return;
                      }
                      setPreviewTab(tab.id);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      previewTab === tab.id && tab.id !== "pdf"
                        ? isLight
                          ? "bg-black/[0.06] text-black"
                          : "bg-white/[0.08] text-white"
                        : isLight
                          ? "text-black/40 hover:text-black hover:bg-black/[0.04]"
                          : "text-white/35 hover:text-white hover:bg-white/[0.05]"
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Save Invoice button */}
              <button
                form="invoice-form"
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-semibold bg-[#2F8F89] hover:bg-[#267a75] text-white transition-all disabled:opacity-60"
              >
                {saving ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : null}
                {saving ? "Saving…" : "Save Invoice"}
              </button>
            </div>

            {/* Preview area */}
            <div className="flex-1 overflow-y-auto overflow-x-auto p-4 lg:p-10">
              {previewTab === "preview" && (
                <InvoicePreview
                  invoiceNo={previewNo}
                  issueDate={previewIssue}
                  dueDate={previewDue}
                  clientName={previewName}
                  clientEmail={previewEmail}
                  clientPhone={selectedClient?.phone ?? fClientPhone}
                  clientAddress={fClientAddress}
                  items={items}
                  taxRate={fTax}
                  notes={fNotes}
                  company={company}
                  project={fProject}
                />
              )}
              {previewTab === "email" && (
                <div className={`rounded-2xl p-10 text-center ${t.card}`}>
                  <Mail className={`w-10 h-10 mx-auto mb-4 ${t.subtext}`} />
                  <p className={`text-sm font-semibold mb-2 ${t.heading}`}>Email Delivery</p>
                  <p className={`text-xs ${t.muted}`}>Save the invoice first, then use PDF export to email your client.</p>
                </div>
              )}
              {previewTab === "payment" && (
                <div className={`rounded-2xl p-10 text-center ${t.card}`}>
                  <CreditCard className={`w-10 h-10 mx-auto mb-4 ${t.subtext}`} />
                  <p className={`text-sm font-semibold mb-2 ${t.heading}`}>Online Payment</p>
                  <p className={`text-xs ${t.muted}`}>Payment link integration coming soon.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // LIST VIEW
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6 max-w-7xl">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className={`text-2xl font-bold ${t.heading}`}>Invoices</h1>
          <p className={`text-sm mt-0.5 ${t.subtext}`}>
            {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Invoice
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label:"Total Invoiced", value:stats.total,   color:t.heading,                                      icon:FileText     },
          { label:"Paid",           value:stats.paid,    color:isLight?"text-green-700":"text-green-400",       icon:CheckCircle2 },
          { label:"Awaiting",       value:stats.pending, color:isLight?"text-blue-700":"text-blue-400",         icon:Clock        },
          { label:"Overdue",        value:stats.overdue, color:isLight?"text-red-600":"text-red-400",           icon:AlertCircle  },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-5 flex items-start gap-4 ${t.card}`}>
            <s.icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${s.color}`} />
            <div>
              <p className={`text-2xl font-bold ${s.color}`}>{formatCurrency(s.value)}</p>
              <p className={`text-xs mt-0.5 ${t.subtext}`}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setStatusF("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${statusF==="all" ? t.filterActive : t.filterIdle}`}>
          All ({invoices.length})
        </button>
        {INVOICE_STATUSES.map(s => (
          <button key={s} onClick={() => setStatusF(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${statusF===s ? t.filterActive : t.filterIdle}`}>
            {INVOICE_STATUS_META[s].label} ({invoices.filter(i=>i.status===s).length})
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
          <FileText className={`w-10 h-10 mx-auto mb-4 ${t.subtext}`} />
          <p className={`text-sm font-semibold mb-5 ${t.heading}`}>
            {statusF === "all" ? "No invoices yet" : `No ${statusF} invoices`}
          </p>
          {statusF === "all" && (
            <button onClick={openCreate} className="btn-primary">Create your first invoice</button>
          )}
        </div>
      ) : (
        <div className={`rounded-2xl overflow-hidden ${t.card}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${t.tableBorder}`}>
                  {["Invoice","Client","Amount","Status","Issued","Due","Actions"].map(h => (
                    <th key={h} className={`text-left text-xs font-semibold uppercase tracking-wider px-4 py-3 first:pl-6 last:pr-6 ${t.th}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(inv => {
                  const sm = INVOICE_STATUS_META[inv.status as InvoiceStatus];
                  const isDL = downloading === inv.id;
                  return (
                    <tr key={inv.id} className={`border-b last:border-0 transition-colors ${t.rowBorder} ${t.rowHover}`}>
                      <td className="px-4 py-4 pl-6">
                        <p className={`text-sm font-mono font-semibold ${t.heading}`}>{inv.invoice_no}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className={`text-sm font-medium ${t.heading}`}>{inv.client_name}</p>
                        {inv.client_email && <p className={`text-xs ${t.subtext}`}>{inv.client_email}</p>}
                      </td>
                      <td className="px-4 py-4">
                        <p className={`text-sm font-bold ${t.heading}`}>{formatCurrency(inv.total)}</p>
                        {inv.tax_rate > 0 && <p className={`text-xs ${t.muted}`}>incl. {inv.tax_rate}% VAT</p>}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isLight ? sm.light : sm.dark}`}>{sm.label}</span>
                      </td>
                      <td className="px-4 py-4"><p className={`text-xs ${t.bodyText}`}>{formatDate(inv.issue_date)}</p></td>
                      <td className="px-4 py-4">
                        <p className={`text-xs ${inv.status==="overdue" ? "text-red-500 font-medium" : t.bodyText}`}>{formatDate(inv.due_date)}</p>
                      </td>
                      <td className="px-4 py-4 pr-6">
                        <div className="flex items-center gap-1">
                          <div className="relative">
                            <select value={inv.status}
                              onChange={e => updateStatus(inv.id, e.target.value as InvoiceStatus)}
                              disabled={updating === inv.id}
                              className={`text-xs rounded-lg pl-2 pr-6 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#2F8F89] disabled:opacity-40 appearance-none cursor-pointer transition-all ${
                                isLight ? "bg-black/[0.03] border border-black/10 text-black/60" : "bg-white/5 border border-white/10 text-white/50"
                              }`}>
                              {INVOICE_STATUSES.map(s => <option key={s} value={s}>{INVOICE_STATUS_META[s].label}</option>)}
                            </select>
                            <ChevronDown className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none ${t.muted}`} />
                          </div>
                          <button onClick={() => handleDownload(inv)} disabled={isDL} title="Download PDF"
                            className={`p-1.5 rounded-lg transition-all disabled:opacity-40 ${isLight?"text-black/30 hover:text-[#2F8F89] hover:bg-[#2F8F89]/10":"text-white/25 hover:text-[#3FE0D0] hover:bg-[#2F8F89]/10"}`}>
                            {isDL ? <div className="w-3.5 h-3.5 border border-[#2F8F89] border-t-transparent rounded-full animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={() => openEdit(inv)} title="Edit"
                            className={`p-1.5 rounded-lg transition-all ${isLight?"text-black/25 hover:text-black hover:bg-black/[0.06]":"text-white/25 hover:text-white hover:bg-white/[0.08]"}`}>
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteConfirm(inv.id)} title="Delete"
                            className={`p-1.5 rounded-lg transition-all ${isLight?"text-black/20 hover:text-red-600 hover:bg-red-50":"text-white/20 hover:text-red-400 hover:bg-red-400/5"}`}>
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

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-2xl w-full max-w-sm p-6 ${t.modal}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto ${isLight?"bg-red-50":"bg-red-400/10"}`}>
              <Trash2 className={`w-5 h-5 ${isLight?"text-red-600":"text-red-400"}`} />
            </div>
            <h3 className={`text-base font-bold text-center mb-1 ${t.heading}`}>Delete Invoice?</h3>
            <p className={`text-sm text-center mb-6 ${t.subtext}`}>
              This permanently deletes the invoice and all its line items. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm transition-all ${t.cancelBtn}`}>Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden off-screen preview — captured by html2canvas for PDF download */}
      {printInv && (
        <div style={{ position: "fixed", left: -9999, top: 0, width: 794, zIndex: -1, pointerEvents: "none" }}>
          <div ref={printRef}>
            <InvoicePreview
              invoiceNo={printInv.invoice_no}
              issueDate={formatDate(printInv.issue_date)}
              dueDate={printInv.due_date ? formatDate(printInv.due_date) : ""}
              clientName={printInv.client_name}
              clientEmail={printInv.client_email}
              clientPhone={(printInv as any).client_phone ?? ""}
              clientAddress={(printInv as any).client_address ?? ""}
              items={printItems}
              taxRate={printInv.tax_rate}
              notes={printInv.notes ?? ""}
              company={company}
              project={(printInv as any).project_name ?? ""}
            />
          </div>
        </div>
      )}
    </div>
  );
}
