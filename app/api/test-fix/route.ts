import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // This was a MongoDB-specific debug route. With Prisma/PostgreSQL, 
    // direct raw updates are done differently. Keeping as a simple debug endpoint.
    const candidates = await prisma.candidate.findMany({
      take: 5,
      select: { id: true, name: true, country: true, city: true },
    });

    return NextResponse.json({
      success: true,
      database: 'PostgreSQL (Prisma)',
      sampleCandidates: candidates,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[DEBUG ERROR]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
