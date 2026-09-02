import { NextResponse } from 'next/server';

import { db } from '~/server/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const checkDb = searchParams.get('db') === 'true';

  if (!checkDb) {
    // ping for Better Stack monitor
    return NextResponse.json({ status: 'ok', app: 'healthy' }, { status: 200 });
  }

  try {
    // ping to database
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json(
      { status: 'ok', app: 'healthy', database: 'healthy' },
      { status: 200, headers: { 'Cache-Control': 'no-store, max-age=0' } },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: 'error', message: 'Database unreachable' },
      { status: 503, headers: { 'Cache-Control': 'no-store, max-age=0' } },
    );
  }
}
