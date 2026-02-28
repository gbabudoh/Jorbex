import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userType = session.user.userType;
    const userId = session.user.id;

    if (userType === 'employer') {
      let preferences = await prisma.employerNotificationPreference.findUnique({
        where: { employerId: userId },
      });
      if (!preferences) {
        preferences = await prisma.employerNotificationPreference.create({
          data: { employerId: userId },
        });
      }
      return NextResponse.json({ preferences }, { status: 200 });
    } else {
      let preferences = await prisma.candidateNotificationPreference.findUnique({
        where: { candidateId: userId },
      });
      if (!preferences) {
        preferences = await prisma.candidateNotificationPreference.create({
          data: { candidateId: userId },
        });
      }
      return NextResponse.json({ preferences }, { status: 200 });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch preferences';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();
    const userType = session.user.userType;
    const userId = session.user.id;

    if (userType === 'employer') {
      const preferences = await prisma.employerNotificationPreference.upsert({
        where: { employerId: userId },
        update: updates,
        create: { employerId: userId, ...updates },
      });
      return NextResponse.json({ preferences }, { status: 200 });
    } else {
      const preferences = await prisma.candidateNotificationPreference.upsert({
        where: { candidateId: userId },
        update: updates,
        create: { candidateId: userId, ...updates },
      });
      return NextResponse.json({ preferences }, { status: 200 });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update preferences';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
