import prisma from '@/lib/prisma';

export type SubscriptionAccess = {
  hasAccess: boolean;
  status: string;
  isTrial: boolean;
  isActive: boolean;
  subscriptionEndDate: Date | null;
  provider: string | null;
  billingPeriod: string | null;
};

// Check if an employer has valid access (TRIAL or ACTIVE and not expired)
// Also auto-expires subscriptions whose end date has passed.
export async function checkSubscription(employerId: string): Promise<SubscriptionAccess> {
  const employer = await prisma.employer.findUnique({
    where: { id: employerId },
    select: {
      subscriptionStatus: true,
      subscriptionEndDate: true,
      paymentProvider: true,
      billingPeriod: true,
    },
  });

  if (!employer) {
    return { hasAccess: false, status: 'NOT_FOUND', isTrial: false, isActive: false, subscriptionEndDate: null, provider: null, billingPeriod: null };
  }

  // Auto-expire active subscriptions past their end date
  if (
    employer.subscriptionStatus === 'ACTIVE' &&
    employer.subscriptionEndDate &&
    employer.subscriptionEndDate < new Date()
  ) {
    await prisma.employer.update({
      where: { id: employerId },
      data: { subscriptionStatus: 'EXPIRED' },
    });
    return {
      hasAccess: false, status: 'EXPIRED', isTrial: false, isActive: false,
      subscriptionEndDate: employer.subscriptionEndDate,
      provider: employer.paymentProvider, billingPeriod: employer.billingPeriod,
    };
  }

  const isTrial  = employer.subscriptionStatus === 'TRIAL';
  const isActive = employer.subscriptionStatus === 'ACTIVE';

  return {
    hasAccess: isTrial || isActive,
    status: employer.subscriptionStatus,
    isTrial,
    isActive,
    subscriptionEndDate: employer.subscriptionEndDate,
    provider: employer.paymentProvider,
    billingPeriod: employer.billingPeriod,
  };
}

// Middleware-style check — returns 403 JSON if no access
export async function requireSubscription(employerId: string) {
  const sub = await checkSubscription(employerId);
  if (!sub.hasAccess) {
    return { error: 'Subscription required', subscriptionRequired: true, status: sub.status };
  }
  return null;
}
