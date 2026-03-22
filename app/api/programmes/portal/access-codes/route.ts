import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)])
    .join('')
    .replace(/(.{4})/g, '$1-')
    .slice(0, -1); // e.g. ABCD-EFGH-IJKL
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { userType, portalId } = session.user;
    if (userType !== 'portal_gov') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (!portalId) return NextResponse.json({ error: 'No portal in session' }, { status: 400 });

    const codes = await prisma.programmeAccessCode.findMany({
      where: { portalId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ codes });
  } catch (error) {
    console.error('Access codes fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { userType, portalId } = session.user;
    if (userType !== 'portal_gov') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (!portalId) return NextResponse.json({ error: 'No portal in session' }, { status: 400 });

    const body = await request.json();
    const { label, expiresAt } = body;

    const code = await prisma.programmeAccessCode.create({
      data: {
        portalId,
        code: generateCode(),
        label: label?.trim() || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true,
      },
    });

    return NextResponse.json({ code }, { status: 201 });
  } catch (error) {
    console.error('Access code create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { userType, portalId } = session.user;
    if (userType !== 'portal_gov') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { id, isActive } = body;
    if (!id) return NextResponse.json({ error: 'Code id required' }, { status: 400 });

    // Ensure code belongs to this portal
    const existing = await prisma.programmeAccessCode.findFirst({ where: { id, portalId } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const updated = await prisma.programmeAccessCode.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json({ code: updated });
  } catch (error) {
    console.error('Access code update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
