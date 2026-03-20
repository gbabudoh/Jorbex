import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { initializePayment } from '@/lib/paystack';
import { createCheckoutSession } from '@/lib/stripe';
import { isAfricanCurrency, getCurrency } from '@/lib/currency';
import { generateReference } from '@/lib/utils';

// POST /api/v1/billing/subscribe
// Routes to Paystack (Africa) or Stripe (global) based on chosen currency
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.userType !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const currencyCode: string  = (body.currency   || 'NGN').toUpperCase();
    const billingPeriod: 'monthly' | 'yearly' = body.billingPeriod === 'yearly' ? 'yearly' : 'monthly';

    const employer = await prisma.employer.findUnique({ where: { id: session.user.id } });
    if (!employer) {
      return NextResponse.json({ error: 'Employer not found' }, { status: 404 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const currency = getCurrency(currencyCode);

    // ── African currencies → Paystack ─────────────────────────────────────────
    if (isAfricanCurrency(currencyCode)) {
      const amount    = billingPeriod === 'yearly' ? currency.paystackYearlyAmount : currency.paystackAmount;
      const reference = generateReference();

      const paymentData = await initializePayment({
        email: employer.email,
        amount,
        reference,
        callback_url: `${baseUrl}/api/v1/billing/webhook`,
        metadata: {
          employerId:    employer.id,
          billingPeriod,
          currencyCode,
          type:          'subscription',
          provider:      'paystack',
        },
      });

      return NextResponse.json({
        provider:          'paystack',
        authorization_url: paymentData.data.authorization_url,
        reference:         paymentData.data.reference,
      });
    }

    // ── International currencies → Stripe ─────────────────────────────────────
    const stripeSession = await createCheckoutSession({
      employerId:    employer.id,
      employerEmail: employer.email,
      currencyCode,
      billingPeriod,
      baseUrl,
    });

    return NextResponse.json({
      provider:          'stripe',
      authorization_url: stripeSession.url,
      session_id:        stripeSession.id,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to initiate subscription';
    console.error('[Billing] subscribe error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
