import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { syncSubscriber } from '@/lib/novu';

// POST /api/v1/novu/subscriber
// Called on login / profile update to keep Novu subscriber data current
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: userId, userType } = session.user;

    let name = '';
    let email: string | null = null;
    let phone: string | null = null;

    if (userType === 'employer') {
      const employer = await prisma.employer.findUnique({
        where: { id: userId },
        select: { name: true, email: true, phone: true },
      });
      if (employer) { name = employer.name; email = employer.email; phone = employer.phone; }
    } else if (userType === 'candidate') {
      const candidate = await prisma.candidate.findUnique({
        where: { id: userId },
        select: { name: true, email: true, phone: true },
      });
      if (candidate) { name = candidate.name; email = candidate.email; phone = candidate.phone; }
    }

    if (!name) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await syncSubscriber({ subscriberId: userId, name, email, phone });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
