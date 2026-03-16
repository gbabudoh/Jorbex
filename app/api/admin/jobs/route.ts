import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';

  const where: Record<string, unknown> = {};
  if (search) where.title = { contains: search, mode: 'insensitive' };
  if (status) where.status = status;

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        employer: { select: { companyName: true, email: true } },
        _count: { select: { applications: true } },
      },
    }),
    prisma.job.count({ where }),
  ]);

  return NextResponse.json({ jobs, total, page, limit });
}
