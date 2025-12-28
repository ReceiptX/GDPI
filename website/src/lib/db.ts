import { neon } from '@neondatabase/serverless';

function getDatabaseUrl(): string {
  const url =
    process.env.DATABASE_URL ??
    process.env.NEON_DATABASE_URL ??
    process.env.NETLIFY_DATABASE_URL ??
    process.env.NETLIFY_DATABASE_URL_UNPOOLED;

  if (!url) {
    throw new Error(
      'Missing database connection string. Set DATABASE_URL (recommended), or NEON_DATABASE_URL / NETLIFY_DATABASE_URL.'
    );
  }

  return url;
}

// Cache across hot reloads in dev.
declare global {
  // eslint-disable-next-line no-var
  var __gdpiSql: ReturnType<typeof neon> | undefined;
}

export function db() {
  if (!globalThis.__gdpiSql) {
    globalThis.__gdpiSql = neon(getDatabaseUrl());
  }

  return globalThis.__gdpiSql;
}
