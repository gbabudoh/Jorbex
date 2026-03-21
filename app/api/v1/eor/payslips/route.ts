import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/v1/eor/payslips
// Candidate: returns all their payslips
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.userType !== 'candidate') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payslips = await prisma.payslip.findMany({
      where: { candidateId: session.user.id },
      include: {
        employmentRecord: {
          include: {
            employer: { select: { id: true, companyName: true, country: true } },
            offer:    { select: { job: { select: { title: true } } } },
          },
        },
      },
      orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }],
    });

    // Latest employment record for the summary banner
    const activeRecord = await prisma.employmentRecord.findFirst({
      where: {
        candidateId: session.user.id,
        status: { in: ['ACTIVE', 'ONBOARDING'] },
      },
      include: {
        employer: { select: { companyName: true } },
        offer:    { select: { job: { select: { title: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ payslips, activeRecord });

  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
