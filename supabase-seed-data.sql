-- ============================================================
-- DELUXIFY CRM — SEED / MOCK DATA
-- Run this in the Supabase SQL editor after running the schema
-- and crm-migration scripts.
-- ============================================================

-- ── Company Settings ────────────────────────────────────────
INSERT INTO company_settings (
  company_name, company_email, company_phone, company_address,
  company_website, vat_number, reg_number,
  invoice_prefix, invoice_counter, currency,
  tax_rate, payment_terms,
  bank_name, bank_account, bank_branch
) VALUES (
  'Deluxify AI',
  'hello@deluxify.ai',
  '+27 11 123 4567',
  '14 Sandton Drive, Sandton, Johannesburg, 2196',
  'https://deluxify.ai',
  '4850291830',
  '2023/456789/07',
  'INV',
  9,
  'ZAR',
  15,
  30,
  'FNB',
  '62834901234',
  '250655'
) ON CONFLICT DO NOTHING;


-- ── Team Members ────────────────────────────────────────────
INSERT INTO team_members (full_name, email, role, department, phone, is_active, joined_at) VALUES
  ('Katleho Matsaseng',  'katleho@deluxify.ai',   'admin',  'Development',  '+27 82 111 2233', true,  '2023-01-15'),
  ('Aisha Patel',        'aisha@deluxify.ai',      'staff',  'Design',       '+27 82 444 5566', true,  '2023-03-01'),
  ('Lebo Dlamini',       'lebo@deluxify.ai',       'staff',  'Sales',        '+27 83 777 8899', true,  '2023-06-12'),
  ('Jordan Williams',    'jordan@deluxify.ai',     'staff',  'Consulting',   '+27 71 222 3344', true,  '2024-01-08'),
  ('Thabo Nkosi',        'thabo@deluxify.ai',      'intern', 'Marketing',    '+27 79 555 6677', true,  '2024-07-01'),
  ('Priya Singh',        'priya@deluxify.ai',      'staff',  'Development',  '+27 84 888 9900', false, '2023-09-20')
ON CONFLICT DO NOTHING;


-- ── Services ────────────────────────────────────────────────
INSERT INTO services (name, description, category, price, billing_type, is_active, sort_order) VALUES
  ('AI Strategy Consulting',      'End-to-end AI roadmap and implementation strategy for your business.',               'AI',          1500000,  'one-time', true,  1),
  ('Custom AI Model Development', 'Bespoke machine learning models trained on your data.',                              'AI',          3500000,  'one-time', true,  2),
  ('AI Chatbot Integration',      'Deploy a branded AI assistant across your website and internal tools.',              'AI',           850000,  'one-time', true,  3),
  ('Monthly AI Retainer',         'Ongoing model monitoring, retraining, and support.',                                 'AI',           500000,  'monthly',  true,  4),
  ('Web Application Development', 'Full-stack Next.js / React web applications with Supabase backend.',                'Development', 2500000,  'one-time', true,  5),
  ('UI/UX Design Package',        'Complete product design from wireframes to high-fidelity Figma prototypes.',        'Design',       750000,  'one-time', true,  6),
  ('Brand Identity Design',       'Logo, colour palette, typography, and brand guidelines.',                           'Design',       450000,  'one-time', true,  7),
  ('Digital Marketing Strategy',  'Social media, SEO, and paid campaign strategy and execution.',                      'Marketing',    350000,  'monthly',  true,  8),
  ('Technical SEO Audit',         'Comprehensive site audit with prioritised action plan.',                             'Consulting',   180000,  'one-time', true,  9),
  ('CRM & Automation Setup',      'Configure CRM, email sequences, and workflow automation.',                          'Consulting',   620000,  'one-time', false, 10)
ON CONFLICT DO NOTHING;


-- ── Clients ─────────────────────────────────────────────────
INSERT INTO clients (full_name, email, phone, company, website, industry, pipeline_stage, source, assigned_to, expected_value, last_contacted, notes) VALUES
  ('Sipho Khumalo',    'sipho@africanedge.co.za',    '+27 82 321 4321', 'African Edge Capital',   'https://africanedge.co.za',    'Finance',          'closed',    'Referral',       'Lebo Dlamini',   850000,  '2025-04-10', 'Great relationship. Renewing in Q3.'),
  ('Nomvula Mokoena',  'nomvula@greenleafsa.co.za',  '+27 71 654 3210', 'Greenleaf Solutions',    'https://greenleafsa.co.za',    'Sustainability',   'proposal',  'Website',        'Jordan Williams', 3500000, '2025-04-08', 'Proposal sent for AI model project. Awaiting sign-off.'),
  ('Dean Ferreira',    'dean@novabuild.co.za',       '+27 84 987 6543', 'Nova Build Group',       'https://novabuild.co.za',      'Construction',     'contacted', 'Cold Outreach',  'Lebo Dlamini',   1200000, '2025-04-05', 'Interested in web app + CRM setup.'),
  ('Ayesha Osman',     'ayesha@digitalrootssa.com',  '+27 79 111 2222', 'Digital Roots SA',       'https://digitalrootssa.com',   'Marketing',        'lead',      'LinkedIn',       NULL,             500000,  '2025-04-01', 'Came through LinkedIn ad. Follow up scheduled.'),
  ('Marcus van Rooyen','marcus@thevaultza.com',      '+27 83 444 5555', 'The Vault ZA',           'https://thevaultza.com',       'Retail',           'closed',    'Event',          'Jordan Williams', 2200000, '2025-03-28', 'E-commerce redesign + AI recommendations engine.'),
  ('Zanele Sithole',   'zanele@simbasafaris.co.za',  '+27 73 666 7777', 'Simba Safaris',          'https://simbasafaris.co.za',   'Tourism',          'proposal',  'Referral',       'Lebo Dlamini',   780000,  '2025-04-09', 'Needs booking platform overhaul with AI upsell.'),
  ('Ravi Naidoo',      'ravi@mediscanhealth.com',    '+27 82 888 9999', 'Mediscan Health',        'https://mediscanhealth.com',   'Healthcare',       'contacted', 'Website',        'Jordan Williams', 4500000, '2025-03-30', 'Large AI diagnostics project. Long sales cycle expected.'),
  ('Fatima Essop',     'fatima@sunriselogistics.co.za','+27 71 000 1111','Sunrise Logistics',     'https://sunriselogistics.co.za','Logistics',       'lead',      'Cold Outreach',  NULL,             650000,  '2025-03-25', 'Interested in route optimisation AI tool.'),
  ('Craig Botha',      'craig@apexmediaza.co.za',    '+27 84 222 3333', 'Apex Media ZA',          'https://apexmediaza.co.za',    'Media',            'churned',   'Event',          'Lebo Dlamini',   0,       '2025-02-14', 'Budget cut. May re-engage in H2 2025.'),
  ('Thandeka Zulu',    'thandeka@luxehomesza.com',   '+27 79 444 5555', 'Luxe Homes ZA',          'https://luxehomesza.com',      'Real Estate',      'proposal',  'Referral',       'Jordan Williams', 920000,  '2025-04-11', 'Virtual tour AI + lead capture chatbot proposal sent.')
ON CONFLICT DO NOTHING;


-- ── Invoices ─────────────────────────────────────────────────
-- Grab client IDs dynamically so foreign keys line up
DO $$
DECLARE
  c1 uuid; c2 uuid; c3 uuid; c5 uuid; c6 uuid; c7 uuid;
BEGIN
  SELECT id INTO c1 FROM clients WHERE email = 'sipho@africanedge.co.za'      LIMIT 1;
  SELECT id INTO c2 FROM clients WHERE email = 'nomvula@greenleafsa.co.za'    LIMIT 1;
  SELECT id INTO c3 FROM clients WHERE email = 'dean@novabuild.co.za'         LIMIT 1;
  SELECT id INTO c5 FROM clients WHERE email = 'marcus@thevaultza.com'        LIMIT 1;
  SELECT id INTO c6 FROM clients WHERE email = 'zanele@simbasafaris.co.za'    LIMIT 1;
  SELECT id INTO c7 FROM clients WHERE email = 'ravi@mediscanhealth.com'      LIMIT 1;

  -- INV-2025-0001
  INSERT INTO invoices (invoice_no, client_id, client_name, status, issue_date, due_date, subtotal, tax_rate, tax_amount, total, currency, notes, paid_date)
  VALUES ('INV-2025-0001', c1, 'African Edge Capital',  'paid',    '2025-01-10', '2025-02-09', 739130, 15, 110870, 850000, 'ZAR', 'AI Strategy Consulting — Phase 1', '2025-01-28');

  -- INV-2025-0002
  INSERT INTO invoices (invoice_no, client_id, client_name, status, issue_date, due_date, subtotal, tax_rate, tax_amount, total, currency, notes, paid_date)
  VALUES ('INV-2025-0002', c5, 'The Vault ZA',          'paid',    '2025-01-20', '2025-02-19', 1913043, 15, 286957, 2200000, 'ZAR', '50% deposit — Web App + AI Engine', '2025-02-05');

  -- INV-2025-0003
  INSERT INTO invoices (invoice_no, client_id, client_name, status, issue_date, due_date, subtotal, tax_rate, tax_amount, total, currency, notes)
  VALUES ('INV-2025-0003', c2, 'Greenleaf Solutions',   'sent',    '2025-02-15', '2025-03-17', 3043478, 15, 456522, 3500000, 'ZAR', 'Custom AI Model Development — Full project');

  -- INV-2025-0004
  INSERT INTO invoices (invoice_no, client_id, client_name, status, issue_date, due_date, subtotal, tax_rate, tax_amount, total, currency, notes, paid_date)
  VALUES ('INV-2025-0004', c1, 'African Edge Capital',  'paid',    '2025-02-01', '2025-03-03', 434783, 15, 65217, 500000, 'ZAR', 'Monthly AI Retainer — February', '2025-02-10');

  -- INV-2025-0005
  INSERT INTO invoices (invoice_no, client_id, client_name, status, issue_date, due_date, subtotal, tax_rate, tax_amount, total, currency, notes)
  VALUES ('INV-2025-0005', c3, 'Nova Build Group',      'overdue', '2025-02-20', '2025-03-22', 652174, 15, 97826, 750000, 'ZAR', 'UI/UX Design Package');

  -- INV-2025-0006
  INSERT INTO invoices (invoice_no, client_id, client_name, status, issue_date, due_date, subtotal, tax_rate, tax_amount, total, currency, notes, paid_date)
  VALUES ('INV-2025-0006', c5, 'The Vault ZA',          'paid',    '2025-03-01', '2025-03-31', 1913043, 15, 286957, 2200000, 'ZAR', 'Remaining balance — Web App delivery', '2025-03-18');

  -- INV-2025-0007
  INSERT INTO invoices (invoice_no, client_id, client_name, status, issue_date, due_date, subtotal, tax_rate, tax_amount, total, currency, notes)
  VALUES ('INV-2025-0007', c6, 'Simba Safaris',         'sent',    '2025-03-15', '2025-04-14', 678261, 15, 101739, 780000, 'ZAR', 'Booking Platform Redesign — deposit');

  -- INV-2025-0008
  INSERT INTO invoices (invoice_no, client_id, client_name, status, issue_date, due_date, subtotal, tax_rate, tax_amount, total, currency, notes, paid_date)
  VALUES ('INV-2025-0008', c1, 'African Edge Capital',  'paid',    '2025-03-01', '2025-03-31', 434783, 15, 65217, 500000, 'ZAR', 'Monthly AI Retainer — March', '2025-03-08');

END $$;


-- ── Invoice Items ────────────────────────────────────────────
DO $$
DECLARE
  inv1 uuid; inv2 uuid; inv3 uuid; inv4 uuid; inv5 uuid; inv6 uuid; inv7 uuid; inv8 uuid;
BEGIN
  SELECT id INTO inv1 FROM invoices WHERE invoice_no = 'INV-2025-0001' LIMIT 1;
  SELECT id INTO inv2 FROM invoices WHERE invoice_no = 'INV-2025-0002' LIMIT 1;
  SELECT id INTO inv3 FROM invoices WHERE invoice_no = 'INV-2025-0003' LIMIT 1;
  SELECT id INTO inv4 FROM invoices WHERE invoice_no = 'INV-2025-0004' LIMIT 1;
  SELECT id INTO inv5 FROM invoices WHERE invoice_no = 'INV-2025-0005' LIMIT 1;
  SELECT id INTO inv6 FROM invoices WHERE invoice_no = 'INV-2025-0006' LIMIT 1;
  SELECT id INTO inv7 FROM invoices WHERE invoice_no = 'INV-2025-0007' LIMIT 1;
  SELECT id INTO inv8 FROM invoices WHERE invoice_no = 'INV-2025-0008' LIMIT 1;

  INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total) VALUES
    (inv1, 'AI Strategy Workshop (2 days)',       1, 450000, 450000),
    (inv1, 'Written AI Roadmap & Report',         1, 289130, 289130),

    (inv2, 'Web Application Development',         1, 1500000, 1500000),
    (inv2, 'AI Recommendations Engine',           1,  413043,  413043),

    (inv3, 'Data Collection & Preprocessing',     1,  652174,  652174),
    (inv3, 'Model Training & Validation',         1, 1304348, 1304348),
    (inv3, 'API Integration & Deployment',        1, 1086956, 1086956),

    (inv4, 'AI Retainer — February 2025',         1,  434783,  434783),

    (inv5, 'UX Research & Wireframes',            1,  260870,  260870),
    (inv5, 'High-Fidelity Figma Designs',         1,  391304,  391304),

    (inv6, 'Web Application — Final Delivery',    1, 1304348, 1304348),
    (inv6, 'QA Testing & Handover Session',       1,  608695,  608695),

    (inv7, 'Booking Platform — Phase 1 Deposit',  1,  678261,  678261),

    (inv8, 'AI Retainer — March 2025',            1,  434783,  434783);
END $$;


-- ── Projects ─────────────────────────────────────────────────
INSERT INTO projects (title, client_name, status, priority, due_date, description) VALUES
  ('Vault ZA E-Commerce Rebuild',       'The Vault ZA',         'completed',   'high',   '2025-03-28', 'Full Next.js rebuild with AI product recommendations engine.'),
  ('African Edge AI Retainer Q2',       'African Edge Capital', 'in-progress', 'high',   '2025-06-30', 'Ongoing model monitoring, quarterly retraining, and support.'),
  ('Greenleaf AI Model Development',    'Greenleaf Solutions',  'in-progress', 'high',   '2025-07-15', 'Custom sustainability scoring model trained on ESG datasets.'),
  ('Nova Build UX Redesign',            'Nova Build Group',     'in-progress', 'medium', '2025-05-20', 'UX overhaul of client portal and project tracking dashboard.'),
  ('Simba Safaris Booking Platform',    'Simba Safaris',        'planning',    'medium', '2025-06-01', 'Modern booking system with AI upsell suggestions for add-ons.'),
  ('Deluxify Internal CRM',             'Internal',             'completed',   'high',   '2025-04-01', 'Build and ship internal CRM and operations platform.'),
  ('Mediscan AI Diagnostics Scoping',   'Mediscan Health',      'planning',    'low',    '2025-05-10', 'Discovery and scoping phase for AI-assisted diagnostics tool.')
ON CONFLICT DO NOTHING;


-- ── Bookings ─────────────────────────────────────────────────
INSERT INTO bookings (name, email, company, topic, date, time, status, amount_paid, reference) VALUES
  ('Sipho Khumalo',    'sipho@africanedge.co.za',     'African Edge Capital',  'AI Retainer Q2 Kickoff',         '2025-04-16', '10:00', 'confirmed', 0,    'BK-2025-001'),
  ('Nomvula Mokoena',  'nomvula@greenleafsa.co.za',   'Greenleaf Solutions',   'Model Training Progress Update', '2025-04-17', '14:00', 'confirmed', 0,    'BK-2025-002'),
  ('Ravi Naidoo',      'ravi@mediscanhealth.com',     'Mediscan Health',       'AI Diagnostics Discovery Call',  '2025-04-18', '09:30', 'confirmed', 0,    'BK-2025-003'),
  ('Zanele Sithole',   'zanele@simbasafaris.co.za',   'Simba Safaris',         'Booking Platform Demo',          '2025-04-21', '11:00', 'pending',   0,    'BK-2025-004'),
  ('Dean Ferreira',    'dean@novabuild.co.za',        'Nova Build Group',      'UX Design Review',               '2025-04-22', '15:00', 'confirmed', 0,    'BK-2025-005'),
  ('Thandeka Zulu',    'thandeka@luxehomesza.com',    'Luxe Homes ZA',         'Proposal Walkthrough',           '2025-04-23', '10:00', 'pending',   0,    'BK-2025-006'),
  ('Marcus van Rooyen','marcus@thevaultza.com',       'The Vault ZA',          'Post-launch Review',             '2025-03-30', '13:00', 'confirmed', 2500, 'BK-2025-007'),
  ('Ayesha Osman',     'ayesha@digitalrootssa.com',   'Digital Roots SA',      'Intro Discovery Call',           '2025-04-02', '16:00', 'confirmed', 0,    'BK-2025-008')
ON CONFLICT DO NOTHING;


-- ── Content Posts ────────────────────────────────────────────
INSERT INTO content_posts (title, body, platform, status, scheduled_at, tags, assigned_to, notes) VALUES
  (
    'How AI is Transforming South African Business',
    'From logistics to finance, South African businesses are embracing AI to cut costs and unlock new revenue streams. Here''s what we''ve seen working on the ground with our clients. 🧵',
    'linkedin',
    'published',
    NULL,
    ARRAY['AI', 'SouthAfrica', 'Business'],
    'thabo@deluxify.ai',
    'High engagement post. Boost with paid.'
  ),
  (
    '5 Signs Your Business Needs an AI Strategy Now',
    'Still running manual reports? Losing leads to competitors? Here are 5 clear signals it''s time to build your AI roadmap — and how we can help.',
    'instagram',
    'scheduled',
    '2025-04-20 09:00:00+02',
    ARRAY['AIStrategy', 'Deluxify', 'Growth'],
    'thabo@deluxify.ai',
    'Pair with carousel graphic from Aisha.'
  ),
  (
    'Behind the Build: Vault ZA AI Recommendations',
    'We shipped a custom AI product recommendations engine for @TheVaultZA. Here''s a quick thread on how we built it, what we learned, and the results after 30 days.',
    'twitter',
    'published',
    NULL,
    ARRAY['CaseStudy', 'AI', 'Ecommerce'],
    'katleho@deluxify.ai',
    NULL
  ),
  (
    'Case Study: Greenleaf AI Sustainability Scoring',
    'We''re building a bespoke ESG scoring model for Greenleaf Solutions. When done, this will process thousands of data points to generate real-time sustainability scores.',
    'linkedin',
    'draft',
    NULL,
    ARRAY['ESG', 'AI', 'Sustainability'],
    'aisha@deluxify.ai',
    'Needs client approval before publishing.'
  ),
  (
    'Deluxify April Showcase',
    'April has been incredible. New clients, shipped products, and some exciting projects in the pipeline. Swipe to see what the team has been building ✨',
    'instagram',
    'scheduled',
    '2025-04-30 10:00:00+02',
    ARRAY['TeamUpdate', 'Deluxify', 'AI'],
    'thabo@deluxify.ai',
    'End of month recap carousel — 8 slides.'
  ),
  (
    'We''re hiring: Senior AI Engineer',
    'Deluxify AI is growing. We''re looking for a Senior ML Engineer to join our Johannesburg team. DM or visit deluxify.ai/careers.',
    'twitter',
    'draft',
    NULL,
    ARRAY['Hiring', 'AI', 'Jobs'],
    'katleho@deluxify.ai',
    'Hold until role is officially open.'
  )
ON CONFLICT DO NOTHING;


-- ── Subscriptions ────────────────────────────────────────────
DO $$
DECLARE
  c1  uuid; c3  uuid; c5  uuid; c6  uuid; c7  uuid;
  s1  uuid; s2  uuid; s3  uuid; s4  uuid; s5  uuid; s6  uuid;
BEGIN
  SELECT id INTO c1 FROM clients WHERE email = 'sipho@africanedge.co.za'     LIMIT 1;
  SELECT id INTO c3 FROM clients WHERE email = 'dean@novabuild.co.za'        LIMIT 1;
  SELECT id INTO c5 FROM clients WHERE email = 'marcus@thevaultza.com'       LIMIT 1;
  SELECT id INTO c6 FROM clients WHERE email = 'zanele@simbasafaris.co.za'   LIMIT 1;
  SELECT id INTO c7 FROM clients WHERE email = 'ravi@mediscanhealth.com'     LIMIT 1;

  -- 1. African Edge Capital — Monthly AI Retainer (active)
  INSERT INTO subscriptions (client_id, client_name, client_email, plan_name, amount, billing_day, start_date, next_billing_date, status, notes)
  VALUES (c1, 'African Edge Capital', 'sipho@africanedge.co.za', 'Monthly AI Retainer', 500000, 1, '2025-01-01', '2026-05-01', 'active', 'Includes model monitoring, monthly retraining, and priority support.')
  RETURNING id INTO s1;

  -- 2. The Vault ZA — Digital Marketing Retainer (active)
  INSERT INTO subscriptions (client_id, client_name, client_email, plan_name, amount, billing_day, start_date, next_billing_date, status, notes)
  VALUES (c5, 'The Vault ZA', 'marcus@thevaultza.com', 'Digital Marketing Retainer', 350000, 5, '2025-03-05', '2026-05-05', 'active', 'Monthly social media strategy, content calendar, and paid campaign management.')
  RETURNING id INTO s2;

  -- 3. Simba Safaris — CRM & Support Retainer (active)
  INSERT INTO subscriptions (client_id, client_name, client_email, plan_name, amount, billing_day, start_date, next_billing_date, status, notes)
  VALUES (c6, 'Simba Safaris', 'zanele@simbasafaris.co.za', 'CRM & Support Retainer', 250000, 1, '2025-04-01', '2026-05-01', 'active', 'Monthly helpdesk, CRM updates, and automation maintenance.')
  RETURNING id INTO s3;

  -- 4. Mediscan Health — AI Platform Retainer (paused)
  INSERT INTO subscriptions (client_id, client_name, client_email, plan_name, amount, billing_day, start_date, next_billing_date, status, notes)
  VALUES (c7, 'Mediscan Health', 'ravi@mediscanhealth.com', 'AI Platform Retainer', 1200000, 20, '2025-02-20', '2026-05-20', 'paused', 'Paused pending contract renewal. Resume in May 2026.')
  RETURNING id INTO s4;

  -- 5. Nova Build Group — Monthly Reporting (cancelled)
  INSERT INTO subscriptions (client_id, client_name, client_email, plan_name, amount, billing_day, start_date, next_billing_date, status, notes)
  VALUES (c3, 'Nova Build Group', 'dean@novabuild.co.za', 'Monthly Reporting & Analytics', 180000, 10, '2025-01-10', '2026-05-10', 'cancelled', 'Cancelled Feb 2026. Client handling reporting in-house.')
  RETURNING id INTO s5;

  -- 6. Digital Roots SA — SEO & Content (active, no client record)
  INSERT INTO subscriptions (client_id, client_name, client_email, plan_name, amount, billing_day, start_date, next_billing_date, status, notes)
  VALUES (NULL, 'Digital Roots SA', 'ayesha@digitalrootssa.com', 'SEO & Content Package', 280000, 15, '2025-06-15', '2026-05-15', 'active', 'Monthly SEO audits, 4 blog posts, and performance reporting.')
  RETURNING id INTO s6;


  -- ── Subscription Payments ──────────────────────────────────

  -- African Edge Capital — Jan–Apr 2026 (3 paid, 1 pending)
  INSERT INTO subscription_payments (subscription_id, billing_month, invoice_no, amount, status, paid_at, email_sent_at) VALUES
    (s1, '2026-01', 'INV-0010', 500000, 'paid',    '2026-01-03T08:15:00Z', '2026-01-03T08:00:00Z'),
    (s1, '2026-02', 'INV-0013', 500000, 'paid',    '2026-02-02T09:30:00Z', '2026-02-01T08:00:00Z'),
    (s1, '2026-03', 'INV-0017', 500000, 'paid',    '2026-03-04T10:00:00Z', '2026-03-01T08:00:00Z'),
    (s1, '2026-04', 'INV-0021', 500000, 'pending', NULL,                   '2026-04-01T08:00:00Z');

  -- The Vault ZA — Feb–Apr 2026 (2 paid, 1 pending)
  INSERT INTO subscription_payments (subscription_id, billing_month, invoice_no, amount, status, paid_at, email_sent_at) VALUES
    (s2, '2026-02', 'INV-0014', 350000, 'paid',    '2026-02-07T11:00:00Z', '2026-02-05T08:00:00Z'),
    (s2, '2026-03', 'INV-0018', 350000, 'paid',    '2026-03-06T09:45:00Z', '2026-03-05T08:00:00Z'),
    (s2, '2026-04', 'INV-0022', 350000, 'pending', NULL,                   NULL);

  -- Simba Safaris — Mar–Apr 2026 (1 paid, 1 pending)
  INSERT INTO subscription_payments (subscription_id, billing_month, invoice_no, amount, status, paid_at, email_sent_at) VALUES
    (s3, '2026-03', 'INV-0019', 250000, 'paid',    '2026-03-03T14:00:00Z', '2026-03-01T08:00:00Z'),
    (s3, '2026-04', 'INV-0023', 250000, 'pending', NULL,                   '2026-04-01T08:00:00Z');

  -- Digital Roots SA — Mar 2026 paid, Apr 2026 failed
  INSERT INTO subscription_payments (subscription_id, billing_month, invoice_no, amount, status, paid_at, email_sent_at) VALUES
    (s6, '2026-03', 'INV-0020', 280000, 'paid',    '2026-03-17T16:30:00Z', '2026-03-15T08:00:00Z'),
    (s6, '2026-04', 'INV-0024', 280000, 'failed',  NULL,                   '2026-04-15T08:00:00Z');

END $$;
