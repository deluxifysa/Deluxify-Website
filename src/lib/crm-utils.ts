/** Format cents to ZAR currency string */
export function formatCurrency(cents: number, currency = "ZAR"): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/** Format a date string for table display */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Get 1-2 character initials from a name */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Generate invoice number from prefix + counter */
export function generateInvoiceNo(prefix: string, counter: number): string {
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${String(counter).padStart(4, "0")}`;
}

/** Compute invoice totals from line items */
export function computeInvoiceTotals(
  items: { quantity: number; unit_price: number }[],
  taxRate: number
): { subtotal: number; tax_amount: number; total: number } {
  const subtotal = items.reduce(
    (sum, i) => sum + Math.round(i.quantity * i.unit_price),
    0
  );
  const tax_amount = Math.round(subtotal * (taxRate / 100));
  return { subtotal, tax_amount, total: subtotal + tax_amount };
}

/** Group records by YYYY-MM key, sum a numeric field */
export function groupByMonth(
  records: { date_field: string; amount: number }[]
): { month: string; label: string; total: number }[] {
  const map = new Map<string, number>();
  records.forEach((r) => {
    const key = r.date_field.slice(0, 7);
    map.set(key, (map.get(key) ?? 0) + r.amount);
  });
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, total]) => ({
      month,
      label: new Date(month + "-01").toLocaleDateString("en-ZA", {
        month: "short",
        year: "2-digit",
      }),
      total,
    }));
}

/** Theme token set — call once at top of each page component */
export function getThemeTokens(isLight: boolean) {
  return {
    card:        isLight ? "bg-white border border-black/[0.07] shadow-sm"         : "bg-[#111113] border border-white/[0.06]",
    cardHover:   isLight ? "hover:border-black/[0.12]"                             : "hover:border-white/[0.10]",
    heading:     isLight ? "text-black"                                            : "text-white",
    subtext:     isLight ? "text-black/40"                                         : "text-white/40",
    muted:       isLight ? "text-black/25"                                         : "text-white/20",
    bodyText:    isLight ? "text-black/70"                                         : "text-white/70",
    input:       isLight
      ? "bg-black/[0.04] border border-black/10 text-black placeholder:text-black/30 focus:ring-[#2F8F89]"
      : "bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:ring-[#2F8F89]",
    rowBorder:   isLight ? "border-black/[0.05]"                                   : "border-white/[0.04]",
    rowHover:    isLight ? "hover:bg-black/[0.015]"                                : "hover:bg-white/[0.02]",
    label:       isLight ? "text-black/35"                                         : "text-white/35",
    divider:     isLight ? "border-black/[0.07]"                                   : "border-white/[0.06]",
    modal:       isLight ? "bg-white border border-black/10"                       : "bg-[#111113] border border-white/10",
    filterActive:isLight
      ? "bg-[#2F8F89]/10 text-[#2F8F89] border border-[#2F8F89]/25"
      : "bg-[#2F8F89]/15 text-[#3FE0D0] border border-[#2F8F89]/30",
    filterIdle:  isLight
      ? "bg-black/[0.03] text-black/40 border border-black/[0.08] hover:text-black"
      : "bg-white/5 text-white/40 border border-white/10 hover:text-white",
    cancelBtn:   isLight
      ? "bg-black/[0.03] border border-black/[0.08] text-black/50 hover:text-black hover:bg-black/[0.06]"
      : "bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/[0.08]",
    th:          isLight ? "text-black/30"                                         : "text-white/25",
    tableBorder: isLight ? "border-black/[0.06]"                                   : "border-white/[0.06]",
  };
}
