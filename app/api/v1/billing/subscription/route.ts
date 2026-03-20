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
      isActive:            sub.isActive,
      isTrial:             sub.isTrial,
      hasAccess:           sub.hasAccess,
      status:              sub.status,
      subscriptionEndsAt:  sub.subscriptionEndDate,
      nextBillingDate:     sub.subscriptionEndDate,
      provider:            sub.provider,
      billingPeriod:       sub.billingPeriod,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch subscription';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/v1/billing/subscription — cancel (set to CANCELLED, keep access until end date)
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.userType !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const employer = await prisma.employer.findUnique({
      where: { id: session.user.id },
      select: { subscriptionStatus: true, stripeSubscriptionId: true, paystackSubscriptionCode: true },
    });

    if (!employer || employer.subscriptionStatus === 'TRIAL') {
      return NextResponse.json({ error: 'No active subscription to cancel' }, { status: 400 });
    }

    // Cancel in Stripe if applicable (via raw SQL for new fields)
    const stripeRows = await prisma.$queryRaw<{ stripeSubscriptionId: string | null }[]>`
      SELECT "stripeSubscriptionId" FROM "Employer" WHERE id = ${session.user.id}
    `;
    const stripeSubId = stripeRows[0]?.stripeSubscriptionId;

    if (stripeSubId) {
      try {
        const { stripe } = await import('@/lib/stripe');
        await stripe.subscriptions.cancel(stripeSubId);
      } catch (err) {
        console.error('[Billing] Stripe cancel error:', err);
      }
    }

    await prisma.employer.update({
      where: { id: session.user.id },
      data:  { subscriptionStatus: 'CANCELLED' },
    });

    return NextResponse.json({ success: true, message: 'Subscription cancelled. Access continues until end of billing period.' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to cancel subscription';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
