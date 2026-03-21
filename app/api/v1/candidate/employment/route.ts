import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/v1/candidate/employment
// Returns all employment records for the logged-in candidate
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.userType !== 'candidate') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawRecords = await prisma.employmentRecord.findMany({
      where: { candidateId: session.user.id },
      include: {
        employer: { select: { companyName: true } },
        offer: {
          select: {
            token:    true,
            salary:   true,
            currency: true,
            job:      { select: { title: true } },
          },
        },
        payslips: {
          orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }],
          select: {
            id:          true,
            periodMonth: true,
            periodYear:  true,
            grossPay:    true,
            netPay:      true,
            status:      true,
            pdfUrl:      true,
            createdAt:   true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const records = rawRecords.map(r => ({
      id:            r.id,
      jobTitle:      r.offer.job?.title ?? 'Position',
      companyName:   r.employer.companyName,
      salary:        r.offer.salary,
      currency:      r.currency,
      startDate:     r.startDate,
      endDate:       r.endDate,
      eorStatus:     r.status,
      contractToken: r.offer.token,
      payslips:      r.payslips.map(p => ({
        id:        p.id,
        period:    `${new Date(0, p.periodMonth - 1).toLocaleString('en-US', { month: 'long' })} ${p.periodYear}`,
        grossPay:  p.grossPay,
        netPay:    p.netPay,
        status:    p.status,
        pdfUrl:    p.pdfUrl,
        createdAt: p.createdAt,
      })),
    }));

    return NextResponse.json({ records });

  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
