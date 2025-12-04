import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Employer from '@/models/Employer';
import { initializePayment } from '@/lib/paystack';
import { generateReference } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.userType !== 'employer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const employer = await Employer.findById(session.user?.id);

    if (!employer) {
      return NextResponse.json(
        { error: 'Employer not found' },
        { status: 404 }
      );
    }

    const reference = generateReference();
    const amount = 300000; // ₦3,000 in kobo

    const paymentData = await initializePayment({
      email: employer.email,
      amount,
      reference,
      callback_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/v1/billing/webhook`,
      metadata: {
        employerId: employer._id.toString(),
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
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to initiate subscription' },
      { status: 500 }
    );
  }
}

