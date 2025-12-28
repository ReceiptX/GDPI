-- GDPI initial schema (idempotent where practical)
-- Creates schema, tables, indexes, and updated_at triggers.

BEGIN;

-- Needed for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS gdpi;

-- updated_at helper
CREATE OR REPLACE FUNCTION gdpi.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- Organizations (tenants)
CREATE TABLE IF NOT EXISTS gdpi.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'gdpi' AND indexname = 'organizations_slug_uniq'
  ) THEN
    CREATE UNIQUE INDEX organizations_slug_uniq ON gdpi.organizations (slug) WHERE slug IS NOT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_organizations_updated_at'
  ) THEN
    CREATE TRIGGER trg_organizations_updated_at
    BEFORE UPDATE ON gdpi.organizations
    FOR EACH ROW
    EXECUTE FUNCTION gdpi.set_updated_at();
  END IF;
END $$;

-- Users (accounts)
CREATE TABLE IF NOT EXISTS gdpi.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES gdpi.organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'resident',
  pin_hash text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'gdpi' AND indexname = 'users_org_email_uniq'
  ) THEN
    -- case-insensitive uniqueness via expression index
    CREATE UNIQUE INDEX users_org_email_uniq ON gdpi.users (org_id, lower(email));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'gdpi' AND indexname = 'users_org_id_idx'
  ) THEN
    CREATE INDEX users_org_id_idx ON gdpi.users (org_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_users_updated_at'
  ) THEN
    CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON gdpi.users
    FOR EACH ROW
    EXECUTE FUNCTION gdpi.set_updated_at();
  END IF;
END $$;

-- Optional: explicit memberships (if you ever support multi-org users)
CREATE TABLE IF NOT EXISTS gdpi.organization_memberships (
  org_id uuid NOT NULL REFERENCES gdpi.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES gdpi.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'resident',
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (org_id, user_id)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'gdpi' AND indexname = 'organization_memberships_user_id_idx'
  ) THEN
    CREATE INDEX organization_memberships_user_id_idx ON gdpi.organization_memberships (user_id);
  END IF;
END $$;

-- Admin roster (admin-managed allowlist / invites)
CREATE TABLE IF NOT EXISTS gdpi.admin_roster_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES gdpi.organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'resident',
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'gdpi' AND indexname = 'admin_roster_entries_org_email_uniq'
  ) THEN
    CREATE UNIQUE INDEX admin_roster_entries_org_email_uniq ON gdpi.admin_roster_entries (org_id, lower(email));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'gdpi' AND indexname = 'admin_roster_entries_org_id_idx'
  ) THEN
    CREATE INDEX admin_roster_entries_org_id_idx ON gdpi.admin_roster_entries (org_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_admin_roster_entries_updated_at'
  ) THEN
    CREATE TRIGGER trg_admin_roster_entries_updated_at
    BEFORE UPDATE ON gdpi.admin_roster_entries
    FOR EACH ROW
    EXECUTE FUNCTION gdpi.set_updated_at();
  END IF;
END $$;

-- Quotes
CREATE TABLE IF NOT EXISTS gdpi.quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES gdpi.organizations(id) ON DELETE CASCADE,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  job_type text,
  timing text,
  door_setup text,
  quoted_amount numeric,
  verdict text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'gdpi' AND indexname = 'quotes_org_created_at_idx'
  ) THEN
    CREATE INDEX quotes_org_created_at_idx ON gdpi.quotes (org_id, created_at DESC);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_quotes_updated_at'
  ) THEN
    CREATE TRIGGER trg_quotes_updated_at
    BEFORE UPDATE ON gdpi.quotes
    FOR EACH ROW
    EXECUTE FUNCTION gdpi.set_updated_at();
  END IF;
END $$;

-- Quote analyses (AI output)
CREATE TABLE IF NOT EXISTS gdpi.quote_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES gdpi.quotes(id) ON DELETE CASCADE,
  verdict text,
  price_context text,
  red_flags jsonb,
  vendor_questions jsonb,
  next_step text,
  created_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'gdpi' AND indexname = 'quote_analyses_quote_created_at_idx'
  ) THEN
    CREATE INDEX quote_analyses_quote_created_at_idx ON gdpi.quote_analyses (quote_id, created_at DESC);
  END IF;
END $$;

-- Value timeline
CREATE TABLE IF NOT EXISTS gdpi.value_timeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES gdpi.organizations(id) ON DELETE CASCADE,
  occurred_on date NOT NULL,
  title text NOT NULL,
  body text,
  created_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'gdpi' AND indexname = 'value_timeline_events_org_date_idx'
  ) THEN
    CREATE INDEX value_timeline_events_org_date_idx ON gdpi.value_timeline_events (org_id, occurred_on DESC);
  END IF;
END $$;

-- Audit log
CREATE TABLE IF NOT EXISTS gdpi.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES gdpi.organizations(id) ON DELETE CASCADE,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  actor_user_id uuid,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  details jsonb
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'gdpi' AND indexname = 'audit_log_occurred_at_idx'
  ) THEN
    CREATE INDEX audit_log_occurred_at_idx ON gdpi.audit_log (occurred_at DESC);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'gdpi' AND indexname = 'audit_log_entity_idx'
  ) THEN
    CREATE INDEX audit_log_entity_idx ON gdpi.audit_log (org_id, entity_type, entity_id);
  END IF;
END $$;

COMMIT;
