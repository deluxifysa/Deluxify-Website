export const PIPELINE_STAGES = ["lead", "contacted", "proposal", "closed", "churned"] as const;
export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export const INVOICE_STATUSES = ["draft", "sent", "paid", "overdue", "cancelled"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const BILLING_TYPES = ["one-time", "monthly", "annual"] as const;
export type BillingType = (typeof BILLING_TYPES)[number];

export const CONTENT_PLATFORMS = ["instagram", "twitter", "linkedin", "facebook", "tiktok"] as const;
export type ContentPlatform = (typeof CONTENT_PLATFORMS)[number];

export const CONTENT_STATUSES = ["draft", "scheduled", "published", "archived"] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

// ─── Stage / status metadata ─────────────────────────────────────────────────
export const STAGE_META: Record<PipelineStage, { label: string; light: string; dark: string }> = {
  lead:      { label: "Lead",      light: "text-purple-700 bg-purple-50 border border-purple-200",  dark: "text-purple-400 bg-purple-400/10 border border-purple-400/20" },
  contacted: { label: "Contacted", light: "text-blue-700 bg-blue-50 border border-blue-200",        dark: "text-blue-400 bg-blue-400/10 border border-blue-400/20" },
  proposal:  { label: "Proposal",  light: "text-yellow-700 bg-yellow-50 border border-yellow-200",  dark: "text-yellow-400 bg-yellow-400/10 border border-yellow-400/20" },
  closed:    { label: "Closed",    light: "text-green-700 bg-green-50 border border-green-200",      dark: "text-green-400 bg-green-400/10 border border-green-400/20" },
  churned:   { label: "Churned",   light: "text-red-600 bg-red-50 border border-red-200",            dark: "text-red-400 bg-red-400/10 border border-red-400/20" },
};

export const INVOICE_STATUS_META: Record<InvoiceStatus, { label: string; light: string; dark: string }> = {
  draft:     { label: "Draft",     light: "text-gray-500 bg-gray-100 border border-gray-200",       dark: "text-white/40 bg-white/5 border border-white/10" },
  sent:      { label: "Sent",      light: "text-blue-700 bg-blue-50 border border-blue-200",        dark: "text-blue-400 bg-blue-400/10 border border-blue-400/20" },
  paid:      { label: "Paid",      light: "text-green-700 bg-green-50 border border-green-200",      dark: "text-green-400 bg-green-400/10 border border-green-400/20" },
  overdue:   { label: "Overdue",   light: "text-red-600 bg-red-50 border border-red-200",            dark: "text-red-400 bg-red-400/10 border border-red-400/20" },
  cancelled: { label: "Cancelled", light: "text-gray-400 bg-gray-100 border border-gray-200",       dark: "text-white/20 bg-white/[0.03] border border-white/[0.06]" },
};

export const PLATFORM_META: Record<ContentPlatform, { label: string; color: string }> = {
  instagram: { label: "Instagram", color: "text-pink-500" },
  twitter:   { label: "Twitter/X", color: "text-sky-500" },
  linkedin:  { label: "LinkedIn",  color: "text-blue-600" },
  facebook:  { label: "Facebook",  color: "text-blue-700" },
  tiktok:    { label: "TikTok",    color: "text-purple-500" },
};

// ─── Entity types ────────────────────────────────────────────────────────────
export type Client = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  website: string | null;
  address: string | null;
  industry: string | null;
  pipeline_stage: PipelineStage;
  source: string | null;
  assigned_to: string | null;
  notes: string | null;
  tags: string[] | null;
  last_contacted: string | null;
  expected_value: number | null;
  created_at: string;
  updated_at: string;
};

export type Activity = {
  id: string;
  client_id: string;
  type: "call" | "email" | "meeting" | "note";
  title: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
};

export type Service = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  billing_type: BillingType;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Invoice = {
  id: string;
  invoice_no: string;
  client_id: string | null;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  client_address: string | null;
  project_name: string | null;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string | null;
  paid_date: string | null;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  currency: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type InvoiceItem = {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  sort_order: number;
};

export type ContentPost = {
  id: string;
  title: string;
  body: string | null;
  platform: ContentPlatform;
  status: ContentStatus;
  scheduled_at: string | null;
  published_at: string | null;
  tags: string[] | null;
  assigned_to: string | null;
  client_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type TeamMember = {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  role: "admin" | "staff" | "intern";
  department: string | null;
  avatar_url: string | null;
  phone: string | null;
  is_active: boolean;
  joined_at: string | null;
  created_at: string;
};

export const SUBSCRIPTION_STATUSES = ["active", "paused", "cancelled"] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export const SUBSCRIPTION_PAYMENT_STATUSES = ["pending", "paid", "failed"] as const;
export type SubscriptionPaymentStatus = (typeof SUBSCRIPTION_PAYMENT_STATUSES)[number];

export const SUBSCRIPTION_STATUS_META: Record<SubscriptionStatus, { label: string; light: string; dark: string }> = {
  active:    { label: "Active",    light: "text-green-700 bg-green-50 border border-green-200",   dark: "text-green-400 bg-green-400/10 border border-green-400/20" },
  paused:    { label: "Paused",    light: "text-yellow-700 bg-yellow-50 border border-yellow-200", dark: "text-yellow-400 bg-yellow-400/10 border border-yellow-400/20" },
  cancelled: { label: "Cancelled", light: "text-gray-400 bg-gray-100 border border-gray-200",     dark: "text-white/20 bg-white/[0.03] border border-white/[0.06]" },
};

export const SUBSCRIPTION_PAYMENT_STATUS_META: Record<SubscriptionPaymentStatus, { label: string; light: string; dark: string }> = {
  pending: { label: "Pending", light: "text-blue-700 bg-blue-50 border border-blue-200",    dark: "text-blue-400 bg-blue-400/10 border border-blue-400/20" },
  paid:    { label: "Paid",    light: "text-green-700 bg-green-50 border border-green-200", dark: "text-green-400 bg-green-400/10 border border-green-400/20" },
  failed:  { label: "Failed",  light: "text-red-600 bg-red-50 border border-red-200",       dark: "text-red-400 bg-red-400/10 border border-red-400/20" },
};

export type Subscription = {
  id: string;
  client_id: string | null;
  client_name: string;
  client_email: string;
  plan_name: string;
  amount: number;           // cents
  billing_day: number;      // 1–28
  start_date: string;
  next_billing_date: string;
  status: SubscriptionStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type SubscriptionPayment = {
  id: string;
  subscription_id: string;
  billing_month: string;    // YYYY-MM
  invoice_id: string | null;
  invoice_no: string | null;
  amount: number;           // cents
  status: SubscriptionPaymentStatus;
  email_sent_at: string | null;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
};

export const BLOG_CATEGORIES = ["AI Insights", "AI News", "Industry Trends", "Tutorial", "Case Study", "Company"] as const;
export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export const BLOG_STATUSES = ["draft", "published", "archived"] as const;
export type BlogStatus = (typeof BLOG_STATUSES)[number];

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  author_name: string;
  category: string;
  tags: string[] | null;
  status: BlogStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CompanySettings = {
  id: string;
  company_name: string;
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
