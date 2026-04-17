import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.userType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const type = searchParams.get('type') || undefined;

    const enquiries = await prisma.programmeEnquiry.findMany({
      where: {
        ...(status && { status: status as 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED' }),
        ...(type && { type: type as 'GOVERNMENT' | 'UNIVERSITY' | 'CORPORATE' }),
      },
      orderBy: { createdAt: 'desc' },
    });

    const portals = await prisma.programmePortal.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            users: true,
            programmes: true,
          },
        },
      },
    });

    return NextResponse.json({ enquiries, portals });
  } catch (error) {
    console.error('Admin programmes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
