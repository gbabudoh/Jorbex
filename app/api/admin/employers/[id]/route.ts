import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import prisma from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  const employer = await prisma.employer.findUnique({
    where: { id },
    include: {
      jobs: { orderBy: { createdAt: 'desc' }, take: 10, select: { id: true, title: true, status: true, createdAt: true } },
      _count: { select: { jobs: true, applications: true, interviews: true } },
    },
  });

  if (!employer) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ employer });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  const body = await req.json();

  const { name, companyName, email, phone, country, city, subscriptionStatus, subscriptionEndDate, isSuspended } = body;

  const employer = await prisma.employer.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(companyName && { companyName }),
      ...(email && { email }),
      ...(phone && { phone }),
      ...(country !== undefined && { country }),
      ...(city !== undefined && { city }),
      ...(subscriptionStatus && { subscriptionStatus }),
      ...(subscriptionEndDate && { subscriptionEndDate: new Date(subscriptionEndDate) }),
      ...(isSuspended !== undefined && { isSuspended }),
    },
  });

  return NextResponse.json({ employer });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  await prisma.employer.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
