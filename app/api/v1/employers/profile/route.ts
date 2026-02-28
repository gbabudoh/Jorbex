import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.userType !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const employerRaw = await prisma.employer.findUnique({
      where: { id: session.user.id },
    });

    if (!employerRaw) {
      return NextResponse.json({ error: 'Employer not found' }, { status: 404 });
    }

    const { password: _, ...employer } = employerRaw;

    return NextResponse.json(employer, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.userType !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, companyName, phone, country, city } = body;

    const employerRaw = await prisma.employer.update({
      where: { id: session.user.id },
      data: {
        ...(name && { name }),
        ...(companyName && { companyName }),
        ...(phone && { phone }),
        ...(country && { country }),
        ...(city && { city }),
      },
    });

    const { password: _, ...employer } = employerRaw;

    return NextResponse.json(employer, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update profile' },
      { status: 500 }
    );
  }
}
