import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const view = searchParams.get('view') || 'tests';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  if (view === 'results') {
    const [results, total] = await Promise.all([
      prisma.testResult.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          candidate: { select: { name: true, email: true } },
          test: { select: { title: true, testType: true } },
        },
      }),
      prisma.testResult.count(),
    ]);
    return NextResponse.json({ results, total, page, limit });
  }

  const [tests, total] = await Promise.all([
    prisma.aptitudeTest.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        employer: { select: { companyName: true } },
        _count: { select: { questions: true, results: true } },
      },
    }),
    prisma.aptitudeTest.count(),
  ]);

  return NextResponse.json({ tests, total, page, limit });
}
