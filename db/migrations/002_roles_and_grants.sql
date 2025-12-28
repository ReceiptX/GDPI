-- GDPI production hardening: least-privilege roles and grants
-- NOTE: Run as the database owner/admin.
-- Replace PASSWORD placeholders before running.

BEGIN;

-- Roles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'gdpi_app') THEN
    CREATE ROLE gdpi_app LOGIN;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'gdpi_readonly') THEN
    CREATE ROLE gdpi_readonly LOGIN;
  END IF;
END $$;

-- Set passwords (edit before running)
-- ALTER ROLE gdpi_app PASSWORD 'REPLACE_ME_STRONG_PASSWORD';
-- ALTER ROLE gdpi_readonly PASSWORD 'REPLACE_ME_STRONG_PASSWORD';

-- Restrict default privileges in schema
REVOKE ALL ON SCHEMA gdpi FROM PUBLIC;
GRANT USAGE ON SCHEMA gdpi TO gdpi_app, gdpi_readonly;

-- Tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA gdpi TO gdpi_app;
GRANT SELECT ON ALL TABLES IN SCHEMA gdpi TO gdpi_readonly;

-- Sequences (if any exist now or are added later)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA gdpi TO gdpi_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA gdpi TO gdpi_readonly;

-- Functions (trigger functions still require EXECUTE for the invoker)
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA gdpi TO gdpi_app;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA gdpi TO gdpi_readonly;

-- Ensure future tables get the same privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA gdpi GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO gdpi_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA gdpi GRANT SELECT ON TABLES TO gdpi_readonly;

-- Sequences (if added later)
ALTER DEFAULT PRIVILEGES IN SCHEMA gdpi GRANT USAGE, SELECT ON SEQUENCES TO gdpi_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA gdpi GRANT USAGE, SELECT ON SEQUENCES TO gdpi_readonly;

-- Functions (if added later)
ALTER DEFAULT PRIVILEGES IN SCHEMA gdpi GRANT EXECUTE ON FUNCTIONS TO gdpi_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA gdpi GRANT EXECUTE ON FUNCTIONS TO gdpi_readonly;

COMMIT;
