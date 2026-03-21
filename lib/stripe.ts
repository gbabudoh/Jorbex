import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2026-02-25.clover',
});

// ─── Stripe pricing (one-time, amounts in smallest currency unit) ─────────────
export const STRIPE_PRICES: Record<string, { monthly: number; yearly: number; currency: string; symbol: string; name: string }> = {
  USD: { monthly: 2500,  yearly: 25000,  currency: 'usd', symbol: '$',  name: 'US Dollar' },
  EUR: { monthly: 2300,  yearly: 23000,  currency: 'eur', symbol: '€',  name: 'Euro' },
  GBP: { monthly: 2000,  yearly: 20000,  currency: 'gbp', symbol: '£',  name: 'British Pound' },
  CAD: { monthly: 3300,  yearly: 33000,  currency: 'cad', symbol: 'CA$', name: 'Canadian Dollar' },
  AUD: { monthly: 3800,  yearly: 38000,  currency: 'aud', symbol: 'A$', name: 'Australian Dollar' },
  SGD: { monthly: 3300,  yearly: 33000,  currency: 'sgd', symbol: 'S$', name: 'Singapore Dollar' },
  AED: { monthly: 9200,  yearly: 92000,  currency: 'aed', symbol: 'د.إ', name: 'UAE Dirham' },
};

export function getStripePrice(currencyCode: string, period: 'monthly' | 'yearly') {
  const p = STRIPE_PRICES[currencyCode] ?? STRIPE_PRICES.USD;
  return { amount: p[period], currency: p.currency, symbol: p.symbol };
}

// Create a Stripe Checkout session (recurring subscription)
export async function createCheckoutSession(params: {
  employerId: string;
  employerEmail: string;
  currencyCode: string;
  billingPeriod: 'monthly' | 'yearly';
  baseUrl: string;
}) {
  const { employerId, employerEmail, currencyCode, billingPeriod, baseUrl } = params;
  const price    = getStripePrice(currencyCode, billingPeriod);
  const label    = billingPeriod === 'yearly' ? 'Annual' : 'Monthly';
  const interval = billingPeriod === 'yearly' ? 'year' : 'month';

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: employerEmail,
    line_items: [{
      quantity: 1,
      price_data: {
        currency: price.currency,
        unit_amount: price.amount,
        recurring: { interval },
        product_data: {
          name: `Jorbex Premium — ${label} Plan`,
          description: 'Unlimited candidate search, custom assessments & more.',
        },
      },
    }],
    success_url: `${baseUrl}/employer/subscription?success=stripe&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${baseUrl}/employer/subscription?cancelled=true`,
    // metadata on the session for checkout.session.completed
    metadata: { employerId, billingPeriod, currencyCode },
    // metadata on the subscription for invoice events
    subscription_data: {
      metadata: { employerId, billingPeriod, currencyCode },
    },
  });

  return session;
}
