import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET — export all personal data (GDPR Art. 20 right to portability)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.userType !== 'candidate') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const candidate = await prisma.candidate.findUnique({
    where: { id: session.user.id },
    include: {
      workHistory: true,
      references: true,
      applications: {
        include: { job: { select: { title: true, location: true } } },
        orderBy: { createdAt: 'desc' },
      },
      testResults: { select: { score: true, passed: true, createdAt: true } },
      identityVerification: {
        select: { docType: true, country: true, status: true, submittedAt: true },
      },
    },
  });

  if (!candidate) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Strip sensitive fields
  const { password: _, consentIp: __, ...safeData } = candidate;

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    exportedBy: 'Jorbex Data Rights Portal',
    legalBasis: 'GDPR Article 20 / NDPA Section 34 / POPIA Section 23',
    data: safeData,
  };

  return new NextResponse(JSON.stringify(exportPayload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="jorbex-data-export-${session.user.id}.json"`,
    },
  });
}

// DELETE — right to erasure (GDPR Art. 17 / NDPA / POPIA)
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.userType !== 'candidate') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  if (body.confirm !== 'DELETE MY ACCOUNT') {
    return NextResponse.json(
      { error: 'Confirmation phrase required. Send { "confirm": "DELETE MY ACCOUNT" }' },
      { status: 400 }
    );
  }

  // Cascade delete handled by Prisma schema onDelete: Cascade
  await prisma.candidate.delete({ where: { id: session.user.id } });

  return NextResponse.json({
    message: 'Your account and all associated data have been permanently deleted.',
    deletedAt: new Date().toISOString(),
  });
}
