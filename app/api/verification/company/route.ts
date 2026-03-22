import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET — fetch current employer's verification status
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.userType !== 'employer') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const verification = await prisma.companyVerification.findUnique({
    where: { employerId: session.user.id },
    select: {
      id: true,
      bizType: true,
      regNumber: true,
      regDocUrl: true,
      idDocType: true,
      idDocUrl: true,
      bankName: true,
      bankAccName: true,
      bankStmtUrl: true,
      status: true,
      reviewNotes: true,
      submittedAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ verification });
}

// POST — submit or resubmit company verification
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.userType !== 'employer') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { bizType } = body;

  if (!bizType || !['REGISTERED', 'INFORMAL'].includes(bizType)) {
    return NextResponse.json({ error: 'Invalid business type' }, { status: 400 });
  }

  // Check if already approved
  const existing = await prisma.companyVerification.findUnique({
    where: { employerId: session.user.id },
    select: { status: true },
  });

  if (existing?.status === 'APPROVED') {
    return NextResponse.json({ error: 'Company is already verified' }, { status: 409 });
  }

  let data: Record<string, unknown>;

  if (bizType === 'REGISTERED') {
    const { regNumber, regDocUrl, regDocKey } = body;
    if (!regDocUrl || !regDocKey) {
      return NextResponse.json({ error: 'Registration document is required' }, { status: 400 });
    }
    data = {
      bizType: 'REGISTERED',
      regNumber: regNumber || null,
      regDocUrl,
      regDocKey,
      // clear informal fields on resubmit
      idDocType: null,
      idDocUrl: null,
      idDocKey: null,
      bankName: null,
      bankAccName: null,
      bankStmtUrl: null,
      bankStmtKey: null,
    };
  } else {
    const { idDocType, idDocUrl, idDocKey, bankName, bankAccName, bankStmtUrl, bankStmtKey } = body;
    if (!idDocType || !idDocUrl || !idDocKey) {
      return NextResponse.json({ error: 'ID document is required' }, { status: 400 });
    }
    if (!bankName || !bankAccName || !bankStmtUrl || !bankStmtKey) {
      return NextResponse.json({ error: 'Bank account name and statement are required' }, { status: 400 });
    }
    if (!['PASSPORT', 'NATIONAL_ID'].includes(idDocType)) {
      return NextResponse.json({ error: 'Invalid ID document type' }, { status: 400 });
    }
    data = {
      bizType: 'INFORMAL',
      idDocType,
      idDocUrl,
      idDocKey,
      bankName,
      bankAccName,
      bankStmtUrl,
      bankStmtKey,
      // clear registered fields
      regNumber: null,
      regDocUrl: null,
      regDocKey: null,
    };
  }

  const verification = await prisma.companyVerification.upsert({
    where: { employerId: session.user.id },
    create: {
      employerId: session.user.id,
      ...data,
      status: 'PENDING',
    },
    update: {
      ...data,
      status: 'PENDING',
      reviewedAt: null,
      reviewedBy: null,
      reviewNotes: null,
    },
  });

  return NextResponse.json({ verification }, { status: 201 });
}
