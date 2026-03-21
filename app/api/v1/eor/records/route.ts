import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/v1/eor/records
// Employer: returns all their EmploymentRecords
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.userType !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const records = await prisma.employmentRecord.findMany({
      where: { employerId: session.user.id },
      include: {
        candidate: { select: { id: true, name: true, email: true, country: true, phone: true } },
        offer:     { select: { id: true, salary: true, currency: true, startDate: true, job: { select: { title: true } } } },
        payslips:  {
          orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }],
          take: 1,
          select: {
            id: true, periodMonth: true, periodYear: true,
            grossPay: true, netPay: true, currency: true,
            status: true, disbursedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Summary stats
    const totalMonthlyPayroll = records
      .filter(r => r.status === 'ACTIVE' || r.status === 'ONBOARDING')
      .reduce((sum, r) => sum + r.grossSalary, 0);

    return NextResponse.json({
      records,
      stats: {
        total:               records.length,
        active:              records.filter(r => r.status === 'ACTIVE').length,
        onboarding:          records.filter(r => r.status === 'ONBOARDING').length,
        pending:             records.filter(r => r.status === 'PENDING').length,
        totalMonthlyPayroll,
      },
    });

  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
