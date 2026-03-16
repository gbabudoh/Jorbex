import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import prisma from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  const candidate = await prisma.candidate.findUnique({
    where: { id },
    include: {
      workHistory: true,
      references: true,
      applications: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { job: { select: { title: true } }, employer: { select: { companyName: true } } },
      },
      testResults: { orderBy: { createdAt: 'desc' }, take: 5, include: { test: { select: { title: true } } } },
      _count: { select: { applications: true, interviews: true } },
    },
  });

  if (!candidate) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const { password: _, ...safeCandidate } = candidate;
  return NextResponse.json({ candidate: safeCandidate });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  const body = await req.json();

  const { name, email, phone, country, city, expertise, isSuspended } = body;

  const candidate = await prisma.candidate.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(email && { email }),
      ...(phone && { phone }),
      ...(country !== undefined && { country }),
      ...(city !== undefined && { city }),
      ...(expertise && { expertise }),
      ...(isSuspended !== undefined && { isSuspended }),
    },
  });

  const { password: _, ...safeCandidate } = candidate;
  return NextResponse.json({ candidate: safeCandidate });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  await prisma.candidate.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
