import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { userType, portalId } = session.user;
    if (!['portal_user', 'portal_gov'].includes(userType))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (!portalId) return NextResponse.json({ error: 'No portal in session' }, { status: 400 });

    const members = await prisma.programmeMember.findMany({
      where: {
        programme: { portalId },
      },
      include: {
        candidate: { select: { id: true, name: true, email: true, expertise: true, country: true } },
        programme: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Members fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
