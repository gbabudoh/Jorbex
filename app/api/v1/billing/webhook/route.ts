import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPayment } from '@/lib/paystack';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reference, metadata } = body;

    // Verify payment with Paystack
    const verification = await verifyPayment({ reference });

    if (verification.data.status === 'success') {
      const employerId = metadata?.employerId;

      if (employerId) {
        // Calculate subscription end date (30 days from now)
        const subscriptionEndDate = new Date();
        subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);

        await prisma.employer.update({
          where: { id: employerId },
          data: {
            subscriptionStatus: 'ACTIVE',
            subscriptionStartDate: new Date(),
            subscriptionEndDate,
            paystackCustomerCode: verification.data.customer?.customer_code,
          },
        });
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Webhook processing failed';
    console.error('Webhook error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
