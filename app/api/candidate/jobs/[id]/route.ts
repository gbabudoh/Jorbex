import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.userType !== 'candidate') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        employer: { select: { companyName: true } },
      },
    });

    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    // Check if user already applied
    const application = await prisma.application.findUnique({
      where: { jobId_candidateId: { jobId: id, candidateId: session.user.id } },
    });

    return NextResponse.json({
      job,
      hasApplied: !!application,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch job details';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
