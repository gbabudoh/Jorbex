import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import prisma from '@/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  const { subscriptionStatus, subscriptionStartDate, subscriptionEndDate } = await req.json();

  const employer = await prisma.employer.update({
    where: { id },
    data: {
      ...(subscriptionStatus && { subscriptionStatus }),
      ...(subscriptionStartDate && { subscriptionStartDate: new Date(subscriptionStartDate) }),
      ...(subscriptionEndDate && { subscriptionEndDate: new Date(subscriptionEndDate) }),
    },
  });

  return NextResponse.json({ employer });
}
