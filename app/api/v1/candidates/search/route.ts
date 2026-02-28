import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.userType !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const expertise = searchParams.get('expertise');
    const skill = searchParams.get('skill');
    const minScore = searchParams.get('minScore');

    const candidates = await prisma.candidate.findMany({
      where: {
        onboardingTestPassed: true,
        ...(expertise && { expertise }),
        ...(skill && { skills: { has: skill } }),
        ...(minScore && { onboardingTestScore: { gte: parseInt(minScore) } }),
      },
      select: {
        id: true, name: true, email: true, phone: true,
        country: true, city: true, expertise: true, skills: true,
        personalStatement: true, onboardingTestScore: true,
        highestQualification: true, university: true, degree: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ candidates }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to search candidates' },
      { status: 500 }
    );
  }
}
