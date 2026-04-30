-- ═══════════════════════════════════════════════════════════════════════════
-- DELUXIFY — BOOKING FLOW MIGRATION
-- Adds phone + client_id to bookings; adjusts defaults for pending-first flow.
-- Run in Supabase SQL Editor AFTER supabase-schema.sql and supabase-crm-migration.sql
-- ═══════════════════════════════════════════════════════════════════════════

-- Add phone number to bookings
alter table bookings add column if not exists phone text;

-- Link booking to CRM client record
alter table bookings add column if not exists client_id uuid references clients(id) on delete set null;

-- Default booking status is now pending (confirmed only after payment)
alter table bookings alter column status set default 'pending';

-- Default amount_paid is 0 (updated to 500 once payment is confirmed)
alter table bookings alter column amount_paid set default 0;

-- Allow unauthenticated inserts from the public booking form (API uses service role, but good to be explicit)
-- The service role key bypasses RLS, so no policy change is strictly required.
-- This policy is optional — only needed if you ever call from an anon/browser context directly.
-- drop policy if exists "Public can insert bookings" on bookings;
-- create policy "Public can insert bookings" on bookings for insert with check (true);

-- Add project_name to invoices (used as the auto-created project title when invoice is paid)
alter table invoices add column if not exists project_name text;

-- ═══════════════════════════════════════════════════════════════════════════
-- DONE
-- ═══════════════════════════════════════════════════════════════════════════
