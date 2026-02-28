import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.userType !== 'employer') {
      return NextResponse.json(
        { error: 'Unauthorized. Only employers can view candidate details.' },
        { status: 401 }
      );
    }

    const { id: candidateId } = await params;

    if (!candidateId) {
      return NextResponse.json({ error: 'Candidate ID is required' }, { status: 400 });
    }

    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: {
        workHistory: true,
        references: true,
      },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    if (!candidate.onboardingTestPassed) {
      return NextResponse.json(
        { error: 'This candidate has not completed the onboarding process' },
        { status: 403 }
      );
    }

    // Exclude password from response
    const { password: _, ...candidateData } = candidate;
    return NextResponse.json({ candidate: candidateData }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching candidate:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch candidate details' },
      { status: 500 }
    );
  }
}
