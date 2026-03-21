import axios from 'axios';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '';

interface InitializePaymentParams {
  email: string;
  amount: number;
  reference: string;
  plan?: string;         // plan code → makes the transaction create a recurring subscription
  callback_url?: string;
  metadata?: Record<string, unknown>;
}

interface VerifyPaymentParams {
  reference: string;
}

export const initializePayment = async (params: InitializePaymentParams) => {
  try {
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email:        params.email,
        amount:       params.amount,
        reference:    params.reference,
        plan:         params.plan,
        callback_url: params.callback_url,
        metadata:     params.metadata,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error: unknown) {
    const e = error as { response?: { data?: { message?: string } } };
    throw new Error(e.response?.data?.message || 'Payment initialization failed');
  }
};

export const verifyPayment = async (params: VerifyPaymentParams) => {
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${params.reference}`,
      {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
      }
    );

    return response.data;
  } catch (error: unknown) {
    const e = error as { response?: { data?: { message?: string } } };
    throw new Error(e.response?.data?.message || 'Payment verification failed');
  }
};

// ─── Plans ────────────────────────────────────────────────────────────────────

interface CreatePlanParams {
  name: string;
  amount: number;          // in smallest currency unit
  interval: 'monthly' | 'annually';
  currency: string;        // e.g. 'NGN'
}

export const createPlan = async (params: CreatePlanParams) => {
  try {
    const response = await axios.post(
      'https://api.paystack.co/plan',
      {
        name:     params.name,
        amount:   params.amount,
        interval: params.interval,
        currency: params.currency,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: unknown) {
    const e = error as { response?: { data?: { message?: string } } };
    throw new Error(e.response?.data?.message || 'Plan creation failed');
  }
};

// ─── Get or create a Paystack plan for the given currency + billing period.
// Checks env var PAYSTACK_PLAN_{CURRENCY}_{PERIOD} first; creates dynamically if absent
// and logs the new plan code so it can be added to env.
export const getOrCreatePaystackPlan = async (
  currencyCode: string,
  billingPeriod: 'monthly' | 'yearly',
  amount: number,
): Promise<string> => {
  const envKey   = `PAYSTACK_PLAN_${currencyCode}_${billingPeriod.toUpperCase()}`;
  const envPlan  = process.env[envKey];
  if (envPlan) return envPlan;

  // Dynamically create the plan (first run only)
  const interval = billingPeriod === 'yearly' ? 'annually' : 'monthly';
  const result   = await createPlan({
    name:     `Jorbex Premium ${billingPeriod} — ${currencyCode}`,
    amount,
    interval,
    currency: currencyCode,
  });

  const planCode: string = result.data?.plan_code;
  console.info(`[Paystack] Created plan. Add to env: ${envKey}=${planCode}`);
  return planCode;
};

// ─── Subscriptions ────────────────────────────────────────────────────────────

export const createSubscription = async (email: string, plan: string) => {
  try {
    const response = await axios.post(
      'https://api.paystack.co/subscription',
      { customer: email, plan },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error: unknown) {
    const e = error as { response?: { data?: { message?: string } } };
    throw new Error(e.response?.data?.message || 'Subscription creation failed');
  }
};

// Disable (cancel) a Paystack subscription. Requires the subscription code and
// the email token sent to the customer when the subscription was created.
export const disableSubscription = async (code: string, token: string) => {
  try {
    const response = await axios.post(
      'https://api.paystack.co/subscription/disable',
      { code, token },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: unknown) {
    const e = error as { response?: { data?: { message?: string } } };
    throw new Error(e.response?.data?.message || 'Subscription cancellation failed');
  }
};

export { PAYSTACK_PUBLIC_KEY };
