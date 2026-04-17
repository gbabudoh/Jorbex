import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.userType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [pendingEnquiries, totalEnquiries, activePortals, totalPortals] = await Promise.all([
      prisma.programmeEnquiry.count({ where: { status: 'PENDING' } }),
      prisma.programmeEnquiry.count(),
      prisma.programmePortal.count({ where: { status: 'ACTIVE' } }),
      prisma.programmePortal.count(),
    ]);

    return NextResponse.json({
      pendingEnquiries,
      totalEnquiries,
      activePortals,
      totalPortals,
    });
  } catch (error) {
    console.error('Admin programmes stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
