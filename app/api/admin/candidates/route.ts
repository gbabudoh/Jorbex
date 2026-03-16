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
  const expertise = searchParams.get('expertise') || '';

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (expertise) where.expertise = expertise;

  const [candidates, total] = await Promise.all([
    prisma.candidate.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, phone: true, expertise: true,
        skills: true, country: true, city: true, isSuspended: true,
        onboardingTestPassed: true, onboardingTestScore: true,
        createdAt: true, _count: { select: { applications: true } },
      },
    }),
    prisma.candidate.count({ where }),
  ]);

  return NextResponse.json({ candidates, total, page, limit });
}
