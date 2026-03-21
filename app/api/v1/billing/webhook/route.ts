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
    const hash   = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');

    if (paystackSig && hash !== paystackSig) {
      console.error('[Paystack Webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const { event: eventType, data } = event;

    // ── subscription.create — first successful charge, subscription activated ─
    if (eventType === 'subscription.create') {
      const employerId         = data.metadata?.employerId ?? data.customer?.metadata?.employerId;
      const billingPeriod      = (data.metadata?.billingPeriod || 'monthly') as 'monthly' | 'yearly';
      const subscriptionCode   = data.subscription_code as string | undefined;
      const emailToken         = data.email_token         as string | undefined;
      const nextPaymentDate    = data.next_payment_date   ? new Date(data.next_payment_date) : null;

      if (!employerId) {
        console.error('[Paystack Webhook] subscription.create: missing employerId');
        return NextResponse.json({ received: true });
      }

      const subscriptionEndDate = nextPaymentDate ?? (() => {
        const d = new Date();
        d.setDate(d.getDate() + (billingPeriod === 'yearly' ? 365 : 30));
        return d;
      })();

      await prisma.employer.update({
        where: { id: employerId },
        data: {
          subscriptionStatus:      'ACTIVE',
          subscriptionStartDate:   new Date(),
          subscriptionEndDate,
          paystackCustomerCode:    data.customer?.customer_code ?? null,
          paystackSubscriptionCode: subscriptionCode ?? null,
          billingPeriod,
          paymentProvider: 'paystack',
        },
      });

      // Store email token for future cancellation (field added via raw SQL)
      if (emailToken) {
        await prisma.$executeRaw`
          UPDATE "Employer"
          SET "paystackEmailToken" = ${emailToken}
          WHERE id = ${employerId}
        `;
      }

      console.log(`[Paystack Webhook] Subscription created: ${employerId} — ${billingPeriod} — ends ${subscriptionEndDate.toISOString()}`);
    }

    // ── charge.success — catches first charge when subscription.create is delayed
    if (eventType === 'charge.success') {
      const { reference, metadata, customer, amount, currency } = data;

      const employerId    = metadata?.employerId ?? metadata?.custom_fields?.find((f: { variable_name: string }) => f.variable_name === 'employerId')?.value;
      const billingPeriod = (metadata?.billingPeriod || 'monthly') as 'monthly' | 'yearly';
      const days          = billingPeriod === 'yearly' ? 365 : 30;

      if (!employerId) {
        console.error('[Paystack Webhook] charge.success: missing employerId, ref:', reference);
        return NextResponse.json({ received: true });
      }

      // Only activate if not already ACTIVE (subscription.create may have already handled it)
      const employer = await prisma.employer.findUnique({
        where: { id: employerId },
        select: { subscriptionStatus: true },
      });

      if (employer?.subscriptionStatus !== 'ACTIVE') {
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

        console.log(`[Paystack Webhook] Activated via charge.success: ${employerId} — ${billingPeriod} — ${amount / 100} ${currency}`);
      }
    }

    // ── invoice.update — recurring renewal payment succeeded ──────────────────
    if (eventType === 'invoice.update' && data.paid === true) {
      const subscriptionCode = data.subscription?.subscription_code as string | undefined;
      const nextPaymentDate  = data.subscription?.next_payment_date ? new Date(data.subscription.next_payment_date) : null;

      if (!subscriptionCode) return NextResponse.json({ received: true });

      const subscriptionEndDate = nextPaymentDate ?? (() => {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        return d;
      })();

      const result = await prisma.employer.updateMany({
        where: { paystackSubscriptionCode: subscriptionCode },
        data:  { subscriptionStatus: 'ACTIVE', subscriptionEndDate },
      });

      if (result.count > 0) {
        console.log(`[Paystack Webhook] Renewal: sub ${subscriptionCode} — ends ${subscriptionEndDate.toISOString()}`);
      }
    }

    // ── subscription.disable — subscription cancelled or payment failed ────────
    if (eventType === 'subscription.disable' || eventType === 'subscription.not_renew') {
      const subscriptionCode = data.subscription_code as string | undefined;
      if (!subscriptionCode) return NextResponse.json({ received: true });

      const result = await prisma.employer.updateMany({
        where: { paystackSubscriptionCode: subscriptionCode },
        data:  { subscriptionStatus: 'EXPIRED' },
      });

      if (result.count > 0) {
        console.log(`[Paystack Webhook] Subscription disabled: ${subscriptionCode}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Webhook error';
    console.error('[Paystack Webhook] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET — Paystack redirect callback after payment
export async function GET(request: Request) {
  const url     = new URL(request.url);
  const trxref  = url.searchParams.get('trxref') || url.searchParams.get('reference');
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (trxref) {
    return NextResponse.redirect(`${baseUrl}/employer/subscription?success=paystack&ref=${trxref}`);
  }
  return NextResponse.redirect(`${baseUrl}/employer/subscription`);
}
