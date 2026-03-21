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
    // ── Initial checkout complete ─────────────────────────────────────────────
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      if (session.mode !== 'subscription') return NextResponse.json({ received: true });

      const { employerId, billingPeriod } = session.metadata ?? {};
      if (!employerId) {
        console.error('[Stripe Webhook] Missing employerId in metadata');
        return NextResponse.json({ received: true });
      }

      const subscriptionId   = typeof session.subscription === 'string' ? session.subscription : null;
      const stripeCustomerId = typeof session.customer      === 'string' ? session.customer      : null;

      // Compute access end from billing period (current_period_end removed in API 2026+)
      const subscriptionEndDate = new Date();
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + (billingPeriod === 'yearly' ? 12 : 1));

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

      // Store IDs in fields added after last prisma generate
      await prisma.$executeRaw`
        UPDATE "Employer"
        SET "stripeSubscriptionId" = ${subscriptionId},
            "stripeCustomerId"     = ${stripeCustomerId}
        WHERE id = ${employerId}
      `;

      console.log(`[Stripe Webhook] New subscription: ${employerId} — ${billingPeriod} — ends ${subscriptionEndDate.toISOString()}`);
    }

    // ── Renewal payment succeeded ─────────────────────────────────────────────
    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object;
      // Skip the first invoice (handled by checkout.session.completed)
      if (invoice.billing_reason === 'subscription_create') return NextResponse.json({ received: true });

      const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : null;
      if (!subscriptionId) return NextResponse.json({ received: true });

      const employers = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "Employer" WHERE "stripeSubscriptionId" = ${subscriptionId}
      `;
      if (!employers[0]) return NextResponse.json({ received: true });

      // Derive billing period from subscription metadata, then compute end date
      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      const bp  = (sub.metadata?.billingPeriod ?? 'monthly') as 'monthly' | 'yearly';
      const subscriptionEndDate = new Date();
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + (bp === 'yearly' ? 12 : 1));

      await prisma.employer.update({
        where: { id: employers[0].id },
        data: { subscriptionStatus: 'ACTIVE', subscriptionEndDate },
      });

      console.log(`[Stripe Webhook] Renewal: ${employers[0].id} — ends ${subscriptionEndDate.toISOString()}`);
    }

    // ── Subscription cancelled / payment failed / period ended ────────────────
    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;

      const employers = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "Employer" WHERE "stripeSubscriptionId" = ${sub.id}
      `;
      if (!employers[0]) return NextResponse.json({ received: true });

      await prisma.employer.update({
        where: { id: employers[0].id },
        data: { subscriptionStatus: 'EXPIRED' },
      });

      console.log(`[Stripe Webhook] Subscription ended: ${employers[0].id}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Webhook processing error';
    console.error('[Stripe Webhook] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
