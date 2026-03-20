import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/v1/interviews/archived — candidate's archived interviews (within 30 days)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.userType !== 'candidate') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const interviews = await prisma.interview.findMany({
    where: {
      candidateId: session.user.id,
      candidateArchivedAt: { not: null, gte: thirtyDaysAgo },
      candidateRemovedAt: null,
    },
    include: {
      employer: { select: { id: true, name: true, companyName: true } },
    },
    orderBy: { candidateArchivedAt: 'desc' },
  });

  return NextResponse.json({
    interviews: interviews.map(i => ({
      ...i,
      employerId: i.employer ? { ...i.employer, _id: i.employer.id } : null,
    })),
  });
}
