import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const status = searchParams.get('status') || '';

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        candidate: { select: { name: true, email: true } },
        employer: { select: { companyName: true } },
        job: { select: { title: true } },
      },
    }),
    prisma.application.count({ where }),
  ]);

  return NextResponse.json({ applications, total, page, limit });
}
