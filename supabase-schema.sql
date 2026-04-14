-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard → your project → SQL Editor

-- ─── Contact form submissions ───────────────────────────────────────────────
create table if not exists contact_submissions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  company     text,
  phone       text,
  service     text not null,
  message     text not null,
  created_at  timestamptz not null default now()
);

-- Only allow inserts from the service role (API routes); no client reads
alter table contact_submissions enable row level security;

-- ─── Booking sessions ────────────────────────────────────────────────────────
create table if not exists bookings (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        text not null,
  company      text,
  topic        text,
  date         date not null,
  time         text not null,
  amount_paid  integer not null default 500,
  status       text not null default 'confirmed',
  reference    text not null,
  created_at   timestamptz not null default now()
);

-- Only allow inserts from the service role (API routes); no client reads
alter table bookings enable row level security;

-- ─── Newsletter subscribers ──────────────────────────────────────────────────
create table if not exists newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  created_at timestamptz not null default now()
);

-- Only allow inserts from the service role (API routes); no client reads
alter table newsletter_subscribers enable row level security;
