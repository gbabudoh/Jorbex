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
  if (status) where.subscriptionStatus = status;

  const [employers, total] = await Promise.all([
    prisma.employer.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, companyName: true, email: true,
        subscriptionStatus: true, subscriptionStartDate: true, subscriptionEndDate: true,
        paystackCustomerCode: true, paystackSubscriptionCode: true,
        createdAt: true,
      },
    }),
    prisma.employer.count({ where }),
  ]);

  return NextResponse.json({ employers, total, page, limit });
}
