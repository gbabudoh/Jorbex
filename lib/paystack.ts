import axios from 'axios';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '';

interface InitializePaymentParams {
  email: string;
  amount: number; // in kobo (Naira * 100)
  reference: string;
  callback_url?: string;
  metadata?: Record<string, any>;
}

interface VerifyPaymentParams {
  reference: string;
}

export const initializePayment = async (params: InitializePaymentParams) => {
  try {
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: params.email,
        amount: params.amount,
        reference: params.reference,
        callback_url: params.callback_url,
        metadata: params.metadata,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Payment initialization failed');
  }
};

export const verifyPayment = async (params: VerifyPaymentParams) => {
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${params.reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Payment verification failed');
  }
};

export const createSubscription = async (email: string, plan: string) => {
  try {
    const response = await axios.post(
      'https://api.paystack.co/subscription',
      {
        customer: email,
        plan: plan,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Subscription creation failed');
  }
};

export { PAYSTACK_PUBLIC_KEY };

