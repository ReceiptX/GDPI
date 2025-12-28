# GDPI Database

This repo uses **Neon Postgres**.

## Environments

- **Production** (Neon branch `production`): should contain the `gdpi` schema.
- **Development**: create a branch from production (recommended) or apply the migrations below.

## Migrations

Migrations live in `db/migrations/`.

### Apply (manual)

1. Connect to your Neon database as an owner/admin role.
2. Run the SQL files in order:

- `001_init_gdpi_schema.sql`
- `002_roles_and_grants.sql` (optional but recommended)

## Notes

- These migrations are **idempotent** where practical.
- For production deployments, prefer setting secrets as **managed environment variables** (Netlify/Vercel/CI) rather than committing `.env` files.
