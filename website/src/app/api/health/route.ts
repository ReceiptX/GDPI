import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  const startedAt = Date.now();

  try {
    const sql = db();
    await sql`SELECT 1 as ok`;

    return NextResponse.json({
      ok: true,
      db: 'connected',
      ms: Date.now() - startedAt,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';

    // Intentionally do not include connection strings or stack traces.
    return NextResponse.json(
      {
        ok: false,
        db: 'error',
        ms: Date.now() - startedAt,
        error: message,
      },
      { status: 500 }
    );
  }
}
