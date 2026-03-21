import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/v1/offers/[offerId]/tasks — fetch onboarding checklist
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ offerId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { offerId } = await params;

    const tasks = await prisma.onboardingTask.findMany({
      where:   { offerId },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ tasks });
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/v1/offers/[offerId]/tasks — toggle a task complete/incomplete
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ offerId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.userType !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { offerId }  = await params;
    const { taskId, completed } = await req.json();

    if (!taskId) return NextResponse.json({ error: 'taskId required' }, { status: 400 });

    const task = await prisma.onboardingTask.update({
      where: { id: taskId },
      data:  {
        completed,
        completedAt: completed ? new Date() : null,
      },
    });

    return NextResponse.json({ task });
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
