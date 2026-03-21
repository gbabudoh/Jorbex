import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/programmes/[id]/members
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.userType !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;

    const programme = await prisma.programme.findFirst({ where: { id, ownerId: session.user.id } });
    if (!programme) return NextResponse.json({ error: 'Programme not found' }, { status: 404 });

    const members = await prisma.programmeMember.findMany({
      where: { programmeId: id },
      include: {
        candidate: {
          select: {
            id: true, name: true, email: true, phone: true,
            expertise: true, skills: true, university: true,
            onboardingTestPassed: true, onboardingTestScore: true,
            country: true, city: true, createdAt: true,
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    return NextResponse.json({ members });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch members';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/programmes/[id]/members — employer adds a candidate directly
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.userType !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const { candidateId } = await request.json();

    if (!candidateId) return NextResponse.json({ error: 'candidateId required' }, { status: 400 });

    const programme = await prisma.programme.findFirst({ where: { id, ownerId: session.user.id } });
    if (!programme) return NextResponse.json({ error: 'Programme not found' }, { status: 404 });

    // Check capacity
    if (programme.maxParticipants) {
      const count = await prisma.programmeMember.count({ where: { programmeId: id, status: 'ACTIVE' } });
      if (count >= programme.maxParticipants) {
        return NextResponse.json({ error: 'Programme is at capacity' }, { status: 409 });
      }
    }

    const member = await prisma.programmeMember.upsert({
      where: { programmeId_candidateId: { programmeId: id, candidateId } },
      update: { status: 'ACTIVE' },
      create: { programmeId: id, candidateId, status: 'ACTIVE' },
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to add member';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/programmes/[id]/members?candidateId=xxx
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.userType !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get('candidateId');
    if (!candidateId) return NextResponse.json({ error: 'candidateId required' }, { status: 400 });

    const programme = await prisma.programme.findFirst({ where: { id, ownerId: session.user.id } });
    if (!programme) return NextResponse.json({ error: 'Programme not found' }, { status: 404 });

    await prisma.programmeMember.updateMany({
      where: { programmeId: id, candidateId },
      data: { status: 'REMOVED' },
    });

    return NextResponse.json({ message: 'Member removed' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to remove member';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
