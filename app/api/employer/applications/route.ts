import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ApplicationStatus } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!session || (session.user as any).userType !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const employer = await prisma.employer.findUnique({ where: { id: session.user.id } });
    if (!employer) {
      return NextResponse.json({ error: 'Employer not found' }, { status: 404 });
    }

    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const jobId = url.searchParams.get('jobId');

    const applications = await prisma.application.findMany({
      where: {
        employerId: employer.id,
        ...(status && { status: status.toUpperCase() as ApplicationStatus }),
        ...(jobId && { jobId }),
      },
      include: {
        candidate: { select: { name: true, email: true } },
        job: { select: { title: true } },
        testResult: { select: { score: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ applications });
  } catch (error: unknown) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
