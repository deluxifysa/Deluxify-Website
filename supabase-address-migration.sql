-- Add address to clients table
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS address TEXT;

-- Add client phone, address, and project_name to invoices table
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS client_phone   VARCHAR(50),
  ADD COLUMN IF NOT EXISTS client_address TEXT,
  ADD COLUMN IF NOT EXISTS project_name   TEXT;
