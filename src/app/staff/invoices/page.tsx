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
  const { default: jsPDF }    = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc  = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W    = doc.internal.pageSize.getWidth();
  const H    = doc.internal.pageSize.getHeight();
  const MARGIN = 16;

  const TEAL      = [47,  143, 137] as [number,number,number];
  const TEAL_PALE = [232, 246, 245] as [number,number,number];
  const DARK      = [22,  22,  26]  as [number,number,number];
  const MIDGRAY   = [90,  90,  95]  as [number,number,number];
  const LIGHTGRAY = [200, 200, 205] as [number,number,number];
  const XLTGRAY   = [245, 245, 247] as [number,number,number];
  const WHITE     = [255, 255, 255] as [number,number,number];

  const statusColors: Record<string,[number,number,number]> = {
    paid:      [22,163,74], overdue: [220,38,38],
    sent:      [37,99,235], draft:   [113,113,122], cancelled: [82,82,91],
  };

  const logoData = await loadImageDataUrl("/logo.png");

  doc.setFillColor(...TEAL);
  doc.rect(0, 0, 4, H, "F");
  doc.setFillColor(...TEAL_PALE);
  doc.rect(4, 0, W - 4, 52, "F");

  if (logoData) doc.addImage(logoData, "PNG", MARGIN, 10, 52, 14, undefined, "FAST");
  else {
    doc.setFont("helvetica","bold"); doc.setFontSize(16); doc.setTextColor(...TEAL);
    doc.text(company.company_name ?? "Deluxify", MARGIN, 20);
  }

  doc.setFont("helvetica","bold"); doc.setFontSize(28);
  doc.setTextColor(...TEAL);
  doc.text("INVOICE", W - MARGIN, 22, { align: "right" });
  doc.setFontSize(8); doc.setFont("helvetica","normal"); doc.setTextColor(...MIDGRAY);
  doc.text(invoice.invoice_no, W - MARGIN, 29, { align: "right" });

  const sm   = INVOICE_STATUS_META[invoice.status as InvoiceStatus];
  const sBg  = statusColors[invoice.status] ?? MIDGRAY;
  doc.setFillColor(...sBg);
  doc.roundedRect(W - MARGIN - 28, 32, 28, 7, 1.5, 1.5, "F");
  doc.setFontSize(6.5); doc.setFont("helvetica","bold"); doc.setTextColor(...WHITE);
  doc.text(sm.label.toUpperCase(), W - MARGIN - 14, 36.7, { align: "center" });

  let cy = 28;
  doc.setFontSize(8.5); doc.setFont("helvetica","bold"); doc.setTextColor(...DARK);
  doc.text(company.company_name ?? "Deluxify", MARGIN, cy); cy += 5;
  doc.setFontSize(7.5); doc.setFont("helvetica","normal"); doc.setTextColor(...MIDGRAY);
  if (company.company_address) {
    company.company_address.split(/[\n,]/).map(s=>s.trim()).filter(Boolean).slice(0,3)
      .forEach(l => { doc.text(l, MARGIN, cy); cy += 4.2; });
  }
  if (company.company_email)   { doc.text(company.company_email,   MARGIN, cy); cy += 4.2; }
  if (company.company_phone)   { doc.text(company.company_phone,   MARGIN, cy); cy += 4.2; }
  if (company.company_website) { doc.text(company.company_website, MARGIN, cy); }

  doc.setDrawColor(...TEAL); doc.setLineWidth(0.8);
  doc.line(4, 52, W, 52);

  let y = 60;
  const colMid = W / 2 + 4;

  doc.setFontSize(6.5); doc.setFont("helvetica","bold"); doc.setTextColor(...TEAL);
  doc.text("BILL TO", MARGIN, y); y += 5;
  doc.setFontSize(10); doc.setFont("helvetica","bold"); doc.setTextColor(...DARK);
  doc.text(invoice.client_name, MARGIN, y); y += 5;
  doc.setFontSize(8); doc.setFont("helvetica","normal"); doc.setTextColor(...MIDGRAY);
  if (invoice.client_address) {
    invoice.client_address.split(/\n/).map(s => s.trim()).filter(Boolean).forEach(l => {
      doc.text(l, MARGIN, y); y += 4.2;
    });
  }
  if (invoice.client_phone)  { doc.text(invoice.client_phone,  MARGIN, y); y += 4.5; }
  if (invoice.client_email)  { doc.text(invoice.client_email,  MARGIN, y); y += 4.5; }

  let detY = 60;
  doc.setFontSize(6.5); doc.setFont("helvetica","bold"); doc.setTextColor(...TEAL);
  doc.text("INVOICE DETAILS", colMid, detY); detY += 5;
  const detRows: [string,string][] = [
    ["Invoice Number", invoice.invoice_no],
    ["Issue Date",     formatDate(invoice.issue_date)],
    ["Due Date",       invoice.due_date ? formatDate(invoice.due_date) : "—"],
    ...(invoice.paid_date ? [["Date Paid", formatDate(invoice.paid_date)] as [string,string]] : []),
    ...(company.payment_terms ? [["Payment Terms", `${company.payment_terms} days`] as [string,string]] : []),
  ];
  doc.setFontSize(7.5);
  detRows.forEach(([label, val]) => {
    doc.setFont("helvetica","bold"); doc.setTextColor(...MIDGRAY); doc.text(label, colMid, detY);
    doc.setFont("helvetica","normal"); doc.setTextColor(...DARK); doc.text(val, W-MARGIN, detY, { align:"right" });
    detY += 5;
  });
  detY += 1;
  doc.setFontSize(6.5); doc.setFont("helvetica","normal"); doc.setTextColor(...LIGHTGRAY);
  if (company.vat_number) { doc.text(`VAT Reg: ${company.vat_number}`, W-MARGIN, detY, { align:"right" }); detY += 4; }
  if (company.reg_number) { doc.text(`Co Reg: ${company.reg_number}`,  W-MARGIN, detY, { align:"right" }); }

  y = Math.max(y + 6, detY + 6);
  doc.setDrawColor(...LIGHTGRAY); doc.setLineWidth(0.25);
  doc.line(MARGIN, y, W-MARGIN, y); y += 7;

  autoTable(doc, {
    startY: y,
    head: [["#","Description","Qty","Unit Price","Amount"]],
    body: lineItems.map((it, i) => [
      String(i+1), it.description||"—",
      String(Number.isInteger(it.quantity)?it.quantity:it.quantity.toFixed(2)),
      formatCurrency(Math.round(it.unit_price*100)),
      formatCurrency(Math.round(it.quantity*it.unit_price*100)),
    ]),
    theme: "plain",
    headStyles: { fillColor:DARK, textColor:WHITE, fontStyle:"bold", fontSize:8, cellPadding:{top:4,bottom:4,left:4,right:4} },
    bodyStyles: { fontSize:8.5, textColor:DARK, cellPadding:{top:4,bottom:4,left:4,right:4} },
    alternateRowStyles: { fillColor:XLTGRAY },
    columnStyles: {
      0:{cellWidth:10,halign:"center",textColor:MIDGRAY},
      1:{cellWidth:"auto"},
      2:{cellWidth:16,halign:"center"},
      3:{cellWidth:36,halign:"right"},
      4:{cellWidth:36,halign:"right",fontStyle:"bold"},
    },
    margin:{left:MARGIN,right:MARGIN},
    didDrawCell:(d:any)=>{
      if(d.section==="head"&&d.row.index===0){
        doc.setDrawColor(...TEAL); doc.setLineWidth(0.6);
        doc.line(d.cell.x,d.cell.y,d.cell.x+d.cell.width,d.cell.y);
      }
    },
  });

  y = (doc as any).lastAutoTable.finalY + 6;
  doc.setDrawColor(...LIGHTGRAY); doc.setLineWidth(0.25);
  doc.line(MARGIN, y, W-MARGIN, y); y += 6;

  const totW = 120; const totX = W-MARGIN-totW; const totValX = W-MARGIN;
  doc.setFontSize(8); doc.setFont("helvetica","normal");
  doc.setTextColor(...MIDGRAY); doc.text("Subtotal", totX, y);
  doc.setTextColor(...DARK); doc.text(formatCurrency(invoice.subtotal), totValX, y, { align:"right" }); y += 6;
  doc.setTextColor(...MIDGRAY); doc.text(`VAT (${invoice.tax_rate}%)`, totX, y);
  doc.setTextColor(...DARK); doc.text(formatCurrency(invoice.tax_amount), totValX, y, { align:"right" }); y += 3;
  doc.setFillColor(...TEAL); doc.roundedRect(totX-2,y+1,totW+4,14,2,2,"F");
  doc.setFontSize(8); doc.setFont("helvetica","bold"); doc.setTextColor(...WHITE);
  doc.text("TOTAL DUE", totX+2, y+9);
  doc.setFontSize(12); doc.text(formatCurrency(invoice.total), totValX-2, y+9, { align:"right" }); y += 22;

  if (company.bank_name || company.bank_account || company.bank_branch) {
    doc.setFillColor(...TEAL_PALE); doc.setDrawColor(...TEAL); doc.setLineWidth(0.4);
    doc.roundedRect(MARGIN, y, W-MARGIN*2, 28, 2, 2, "FD");
    doc.setFillColor(...TEAL); doc.roundedRect(MARGIN,y,3,28,1,1,"F");
    const bx = MARGIN+8; let by = y+7;
    doc.setFontSize(7); doc.setFont("helvetica","bold"); doc.setTextColor(...TEAL);
    doc.text("PAYMENT DETAILS — EFT TRANSFER", bx, by); by += 5.5;
    const cols = [
      company.bank_name    ? {label:"Bank",        val:company.bank_name}    : null,
      company.bank_account ? {label:"Account No",  val:company.bank_account} : null,
      company.bank_branch  ? {label:"Branch Code", val:company.bank_branch}  : null,
    ].filter(Boolean) as {label:string;val:string}[];
    const step = (W-MARGIN*2-8)/Math.max(cols.length,1);
    cols.forEach(({label,val},i)=>{
      const cx = bx+i*step;
      doc.setFontSize(6.5); doc.setFont("helvetica","bold"); doc.setTextColor(...MIDGRAY); doc.text(label.toUpperCase(),cx,by);
      doc.setFontSize(8);   doc.setFont("helvetica","bold"); doc.setTextColor(...DARK);    doc.text(val,cx,by+4.5);
    });
    by+=10; doc.setFontSize(6.5); doc.setFont("helvetica","italic"); doc.setTextColor(...MIDGRAY);
    doc.text(`Please use  "${invoice.invoice_no}"  as your payment reference.`, bx, by);
    y += 36;
  }

  if (invoice.notes) {
    doc.setFontSize(6.5); doc.setFont("helvetica","bold"); doc.setTextColor(...TEAL); doc.text("NOTES",MARGIN,y); y+=4.5;
    doc.setFont("helvetica","normal"); doc.setFontSize(8); doc.setTextColor(...MIDGRAY);
    const nl = doc.splitTextToSize(invoice.notes,W-MARGIN*2);
    doc.text(nl,MARGIN,y); y+=nl.length*4.5+4;
  }

  doc.setFillColor(...DARK); doc.rect(0,H-18,W,18,"F");
  doc.setFillColor(...TEAL); doc.rect(0,H-18,W,1.5,"F");
  if (logoData) doc.addImage(logoData,"PNG",MARGIN,H-14,28,7,undefined,"FAST");
  const fp=[company.company_name,company.company_email,company.company_phone,company.company_website].filter(Boolean);
  doc.setFontSize(7); doc.setFont("helvetica","normal"); doc.setTextColor(...WHITE);
  doc.text(fp.join("   |   "),W-MARGIN,H-10,{align:"right"});
  doc.setFontSize(6); doc.setTextColor(160,200,196);
  doc.text("Thank you for your business.",W-MARGIN,H-5,{align:"right"});
  const tp=(doc as any).internal.getNumberOfPages();
  for(let p=1;p<=tp;p++){
    doc.setPage(p); doc.setFontSize(6.5); doc.setTextColor(130,130,135);
    doc.text(`Page ${p} of ${tp}`,W/2,H-22,{align:"center"});
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

// ─── Live invoice preview — mirrors the PDF layout exactly ───────────────────
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
  const today = new Date().toLocaleDateString("en-ZA", { day:"numeric", month:"short", year:"numeric" });

  // Colour tokens matching the PDF generator
  const TEAL      = "#2F8F89";
  const TEAL_PALE = "#E8F6F5";
  const DARK      = "#16161A";
  const MIDGRAY   = "#5A5A5F";
  const LIGHTGRAY = "#C8C8CD";
  const XLTGRAY   = "#F5F5F7";

  // Derive address lines for company
  const companyAddrLines = company?.company_address
    ? company.company_address.split(/[\n,]/).map(s => s.trim()).filter(Boolean).slice(0, 3)
    : [];

  // Banking columns (same as PDF)
  const bankCols = [
    company?.bank_name    ? { label: "Bank",        val: company.bank_name }    : null,
    company?.bank_account ? { label: "Account No",  val: company.bank_account } : null,
    company?.bank_branch  ? { label: "Branch Code", val: company.bank_branch }  : null,
  ].filter(Boolean) as { label: string; val: string }[];

  // Company footer line
  const footerParts = [
    company?.company_name, company?.company_email,
    company?.company_phone, company?.company_website,
  ].filter(Boolean);

  return (
    <div style={{
      position: "relative",
      background: "white",
      fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
      borderRadius: 12,
      overflow: "hidden",
      boxShadow: "0 8px 48px rgba(0,0,0,0.18)",
      minWidth: 520,
      color: DARK,
    }}>

      {/* ── Teal left stripe (mirrors the 4mm PDF stripe) ── */}
      <div style={{
        position: "absolute", top: 0, left: 0, width: 6,
        height: "100%", background: TEAL, zIndex: 2,
      }} />

      {/* ── Teal-pale header wash ── */}
      <div style={{ background: TEAL_PALE, marginLeft: 6 }}>
        <div style={{ padding: "24px 28px 20px 28px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>

          {/* Left: logo + company details */}
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="logo"
              style={{ height: 22, display: "block", marginBottom: 10, filter: "brightness(0)" }} />
            <p style={{ fontWeight: 700, fontSize: 12, color: DARK, margin: "0 0 3px 0" }}>
              {company?.company_name ?? "Your Company"}
            </p>
            {companyAddrLines.map((l, i) => (
              <p key={i} style={{ fontSize: 10.5, color: MIDGRAY, margin: "1px 0" }}>{l}</p>
            ))}
            {company?.company_email   && <p style={{ fontSize: 10.5, color: MIDGRAY, margin: "1px 0" }}>{company.company_email}</p>}
            {company?.company_phone   && <p style={{ fontSize: 10.5, color: MIDGRAY, margin: "1px 0" }}>{company.company_phone}</p>}
            {company?.company_website && <p style={{ fontSize: 10.5, color: MIDGRAY, margin: "1px 0" }}>{company.company_website}</p>}
          </div>

          {/* Right: INVOICE heading + number + status badge */}
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 32, fontWeight: 900, color: TEAL, letterSpacing: -1, lineHeight: 1, margin: 0 }}>
              INVOICE
            </p>
            <p style={{ fontSize: 11, color: MIDGRAY, fontFamily: "monospace", margin: "4px 0 8px 0" }}>
              {invoiceNo || "DRAFT"}
            </p>
            {/* Status badge */}
            <span style={{
              display: "inline-block",
              padding: "2px 10px",
              borderRadius: 4,
              background: "#717175",
              color: "white",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}>
              DRAFT
            </span>
          </div>
        </div>
      </div>

      {/* ── Teal rule separating header from body ── */}
      <div style={{ marginLeft: 6, height: 2, background: TEAL }} />

      {/* ── BILL TO  +  INVOICE DETAILS ── */}
      <div style={{ marginLeft: 6, padding: "18px 28px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

        {/* Bill To */}
        <div>
          <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, color: TEAL, margin: "0 0 6px 0" }}>
            Bill To
          </p>
          <p style={{ fontSize: 13, fontWeight: 700, color: DARK, margin: "0 0 4px 0" }}>
            {clientName || "Client Name"}
          </p>
          {clientAddress && (
            <p style={{ fontSize: 10.5, color: MIDGRAY, lineHeight: 1.6, margin: "0 0 2px 0", whiteSpace: "pre-line" }}>{clientAddress}</p>
          )}
          {clientPhone && (
            <p style={{ fontSize: 10.5, color: MIDGRAY, margin: "1px 0" }}>{clientPhone}</p>
          )}
          {clientEmail && (
            <p style={{ fontSize: 10.5, color: MIDGRAY, margin: "1px 0" }}>{clientEmail}</p>
          )}
        </div>

        {/* Invoice Details */}
        <div>
          <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, color: TEAL, margin: "0 0 6px 0" }}>
            Invoice Details
          </p>
          {[
            ["Invoice Number", invoiceNo || "—"],
            ["Issue Date",     issueDate || today],
            ["Due Date",       dueDate || "—"],
            ...(project ? [["Project", project]] : []),
            ...(company?.payment_terms ? [["Payment Terms", `${company.payment_terms} days`]] : []),
          ].map(([label, val]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: MIDGRAY }}>{label}</span>
              <span style={{ fontSize: 10, color: DARK, fontFamily: label === "Invoice Number" ? "monospace" : undefined }}>
                {val}
              </span>
            </div>
          ))}
          {company?.vat_number && (
            <p style={{ fontSize: 9, color: LIGHTGRAY, marginTop: 4 }}>VAT Reg: {company.vat_number}</p>
          )}
          {company?.reg_number && (
            <p style={{ fontSize: 9, color: LIGHTGRAY, margin: "1px 0 0 0" }}>Co Reg: {company.reg_number}</p>
          )}
        </div>
      </div>

      {/* ── Light gray divider ── */}
      <div style={{ marginLeft: 6, height: 1, background: LIGHTGRAY, margin: `0 6px 0 6px` }} />

      {/* ── Line items table ── */}
      <div style={{ marginLeft: 6 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr>
              {/* Teal top border on header */}
              <th colSpan={5} style={{ padding: 0, height: 0 }}>
                <div style={{ height: 2, background: TEAL }} />
              </th>
            </tr>
            <tr style={{ background: DARK }}>
              <th style={{ textAlign: "center", padding: "8px 10px", color: "white", fontWeight: 700, fontSize: 10, width: 32 }}>#</th>
              <th style={{ textAlign: "left",   padding: "8px 10px", color: "white", fontWeight: 700, fontSize: 10 }}>Description</th>
              <th style={{ textAlign: "center", padding: "8px 10px", color: "white", fontWeight: 700, fontSize: 10, width: 48 }}>Qty</th>
              <th style={{ textAlign: "right",  padding: "8px 10px", color: "white", fontWeight: 700, fontSize: 10, width: 90 }}>Unit Price</th>
              <th style={{ textAlign: "right",  padding: "8px 14px 8px 10px", color: "white", fontWeight: 700, fontSize: 10, width: 90 }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} style={{ background: i % 2 === 1 ? XLTGRAY : "white" }}>
                <td style={{ textAlign: "center", padding: "9px 10px", color: MIDGRAY, fontSize: 11 }}>{i + 1}</td>
                <td style={{ padding: "9px 10px", color: DARK, fontSize: 12 }}>
                  {item.description || <span style={{ color: LIGHTGRAY }}>—</span>}
                </td>
                <td style={{ textAlign: "center", padding: "9px 10px", color: DARK, fontSize: 12 }}>
                  {Number.isInteger(item.quantity) ? item.quantity : item.quantity.toFixed(2)}
                </td>
                <td style={{ textAlign: "right", padding: "9px 10px", color: DARK, fontSize: 12 }}>
                  {item.unit_price > 0 ? formatCurrency(Math.round(item.unit_price * 100)) : "—"}
                </td>
                <td style={{ textAlign: "right", padding: "9px 14px 9px 10px", color: DARK, fontWeight: 700, fontSize: 12 }}>
                  {item.unit_price > 0 ? formatCurrency(Math.round(item.quantity * item.unit_price * 100)) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Light gray divider ── */}
      <div style={{ height: 1, background: LIGHTGRAY, marginLeft: 6 }} />

      {/* ── Subtotal / VAT / TOTAL DUE ── */}
      <div style={{ marginLeft: 6, padding: "12px 28px 16px", display: "flex", justifyContent: "flex-end" }}>
        <div style={{ width: 340 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: MIDGRAY }}>Subtotal</span>
            <span style={{ fontSize: 11, color: DARK }}>{formatCurrency(subtotal)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: MIDGRAY }}>VAT ({taxRate}%)</span>
            <span style={{ fontSize: 11, color: DARK }}>{formatCurrency(tax_amount)}</span>
          </div>
          {/* Teal total box — mirrors the PDF rounded rect */}
          <div style={{
            background: TEAL, borderRadius: 6,
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "9px 12px",
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "white" }}>TOTAL DUE</span>
            <span style={{ fontSize: 15, fontWeight: 900, color: "white" }}>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* ── Banking details (teal-pale box with teal left stripe + border) ── */}
      {bankCols.length > 0 && (
        <div style={{ marginLeft: 6, padding: "0 28px 20px" }}>
          <div style={{
            position: "relative",
            background: TEAL_PALE,
            border: `1px solid ${TEAL}`,
            borderRadius: 6,
            overflow: "hidden",
            padding: "12px 14px 12px 20px",
          }}>
            {/* Inner teal left stripe */}
            <div style={{ position: "absolute", top: 0, left: 0, width: 5, height: "100%", background: TEAL }} />
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: TEAL, margin: "0 0 10px 0" }}>
              Payment Details — EFT Transfer
            </p>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${bankCols.length}, 1fr)`, gap: 16 }}>
              {bankCols.map(({ label, val }) => (
                <div key={label}>
                  <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: MIDGRAY, margin: "0 0 3px 0" }}>
                    {label}
                  </p>
                  <p style={{ fontSize: 12, fontWeight: 700, color: DARK, margin: 0 }}>{val}</p>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 9, fontStyle: "italic", color: MIDGRAY, margin: "10px 0 0 0" }}>
              Please use <span style={{ fontFamily: "monospace", fontStyle: "normal" }}>"{invoiceNo || "INV"}"</span> as your payment reference.
            </p>
          </div>
        </div>
      )}

      {/* ── Notes ── */}
      {notes && (
        <div style={{ marginLeft: 6, padding: "0 28px 20px" }}>
          <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, color: TEAL, margin: "0 0 5px 0" }}>
            Notes
          </p>
          <p style={{ fontSize: 11, color: MIDGRAY, lineHeight: 1.65, margin: 0 }}>{notes}</p>
        </div>
      )}

      {/* ── Footer (dark bar with teal top line) ── */}
      <div style={{ marginLeft: 6, marginTop: 4 }}>
        <div style={{ height: 2, background: TEAL }} />
        <div style={{
          background: DARK,
          padding: "12px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="logo" style={{ height: 18, filter: "brightness(0) invert(1)" }} />
          <div style={{ textAlign: "right" }}>
            {footerParts.length > 0 && (
              <p style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", margin: "0 0 2px 0" }}>
                {footerParts.join("  |  ")}
              </p>
            )}
            <p style={{ fontSize: 9, color: "#3FE0D0", margin: 0 }}>Thank you for your business.</p>
          </div>
        </div>
      </div>
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
