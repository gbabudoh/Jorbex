import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Employer from '@/models/Employer';
import { verifyPayment } from '@/lib/paystack';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reference, metadata } = body;

    await dbConnect();

    // Verify payment with Paystack
    const verification = await verifyPayment({ reference });

    if (verification.data.status === 'success') {
      const employerId = metadata?.employerId;

      if (employerId) {
        // Calculate subscription end date (30 days from now)
        const subscriptionEndDate = new Date();
        subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);

        await Employer.findByIdAndUpdate(employerId, {
          subscriptionStatus: 'active',
          subscriptionStartDate: new Date(),
          subscriptionEndDate,
          paystackCustomerCode: verification.data.customer?.customer_code,
        });
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

