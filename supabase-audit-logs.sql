-- ============================================================
-- AUDIT LOGS TABLE + TRIGGER
-- Run this in the Supabase SQL editor
-- ============================================================

create table if not exists audit_logs (
  id           uuid primary key default gen_random_uuid(),
  action       text not null,        -- 'created' | 'updated' | 'deleted'
  table_name   text not null,        -- 'clients' | 'invoices' | 'projects' etc
  record_id    text,                 -- id of affected record
  record_label text,                 -- human-readable name/title
  performed_by text,                 -- staff email
  details      text,                 -- optional extra context
  created_at   timestamptz not null default now()
);

alter table audit_logs enable row level security;

drop policy if exists "Staff can read logs"   on audit_logs;
drop policy if exists "Staff can insert logs" on audit_logs;

create policy "Staff can read logs"   on audit_logs for select using (auth.role() = 'authenticated');
create policy "Staff can insert logs" on audit_logs for insert with check (auth.role() = 'authenticated');

-- Index for fast queries
create index if not exists audit_logs_created_at_idx on audit_logs (created_at desc);
create index if not exists audit_logs_table_name_idx on audit_logs (table_name);
create index if not exists audit_logs_action_idx     on audit_logs (action);


-- ── Seed mock log data ───────────────────────────────────────
INSERT INTO audit_logs (action, table_name, record_label, performed_by, details, created_at) VALUES
  ('created', 'clients',  'Ravi Naidoo — Mediscan Health',         'katleho@deluxify.ai',  'New lead added from discovery call',              now() - interval '2 hours'),
  ('updated', 'invoices', 'INV-2025-0007 — Simba Safaris',         'lebo@deluxify.ai',     'Status changed from draft → sent',                now() - interval '4 hours'),
  ('created', 'invoices', 'INV-2025-0008 — African Edge Capital',  'katleho@deluxify.ai',  'Monthly AI retainer invoice generated',           now() - interval '6 hours'),
  ('updated', 'clients',  'Nomvula Mokoena — Greenleaf Solutions', 'jordan@deluxify.ai',   'Pipeline stage moved: contacted → proposal',      now() - interval '8 hours'),
  ('deleted', 'projects', 'Legacy Website Migration',              'katleho@deluxify.ai',  'Project cancelled by client request',             now() - interval '1 day'),
  ('created', 'projects', 'Simba Safaris Booking Platform',        'jordan@deluxify.ai',   'New project created and assigned',                now() - interval '1 day 2 hours'),
  ('updated', 'team_members', 'Priya Singh',                       'katleho@deluxify.ai',  'Account deactivated — on leave',                  now() - interval '2 days'),
  ('created', 'bookings', 'Thandeka Zulu — Luxe Homes ZA',         'lebo@deluxify.ai',     'Discovery call booked via website',               now() - interval '2 days 3 hours'),
  ('updated', 'invoices', 'INV-2025-0005 — Nova Build Group',      'katleho@deluxify.ai',  'Status changed: sent → overdue (30 days passed)', now() - interval '3 days'),
  ('updated', 'clients',  'Sipho Khumalo — African Edge Capital',  'jordan@deluxify.ai',   'Expected value updated: R650k → R850k',           now() - interval '3 days 5 hours'),
  ('created', 'services', 'Monthly AI Retainer',                   'katleho@deluxify.ai',  'New service package added to catalogue',           now() - interval '4 days'),
  ('deleted', 'clients',  'TestClient Corp',                       'katleho@deluxify.ai',  'Test record removed',                             now() - interval '4 days 1 hour'),
  ('updated', 'projects', 'Vault ZA E-Commerce Rebuild',           'aisha@deluxify.ai',    'Status updated: in-progress → completed',         now() - interval '5 days'),
  ('created', 'clients',  'Fatima Essop — Sunrise Logistics',      'lebo@deluxify.ai',     'Lead added from cold outreach campaign',          now() - interval '5 days 2 hours'),
  ('updated', 'settings', 'Company Settings',                      'katleho@deluxify.ai',  'Banking details updated',                         now() - interval '6 days'),
  ('created', 'invoices', 'INV-2025-0006 — The Vault ZA',          'katleho@deluxify.ai',  'Final delivery invoice raised',                   now() - interval '7 days'),
  ('updated', 'clients',  'Craig Botha — Apex Media ZA',           'lebo@deluxify.ai',     'Pipeline stage moved: proposal → churned',        now() - interval '8 days'),
  ('created', 'team_members', 'Thabo Nkosi',                       'katleho@deluxify.ai',  'New intern added to Marketing department',        now() - interval '9 days'),
  ('updated', 'invoices', 'INV-2025-0002 — The Vault ZA',          'katleho@deluxify.ai',  'Payment confirmed — marked as paid',              now() - interval '10 days'),
  ('created', 'content_posts', '5 Signs Your Business Needs AI',   'thabo@deluxify.ai',    'Post drafted and scheduled for Instagram',        now() - interval '11 days');
