import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// PATCH /api/v1/interviews/[id]  body: { action: 'archive' | 'remove' }
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.userType !== 'candidate') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { action } = await request.json();

  if (action !== 'archive' && action !== 'remove') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  // Verify the interview belongs to this candidate and is past/cancelled
  const interview = await prisma.interview.findUnique({ where: { id } });
  if (!interview || interview.candidateId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const isPast = new Date(interview.dateTime) <= new Date();
  const isCancelled = interview.status === 'CANCELLED';
  if (!isPast && !isCancelled) {
    return NextResponse.json({ error: 'Can only archive or remove past/cancelled interviews' }, { status: 400 });
  }

  const data = action === 'archive'
    ? { candidateArchivedAt: new Date(), candidateRemovedAt: null }
    : { candidateRemovedAt: new Date(), candidateArchivedAt: null };

  await prisma.interview.update({ where: { id }, data });

  return NextResponse.json({ ok: true });
}
