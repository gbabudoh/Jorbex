import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET — export all personal data (GDPR Art. 20 right to portability)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.userType !== 'employer') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const employer = await prisma.employer.findUnique({
    where: { id: session.user.id },
    include: {
      jobs: {
        select: { id: true, title: true, location: true, type: true, status: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      },
      applications: {
        select: { id: true, status: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      },
      companyVerification: {
        select: { bizType: true, status: true, submittedAt: true },
      },
    },
  });

  if (!employer) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const {
    password: _,
    consentIp: __,
    paystackCustomerCode: ___,
    paystackSubscriptionCode: ____,
    stripeCustomerId: _____,
    stripeSubscriptionId: ______,
    ...safeData
  } = employer;

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
  if (!session || session.user?.userType !== 'employer') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  if (body.confirm !== 'DELETE MY ACCOUNT') {
    return NextResponse.json(
      { error: 'Confirmation phrase required. Send { "confirm": "DELETE MY ACCOUNT" }' },
      { status: 400 }
    );
  }

  await prisma.employer.delete({ where: { id: session.user.id } });

  return NextResponse.json({
    message: 'Your account and all associated data have been permanently deleted.',
    deletedAt: new Date().toISOString(),
  });
}
