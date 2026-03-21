import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token }        = await params;
    const { signedByName } = await req.json();

    if (!signedByName?.trim()) {
      return NextResponse.json({ error: 'Signed name is required' }, { status: 400 });
    }

    const offer = await prisma.offer.findUnique({ where: { token } });
    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    // Upsert — safe to call again if candidate retries
    await prisma.signature.upsert({
      where:  { offerId: offer.id },
      update: { signedByName: signedByName.trim(), signedAt: new Date() },
      create: { offerId: offer.id, signedByName: signedByName.trim() },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
