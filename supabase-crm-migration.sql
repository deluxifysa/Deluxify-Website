-- ═══════════════════════════════════════════════════════════════════════════
-- DELUXIFY CRM PLATFORM — FULL DATABASE MIGRATION
-- Run this entire script in your Supabase SQL Editor (one-time setup)
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Auto-update trigger function ──────────────────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─── Team members ───────────────────────────────────────────────────────────
create table if not exists team_members (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  full_name   text not null,
  email       text not null unique,
  role        text not null default 'staff',
  department  text,
  avatar_url  text,
  phone       text,
  is_active   boolean not null default true,
  joined_at   date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table team_members enable row level security;
drop policy if exists "Staff can read team members" on team_members;
create policy "Staff can read team members" on team_members for select using (auth.role() = 'authenticated');
drop policy if exists "Staff can manage team members" on team_members;
create policy "Staff can manage team members" on team_members for all using (auth.role() = 'authenticated');
drop trigger if exists trg_team_updated_at on team_members;
create trigger trg_team_updated_at before update on team_members for each row execute procedure update_updated_at();

-- ─── Clients (CRM core) ─────────────────────────────────────────────────────
create table if not exists clients (
  id              uuid primary key default gen_random_uuid(),
  full_name       text not null,
  email           text,
  phone           text,
  company         text,
  website         text,
  industry        text,
  pipeline_stage  text not null default 'lead',
  source          text,
  assigned_to     text,
  notes           text,
  tags            text[],
  last_contacted  date,
  expected_value  integer default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
alter table clients enable row level security;
drop policy if exists "Staff can read clients" on clients;
create policy "Staff can read clients" on clients for select using (auth.role() = 'authenticated');
drop policy if exists "Staff can manage clients" on clients;
create policy "Staff can manage clients" on clients for all using (auth.role() = 'authenticated');
drop trigger if exists trg_clients_updated_at on clients;
create trigger trg_clients_updated_at before update on clients for each row execute procedure update_updated_at();

-- ─── Activities / timeline ──────────────────────────────────────────────────
create table if not exists activities (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid references clients(id) on delete cascade,
  type        text not null default 'note',
  title       text not null,
  description text,
  created_by  text,
  created_at  timestamptz not null default now()
);
alter table activities enable row level security;
drop policy if exists "Staff can read activities" on activities;
create policy "Staff can read activities" on activities for select using (auth.role() = 'authenticated');
drop policy if exists "Staff can manage activities" on activities;
create policy "Staff can manage activities" on activities for all using (auth.role() = 'authenticated');

-- ─── Services / product catalog ─────────────────────────────────────────────
create table if not exists services (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  description  text,
  category     text,
  price        integer not null default 0,
  billing_type text not null default 'one-time',
  is_active    boolean not null default true,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
alter table services enable row level security;
drop policy if exists "Staff can read services" on services;
create policy "Staff can read services" on services for select using (auth.role() = 'authenticated');
drop policy if exists "Staff can manage services" on services;
create policy "Staff can manage services" on services for all using (auth.role() = 'authenticated');
drop trigger if exists trg_services_updated_at on services;
create trigger trg_services_updated_at before update on services for each row execute procedure update_updated_at();

-- Seed default services
insert into services (name, description, category, price, billing_type) values
  ('AI Automation Setup', 'Custom AI workflow automation for business processes', 'AI', 1500000, 'one-time'),
  ('AI Chatbot Development', 'Intelligent chatbot integrated into your platform', 'AI', 800000, 'one-time'),
  ('Web Development', 'Full-stack web application development', 'Development', 2500000, 'one-time'),
  ('SaaS Development', 'Custom SaaS product from MVP to launch', 'Development', 5000000, 'one-time'),
  ('AI Consulting (Monthly)', 'Ongoing AI strategy and consulting', 'Consulting', 500000, 'monthly'),
  ('Maintenance & Support', 'Monthly maintenance, updates, and support', 'Support', 250000, 'monthly')
on conflict do nothing;

-- ─── Invoices ────────────────────────────────────────────────────────────────
create table if not exists invoices (
  id           uuid primary key default gen_random_uuid(),
  invoice_no   text not null unique,
  client_id    uuid references clients(id) on delete set null,
  client_name  text not null,
  client_email text not null default '',
  status       text not null default 'draft',
  issue_date   date not null default current_date,
  due_date     date,
  paid_date    date,
  subtotal     integer not null default 0,
  tax_rate     numeric(5,2) not null default 15.00,
  tax_amount   integer not null default 0,
  total        integer not null default 0,
  currency     text not null default 'ZAR',
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
alter table invoices enable row level security;
drop policy if exists "Staff can read invoices" on invoices;
create policy "Staff can read invoices" on invoices for select using (auth.role() = 'authenticated');
drop policy if exists "Staff can manage invoices" on invoices;
create policy "Staff can manage invoices" on invoices for all using (auth.role() = 'authenticated');
drop trigger if exists trg_invoices_updated_at on invoices;
create trigger trg_invoices_updated_at before update on invoices for each row execute procedure update_updated_at();

-- ─── Invoice line items ──────────────────────────────────────────────────────
create table if not exists invoice_items (
  id          uuid primary key default gen_random_uuid(),
  invoice_id  uuid not null references invoices(id) on delete cascade,
  description text not null,
  quantity    numeric(10,2) not null default 1,
  unit_price  integer not null default 0,
  total       integer not null default 0,
  sort_order  integer not null default 0
);
alter table invoice_items enable row level security;
drop policy if exists "Staff can read invoice items" on invoice_items;
create policy "Staff can read invoice items" on invoice_items for select using (auth.role() = 'authenticated');
drop policy if exists "Staff can manage invoice items" on invoice_items;
create policy "Staff can manage invoice items" on invoice_items for all using (auth.role() = 'authenticated');

-- ─── Content posts ──────────────────────────────────────────────────────────
create table if not exists content_posts (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  body         text,
  platform     text not null default 'instagram',
  status       text not null default 'draft',
  scheduled_at timestamptz,
  published_at timestamptz,
  media_urls   text[],
  tags         text[],
  assigned_to  text,
  client_id    uuid references clients(id) on delete set null,
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
alter table content_posts enable row level security;
drop policy if exists "Staff can read content" on content_posts;
create policy "Staff can read content" on content_posts for select using (auth.role() = 'authenticated');
drop policy if exists "Staff can manage content" on content_posts;
create policy "Staff can manage content" on content_posts for all using (auth.role() = 'authenticated');
drop trigger if exists trg_content_updated_at on content_posts;
create trigger trg_content_updated_at before update on content_posts for each row execute procedure update_updated_at();

-- ─── Company settings (single row) ──────────────────────────────────────────
create table if not exists company_settings (
  id               uuid primary key default gen_random_uuid(),
  company_name     text not null default 'Deluxify',
  company_email    text,
  company_phone    text,
  company_address  text,
  company_website  text default 'https://deluxify.ai',
  vat_number       text,
  reg_number       text,
  invoice_prefix   text not null default 'INV',
  invoice_counter  integer not null default 1,
  currency         text not null default 'ZAR',
  tax_rate         numeric(5,2) not null default 15.00,
  payment_terms    integer not null default 30,
  bank_name        text,
  bank_account     text,
  bank_branch      text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
alter table company_settings enable row level security;
drop policy if exists "Staff can read settings" on company_settings;
create policy "Staff can read settings" on company_settings for select using (auth.role() = 'authenticated');
drop policy if exists "Staff can manage settings" on company_settings;
create policy "Staff can manage settings" on company_settings for all using (auth.role() = 'authenticated');
drop trigger if exists trg_settings_updated_at on company_settings;
create trigger trg_settings_updated_at before update on company_settings for each row execute procedure update_updated_at();

insert into company_settings (company_name, currency, tax_rate)
values ('Deluxify', 'ZAR', 15.00)
on conflict do nothing;

-- ─── RLS on existing tables (safe to re-run) ────────────────────────────────
alter table if exists projects enable row level security;
alter table if exists bookings enable row level security;

drop policy if exists "Staff can read projects" on projects;
create policy "Staff can read projects" on projects for select using (auth.role() = 'authenticated');
drop policy if exists "Staff can manage projects" on projects;
create policy "Staff can manage projects" on projects for all using (auth.role() = 'authenticated');

drop policy if exists "Staff can read bookings" on bookings;
create policy "Staff can read bookings" on bookings for select using (auth.role() = 'authenticated');
drop policy if exists "Staff can manage bookings" on bookings;
create policy "Staff can manage bookings" on bookings for all using (auth.role() = 'authenticated');

-- ═══════════════════════════════════════════════════════════════════════════
-- DONE — All tables created with RLS enabled
-- ═══════════════════════════════════════════════════════════════════════════
