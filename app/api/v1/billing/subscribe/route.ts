import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { initializePayment } from '@/lib/paystack';
import { generateReference } from '@/lib/utils';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.userType !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const employer = await prisma.employer.findUnique({ where: { id: session.user.id } });

    if (!employer) {
      return NextResponse.json({ error: 'Employer not found' }, { status: 404 });
    }

    const reference = generateReference();
    const amount = 300000; // ₦3,000 in kobo

    const paymentData = await initializePayment({
      email: employer.email,
      amount,
      reference,
      callback_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/v1/billing/webhook`,
      metadata: {
        employerId: employer.id,
        type: 'subscription',
      },
    });

    return NextResponse.json(
      {
        authorization_url: paymentData.data.authorization_url,
        reference: paymentData.data.reference,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to initiate subscription';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
