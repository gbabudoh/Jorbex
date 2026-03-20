import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';

// POST /api/v1/billing/stripe — Stripe webhook (raw body required)
export async function POST(request: Request) {
  const rawBody = await request.text();
  const headersList = await headers();
  const sig = headersList.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } else {
      event = JSON.parse(rawBody);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Webhook signature verification failed';
    console.error('[Stripe Webhook] Signature error:', msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // Only handle paid sessions
      if (session.payment_status !== 'paid') return NextResponse.json({ received: true });

      const { employerId, billingPeriod, days: daysStr } = session.metadata ?? {};
      if (!employerId) {
        console.error('[Stripe Webhook] Missing employerId in metadata');
        return NextResponse.json({ received: true });
      }

      const days = parseInt(daysStr || '30', 10);
      const subscriptionEndDate = new Date();
      subscriptionEndDate.setDate(subscriptionEndDate.getDate() + days);

      // Store stripeCustomerId via raw SQL (new field added after last prisma generate)
      const stripeCustomerId = typeof session.customer === 'string' ? session.customer : null;

      await prisma.employer.update({
        where: { id: employerId },
        data: {
          subscriptionStatus:    'ACTIVE',
          subscriptionStartDate: new Date(),
          subscriptionEndDate,
          billingPeriod:         billingPeriod ?? 'monthly',
          paymentProvider:       'stripe',
        },
      });

      if (stripeCustomerId) {
        await prisma.$executeRaw`
          UPDATE "Employer"
          SET "stripeCustomerId" = ${stripeCustomerId}
          WHERE id = ${employerId}
        `;
      }

      console.log(`[Stripe Webhook] Activated ${employerId} — ${billingPeriod} — ${session.amount_total} ${session.currency} — ends ${subscriptionEndDate.toISOString()}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Webhook processing error';
    console.error('[Stripe Webhook] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
