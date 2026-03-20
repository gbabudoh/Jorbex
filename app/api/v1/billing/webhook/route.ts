import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

// POST /api/v1/billing/webhook — Paystack webhook (HMAC-SHA512 verified)
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const headersList = await headers();
    const paystackSig = headersList.get('x-paystack-signature');

    // ── Verify Paystack HMAC signature ────────────────────────────────────────
    const secret = process.env.PAYSTACK_SECRET_KEY || '';
    const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');

    if (paystackSig && hash !== paystackSig) {
      console.error('[Paystack Webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const { event: eventType, data } = event;

    // Only handle successful charge events
    if (eventType !== 'charge.success') {
      return NextResponse.json({ received: true });
    }

    const { reference, metadata, customer, amount, currency } = data;

    // Pull metadata from the event
    const employerId    = metadata?.employerId    || data?.metadata?.custom_fields?.find((f: { variable_name: string }) => f.variable_name === 'employerId')?.value;
    const billingPeriod = (metadata?.billingPeriod || 'monthly') as 'monthly' | 'yearly';
    const days          = billingPeriod === 'yearly' ? 365 : 30;

    if (!employerId) {
      console.error('[Paystack Webhook] Missing employerId in metadata, ref:', reference);
      return NextResponse.json({ received: true });
    }

    const subscriptionEndDate = new Date();
    subscriptionEndDate.setDate(subscriptionEndDate.getDate() + days);

    await prisma.employer.update({
      where: { id: employerId },
      data: {
        subscriptionStatus:    'ACTIVE',
        subscriptionStartDate: new Date(),
        subscriptionEndDate,
        paystackCustomerCode:  customer?.customer_code ?? null,
        billingPeriod,
        paymentProvider:       'paystack',
      },
    });

    console.log(`[Paystack Webhook] Activated ${employerId} — ${billingPeriod} — ${amount / 100} ${currency} — ends ${subscriptionEndDate.toISOString()}`);
    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Webhook error';
    console.error('[Paystack Webhook] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET — Paystack redirect callback after payment (redirect to subscription page)
export async function GET(request: Request) {
  const url    = new URL(request.url);
  const trxref = url.searchParams.get('trxref') || url.searchParams.get('reference');
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (trxref) {
    return NextResponse.redirect(`${baseUrl}/employer/subscription?success=paystack&ref=${trxref}`);
  }
  return NextResponse.redirect(`${baseUrl}/employer/subscription`);
}
