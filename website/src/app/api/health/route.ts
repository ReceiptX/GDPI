import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  const sql = db();

  const startedAt = Date.now();
  await sql`SELECT 1 as ok`;

  return NextResponse.json({
    ok: true,
    db: 'connected',
    ms: Date.now() - startedAt,
  });
}
