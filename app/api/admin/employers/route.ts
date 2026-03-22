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
  const country = searchParams.get('country') || '';
  const dateFrom = searchParams.get('dateFrom') || '';
  const dateTo = searchParams.get('dateTo') || '';

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { companyName: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (status) where.subscriptionStatus = status;
  if (country) where.country = country;
  if (dateFrom || dateTo) {
    where.createdAt = {
      ...(dateFrom && { gte: new Date(dateFrom) }),
      ...(dateTo && { lte: new Date(new Date(dateTo).setHours(23, 59, 59, 999)) }),
    };
  }

  const [employers, total] = await Promise.all([
    prisma.employer.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, companyName: true,
        phone: true, country: true, city: true, isSuspended: true,
        subscriptionStatus: true, subscriptionStartDate: true, subscriptionEndDate: true,
        createdAt: true, _count: { select: { jobs: true, applications: true } },
      },
    }),
    prisma.employer.count({ where }),
  ]);

  return NextResponse.json({ employers, total, page, limit });
}
