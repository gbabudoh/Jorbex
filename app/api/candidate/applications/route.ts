import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { notifyNewApplication } from '@/lib/notifications';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.userType !== 'candidate') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const candidate = await prisma.candidate.findUnique({ where: { id: session.user.id } });
    if (!candidate) return NextResponse.json({ error: 'Candidate profile not found' }, { status: 404 });

    const applications = await prisma.application.findMany({
      where: { candidateId: candidate.id },
      include: {
        job: {
          include: {
            employer: { select: { companyName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ applications });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch applications';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.userType !== 'candidate') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobId } = await request.json();
    if (!jobId) return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });

    const candidate = await prisma.candidate.findUnique({ where: { id: session.user.id } });
    if (!candidate) return NextResponse.json({ error: 'Candidate profile not found' }, { status: 404 });

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    // Check if duplicate application
    const existing = await prisma.application.findUnique({
      where: { jobId_candidateId: { jobId, candidateId: candidate.id } },
    });
    if (existing) return NextResponse.json({ error: 'You have already applied for this job' }, { status: 400 });

    const application = await prisma.application.create({
      data: {
        candidateId: candidate.id,
        jobId,
        employerId: job.employerId,
        status: 'APPLIED',
      },
    });

    // Send Notifications
    const employer = await prisma.employer.findUnique({ where: { id: job.employerId } });
    if (employer) {
      await notifyNewApplication(
        candidate.id,
        candidate.email,
        candidate.name,
        employer.id,
        employer.companyName,
        job.title,
        application.id,
        `${process.env.NEXT_PUBLIC_APP_URL}/employer/applications?id=${application.id}`
      );
    }

    return NextResponse.json({ application }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to apply for job';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
