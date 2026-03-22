import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'all';   // 'candidate' | 'company' | 'all'
  const status = searchParams.get('status') || 'PENDING';

  const results: {
    candidates: unknown[];
    companies: unknown[];
  } = { candidates: [], companies: [] };

  if (type === 'candidate' || type === 'all') {
    results.candidates = await prisma.identityVerification.findMany({
      where: status === 'all' ? {} : { status: status as 'PENDING' | 'APPROVED' | 'REJECTED' },
      include: {
        candidate: {
          select: { id: true, name: true, email: true, country: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  if (type === 'company' || type === 'all') {
    results.companies = await prisma.companyVerification.findMany({
      where: status === 'all' ? {} : { status: status as 'PENDING' | 'APPROVED' | 'REJECTED' },
      include: {
        employer: {
          select: { id: true, name: true, email: true, companyName: true, country: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  return NextResponse.json(results);
}
