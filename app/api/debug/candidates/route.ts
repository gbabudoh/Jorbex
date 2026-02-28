import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const name = searchParams.get('name');

    const candidates = await prisma.candidate.findMany({
      where: {
        ...(email && { email: email.toLowerCase().trim() }),
        ...(name && { name: { contains: name, mode: 'insensitive' } }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        expertise: true,
        onboardingTestPassed: true,
        onboardingTestScore: true,
        createdAt: true,
      },
      take: 20,
    });

    return NextResponse.json({ count: candidates.length, candidates }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch candidates';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
