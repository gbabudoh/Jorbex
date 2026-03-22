import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET — fetch current candidate's verification status
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.userType !== 'candidate') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const verification = await prisma.identityVerification.findUnique({
    where: { candidateId: session.user.id },
    select: {
      id: true,
      docType: true,
      docNumber: true,
      country: true,
      fileUrl: true,
      status: true,
      reviewNotes: true,
      submittedAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ verification });
}

// POST — submit or resubmit identity verification
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.userType !== 'candidate') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { docType, docNumber, country, fileUrl, fileKey } = body;

  if (!docType || !country || !fileUrl || !fileKey) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!['PASSPORT', 'NATIONAL_ID'].includes(docType)) {
    return NextResponse.json({ error: 'Invalid document type' }, { status: 400 });
  }

  // Check if existing verification is already approved — block resubmission
  const existing = await prisma.identityVerification.findUnique({
    where: { candidateId: session.user.id },
    select: { status: true },
  });

  if (existing?.status === 'APPROVED') {
    return NextResponse.json({ error: 'Identity is already verified' }, { status: 409 });
  }

  const verification = await prisma.identityVerification.upsert({
    where: { candidateId: session.user.id },
    create: {
      candidateId: session.user.id,
      docType,
      docNumber: docNumber || null,
      country,
      fileUrl,
      fileKey,
      status: 'PENDING',
    },
    update: {
      docType,
      docNumber: docNumber || null,
      country,
      fileUrl,
      fileKey,
      status: 'PENDING',
      reviewedAt: null,
      reviewedBy: null,
      reviewNotes: null,
    },
  });

  return NextResponse.json({ verification }, { status: 201 });
}
