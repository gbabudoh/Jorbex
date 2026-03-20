import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Cron: runs daily — hard-deletes interviews archived by candidate more than 30 days ago
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get('secret') !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const { count } = await prisma.interview.deleteMany({
    where: {
      candidateArchivedAt: { not: null, lt: thirtyDaysAgo },
    },
  });

  return NextResponse.json({ purged: count });
}
