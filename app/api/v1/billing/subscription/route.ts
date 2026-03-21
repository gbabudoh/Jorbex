import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { checkSubscription } from '@/lib/subscription';

// GET /api/v1/billing/subscription — return full subscription state
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.userType !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sub = await checkSubscription(session.user.id);

    return NextResponse.json({
      isActive:           sub.isActive,
      isTrial:            sub.isTrial,
      hasAccess:          sub.hasAccess,
      status:             sub.status,
      subscriptionEndsAt: sub.subscriptionEndDate,
      nextBillingDate:    sub.subscriptionEndDate,
      provider:           sub.provider,
      billingPeriod:      sub.billingPeriod,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch subscription';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/v1/billing/subscription — cancel at period end (access continues until then)
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.userType !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const employer = await prisma.employer.findUnique({
      where:  { id: session.user.id },
      select: { subscriptionStatus: true, paymentProvider: true },
    });

    if (!employer || employer.subscriptionStatus === 'TRIAL') {
      return NextResponse.json({ error: 'No active subscription to cancel' }, { status: 400 });
    }

    // ── Stripe: cancel at period end (no immediate cutoff) ────────────────────
    if (employer.paymentProvider === 'stripe') {
      const rows = await prisma.$queryRaw<{ stripeSubscriptionId: string | null }[]>`
        SELECT "stripeSubscriptionId" FROM "Employer" WHERE id = ${session.user.id}
      `;
      const stripeSubId = rows[0]?.stripeSubscriptionId;

      if (stripeSubId) {
        try {
          const { stripe } = await import('@/lib/stripe');
          // cancel_at_period_end keeps access active until the billing period ends,
          // then Stripe fires customer.subscription.deleted and we mark EXPIRED.
          await stripe.subscriptions.update(stripeSubId, { cancel_at_period_end: true });
        } catch (err) {
          console.error('[Billing] Stripe cancel error:', err);
        }
      }
    }

    // ── Paystack: disable subscription (stops future renewals) ────────────────
    if (employer.paymentProvider === 'paystack') {
      const rows = await prisma.$queryRaw<{
        paystackSubscriptionCode: string | null;
        paystackEmailToken: string | null;
      }[]>`
        SELECT "paystackSubscriptionCode", "paystackEmailToken"
        FROM "Employer"
        WHERE id = ${session.user.id}
      `;
      const subCode   = rows[0]?.paystackSubscriptionCode;
      const emailToken = rows[0]?.paystackEmailToken;

      if (subCode && emailToken) {
        try {
          const { disableSubscription } = await import('@/lib/paystack');
          await disableSubscription(subCode, emailToken);
        } catch (err) {
          console.error('[Billing] Paystack cancel error:', err);
        }
      }
    }

    // Mark as CANCELLED in DB — access continues until subscriptionEndDate
    await prisma.employer.update({
      where: { id: session.user.id },
      data:  { subscriptionStatus: 'CANCELLED' },
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled. Access continues until the end of your billing period.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to cancel subscription';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
