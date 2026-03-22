import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import prisma from '@/lib/prisma';

// PATCH /api/admin/verifications/[id]?kind=candidate|company
// Body: { action: 'approve' | 'reject', reviewNotes?: string }
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const kind = req.nextUrl.searchParams.get('kind');

  if (!kind || !['candidate', 'company'].includes(kind)) {
    return NextResponse.json({ error: 'kind must be candidate or company' }, { status: 400 });
  }

  const body = await req.json();
  const { action, reviewNotes } = body;

  if (!action || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'action must be approve or reject' }, { status: 400 });
  }

  const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
  const adminId = session!.user.id;

  if (kind === 'candidate') {
    const record = await prisma.identityVerification.findUnique({ where: { id } });
    if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const updated = await prisma.identityVerification.update({
      where: { id },
      data: {
        status: newStatus,
        reviewedAt: new Date(),
        reviewedBy: adminId,
        reviewNotes: reviewNotes || null,
      },
    });

    // Sync isVerified on Candidate
    await prisma.candidate.update({
      where: { id: record.candidateId },
      data: { isVerified: newStatus === 'APPROVED' },
    });

    return NextResponse.json({ verification: updated });
  } else {
    const record = await prisma.companyVerification.findUnique({ where: { id } });
    if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const updated = await prisma.companyVerification.update({
      where: { id },
      data: {
        status: newStatus,
        reviewedAt: new Date(),
        reviewedBy: adminId,
        reviewNotes: reviewNotes || null,
      },
    });

    // Sync isVerified on Employer
    await prisma.employer.update({
      where: { id: record.employerId },
      data: { isVerified: newStatus === 'APPROVED' },
    });

    return NextResponse.json({ verification: updated });
  }
}
