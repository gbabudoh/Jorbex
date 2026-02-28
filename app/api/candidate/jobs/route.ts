import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.userType !== 'candidate') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title');
    const type = searchParams.get('type');
    const location = searchParams.get('location');

    const jobs = await prisma.job.findMany({
      where: {
        status: 'ACTIVE',
        ...(title && { title: { contains: title, mode: 'insensitive' } }),
        ...(type && { type }),
        ...(location && { location: { contains: location, mode: 'insensitive' } }),
      },
      include: {
        employer: { select: { companyName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ jobs });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to search jobs';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
