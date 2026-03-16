import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import prisma from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      employer: { select: { companyName: true, name: true, email: true } },
      _count: { select: { applications: true, interviews: true } },
    },
  });

  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ job });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  const body = await req.json();

  const job = await prisma.job.update({
    where: { id },
    data: {
      ...(body.title && { title: body.title }),
      ...(body.status && { status: body.status }),
      ...(body.description !== undefined && { description: body.description }),
    },
  });

  return NextResponse.json({ job });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  await prisma.job.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
