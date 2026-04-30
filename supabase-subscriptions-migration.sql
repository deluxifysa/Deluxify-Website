-- Monthly Subscriptions feature
-- Run this in the Supabase SQL Editor

-- ─── Subscriptions table ──────────────────────────────────────────────────────
create table if not exists subscriptions (
  id               uuid primary key default gen_random_uuid(),
  client_id        uuid references clients(id) on delete set null,
  client_name      text not null,
  client_email     text not null,
  plan_name        text not null,
  amount           integer not null default 0,  -- stored in cents
  billing_day      integer not null default 1 check (billing_day between 1 and 28),
  start_date       date not null default current_date,
  next_billing_date date not null,
  status           text not null default 'active' check (status in ('active','paused','cancelled')),
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ─── Subscription payments table ─────────────────────────────────────────────
create table if not exists subscription_payments (
  id               uuid primary key default gen_random_uuid(),
  subscription_id  uuid not null references subscriptions(id) on delete cascade,
  billing_month    text not null,           -- format: YYYY-MM
  invoice_id       uuid references invoices(id) on delete set null,
  invoice_no       text,
  amount           integer not null default 0,  -- stored in cents
  status           text not null default 'pending' check (status in ('pending','paid','failed')),
  email_sent_at    timestamptz,
  paid_at          timestamptz,
  notes            text,
  created_at       timestamptz not null default now()
);

-- Prevent duplicate payments for the same subscription + month
create unique index if not exists subscription_payments_unique_month
  on subscription_payments (subscription_id, billing_month);

-- ─── RLS policies ─────────────────────────────────────────────────────────────
alter table subscriptions enable row level security;
alter table subscription_payments enable row level security;

-- Authenticated users (staff) can do everything
create policy "Staff full access on subscriptions"
  on subscriptions for all to authenticated using (true) with check (true);

create policy "Staff full access on subscription_payments"
  on subscription_payments for all to authenticated using (true) with check (true);

-- ─── Updated_at trigger ───────────────────────────────────────────────────────
create or replace function update_updated_at_column()
  returns trigger language plpgsql as $$
  begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists set_subscriptions_updated_at on subscriptions;
create trigger set_subscriptions_updated_at
  before update on subscriptions
  for each row execute function update_updated_at_column();
