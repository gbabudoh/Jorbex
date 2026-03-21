import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/programmes/[id]/jobs
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.userType !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;

    const programme = await prisma.programme.findFirst({ where: { id, ownerId: session.user.id } });
    if (!programme) return NextResponse.json({ error: 'Programme not found' }, { status: 404 });

    const programmeJobs = await prisma.programmeJob.findMany({
      where: { programmeId: id },
      include: {
        job: {
          include: { _count: { select: { applications: true } } },
        },
      },
      orderBy: { addedAt: 'desc' },
    });

    return NextResponse.json({ jobs: programmeJobs.map(pj => ({ ...pj.job, addedAt: pj.addedAt })) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch jobs';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/programmes/[id]/jobs — add a job to this programme
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.userType !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const { jobId } = await request.json();
    if (!jobId) return NextResponse.json({ error: 'jobId required' }, { status: 400 });

    // Confirm programme + job both belong to this employer
    const [programme, job] = await Promise.all([
      prisma.programme.findFirst({ where: { id, ownerId: session.user.id } }),
      prisma.job.findFirst({ where: { id: jobId, employerId: session.user.id } }),
    ]);
    if (!programme) return NextResponse.json({ error: 'Programme not found' }, { status: 404 });
    if (!job)       return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    const programmeJob = await prisma.programmeJob.upsert({
      where: { programmeId_jobId: { programmeId: id, jobId } },
      update: {},
      create: { programmeId: id, jobId },
    });

    return NextResponse.json({ programmeJob }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to add job';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/programmes/[id]/jobs?jobId=xxx
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.userType !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    if (!jobId) return NextResponse.json({ error: 'jobId required' }, { status: 400 });

    const programme = await prisma.programme.findFirst({ where: { id, ownerId: session.user.id } });
    if (!programme) return NextResponse.json({ error: 'Programme not found' }, { status: 404 });

    await prisma.programmeJob.deleteMany({ where: { programmeId: id, jobId } });
    return NextResponse.json({ message: 'Job removed from programme' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to remove job';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
