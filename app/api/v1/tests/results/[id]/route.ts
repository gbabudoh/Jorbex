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

    if (!session || !session.user || session.user.userType !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const employerId = session.user.id;

    if (!employerId) {
      return NextResponse.json({ error: 'Invalid session: Employer ID missing' }, { status: 400 });
    }

    const result = await prisma.testResult.findFirst({
      where: { id, employerId },
      include: {
        candidate: { select: { name: true, email: true, expertise: true } },
        test: { select: { title: true, description: true, questions: true } },
        answers: true,
      },
    });

    if (!result) {
      return NextResponse.json({ error: 'Result not found' }, { status: 404 });
    }

    return NextResponse.json({ result }, { status: 200 });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to fetch result details';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
