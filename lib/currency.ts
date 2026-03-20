// Currency configuration — African (Paystack) + International (Stripe)

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  paystackAmount: number;       // Paystack: amount in smallest unit (monthly)
  paystackYearlyAmount: number; // Paystack: amount in smallest unit (yearly)
  country: string;
  provider: 'paystack' | 'stripe';
}

// ─── African currencies → Paystack ──────────────────────────────────────────
export const AFRICAN_CURRENCIES: Record<string, CurrencyConfig> = {
  NGN: { code: 'NGN', symbol: '₦',    name: 'Nigerian Naira',          monthlyPrice: 3000,  yearlyPrice: 30000, paystackAmount: 300000,   paystackYearlyAmount: 3000000,  country: 'Nigeria',       provider: 'paystack' },
  KES: { code: 'KES', symbol: 'KSh',  name: 'Kenyan Shilling',         monthlyPrice: 350,   yearlyPrice: 3500,  paystackAmount: 35000,    paystackYearlyAmount: 350000,   country: 'Kenya',         provider: 'paystack' },
  GHS: { code: 'GHS', symbol: '₵',    name: 'Ghanaian Cedi',           monthlyPrice: 35,    yearlyPrice: 350,   paystackAmount: 3500,     paystackYearlyAmount: 35000,    country: 'Ghana',         provider: 'paystack' },
  ZAR: { code: 'ZAR', symbol: 'R',    name: 'South African Rand',      monthlyPrice: 50,    yearlyPrice: 500,   paystackAmount: 5000,     paystackYearlyAmount: 50000,    country: 'South Africa',  provider: 'paystack' },
  EGP: { code: 'EGP', symbol: 'E£',   name: 'Egyptian Pound',          monthlyPrice: 90,    yearlyPrice: 900,   paystackAmount: 9000,     paystackYearlyAmount: 90000,    country: 'Egypt',         provider: 'paystack' },
  TZS: { code: 'TZS', symbol: 'TSh',  name: 'Tanzanian Shilling',      monthlyPrice: 7500,  yearlyPrice: 75000, paystackAmount: 750000,   paystackYearlyAmount: 7500000,  country: 'Tanzania',      provider: 'paystack' },
  UGX: { code: 'UGX', symbol: 'USh',  name: 'Ugandan Shilling',        monthlyPrice: 11000, yearlyPrice: 110000,paystackAmount: 1100000,  paystackYearlyAmount: 11000000, country: 'Uganda',        provider: 'paystack' },
  XOF: { code: 'XOF', symbol: 'CFA',  name: 'West African CFA Franc',  monthlyPrice: 1800,  yearlyPrice: 18000, paystackAmount: 180000,   paystackYearlyAmount: 1800000,  country: 'West Africa',   provider: 'paystack' },
  MAD: { code: 'MAD', symbol: 'DH',   name: 'Moroccan Dirham',         monthlyPrice: 30,    yearlyPrice: 300,   paystackAmount: 3000,     paystackYearlyAmount: 30000,    country: 'Morocco',       provider: 'paystack' },
  RWF: { code: 'RWF', symbol: 'FRw',  name: 'Rwandan Franc',           monthlyPrice: 35000, yearlyPrice: 350000,paystackAmount: 3500000,  paystackYearlyAmount: 35000000, country: 'Rwanda',        provider: 'paystack' },
};

// ─── International currencies → Stripe ───────────────────────────────────────
// Prices are display amounts (Stripe amounts stored in lib/stripe.ts)
export const INTERNATIONAL_CURRENCIES: Record<string, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$',    name: 'US Dollar',           monthlyPrice: 25,  yearlyPrice: 250,  paystackAmount: 0, paystackYearlyAmount: 0, country: 'United States',  provider: 'stripe' },
  EUR: { code: 'EUR', symbol: '€',    name: 'Euro',                monthlyPrice: 23,  yearlyPrice: 230,  paystackAmount: 0, paystackYearlyAmount: 0, country: 'Europe',         provider: 'stripe' },
  GBP: { code: 'GBP', symbol: '£',    name: 'British Pound',       monthlyPrice: 20,  yearlyPrice: 200,  paystackAmount: 0, paystackYearlyAmount: 0, country: 'United Kingdom', provider: 'stripe' },
  CAD: { code: 'CAD', symbol: 'CA$',  name: 'Canadian Dollar',     monthlyPrice: 33,  yearlyPrice: 330,  paystackAmount: 0, paystackYearlyAmount: 0, country: 'Canada',         provider: 'stripe' },
  AUD: { code: 'AUD', symbol: 'A$',   name: 'Australian Dollar',   monthlyPrice: 38,  yearlyPrice: 380,  paystackAmount: 0, paystackYearlyAmount: 0, country: 'Australia',      provider: 'stripe' },
  SGD: { code: 'SGD', symbol: 'S$',   name: 'Singapore Dollar',    monthlyPrice: 33,  yearlyPrice: 330,  paystackAmount: 0, paystackYearlyAmount: 0, country: 'Singapore',      provider: 'stripe' },
  AED: { code: 'AED', symbol: 'د.إ',  name: 'UAE Dirham',          monthlyPrice: 92,  yearlyPrice: 920,  paystackAmount: 0, paystackYearlyAmount: 0, country: 'UAE',            provider: 'stripe' },
};

export const CURRENCIES: Record<string, CurrencyConfig> = {
  ...AFRICAN_CURRENCIES,
  ...INTERNATIONAL_CURRENCIES,
};

export const DEFAULT_CURRENCY = 'NGN';

export const AFRICAN_CURRENCY_CODES = new Set(Object.keys(AFRICAN_CURRENCIES));

export function isAfricanCurrency(code: string): boolean {
  return AFRICAN_CURRENCY_CODES.has(code);
}

// Map ISO country codes → currency code
const COUNTRY_TO_CURRENCY: Record<string, string> = {
  // Africa
  NG: 'NGN', KE: 'KES', GH: 'GHS', ZA: 'ZAR', EG: 'EGP',
  TZ: 'TZS', UG: 'UGX', RW: 'RWF', MA: 'MAD',
  SN: 'XOF', CI: 'XOF', BJ: 'XOF', BF: 'XOF', ML: 'XOF', NE: 'XOF', TG: 'XOF',
  // International
  US: 'USD', CA: 'CAD', AU: 'AUD', NZ: 'USD', SG: 'SGD', AE: 'AED',
  GB: 'GBP', IE: 'EUR', DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR',
  NL: 'EUR', BE: 'EUR', PT: 'EUR', AT: 'EUR', CH: 'USD',
};

export function getCurrency(countryCodeOrCurrencyCode?: string): CurrencyConfig {
  if (!countryCodeOrCurrencyCode) return CURRENCIES[DEFAULT_CURRENCY];
  // Direct currency match (e.g. 'NGN', 'USD')
  if (CURRENCIES[countryCodeOrCurrencyCode]) return CURRENCIES[countryCodeOrCurrencyCode];
  // Country code match (e.g. 'NG', 'US')
  const currencyCode = COUNTRY_TO_CURRENCY[countryCodeOrCurrencyCode] ?? DEFAULT_CURRENCY;
  return CURRENCIES[currencyCode] ?? CURRENCIES[DEFAULT_CURRENCY];
}

export function formatPrice(amount: number, currencyCode: string): string {
  const currency = CURRENCIES[currencyCode] ?? CURRENCIES[DEFAULT_CURRENCY];
  return `${currency.symbol}${amount.toLocaleString()}`;
}

export function getYearlyMonthlyEquivalent(currencyCode: string): number {
  const currency = CURRENCIES[currencyCode] ?? CURRENCIES[DEFAULT_CURRENCY];
  return Math.round(currency.yearlyPrice / 12);
}

export function getYearlySavings(currencyCode: string): number {
  const currency = CURRENCIES[currencyCode] ?? CURRENCIES[DEFAULT_CURRENCY];
  return currency.monthlyPrice * 12 - currency.yearlyPrice;
}

// Detect user's country from IP (client-side only)
export async function detectUserCountry(): Promise<string> {
  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    return data.country_code || 'NG';
  } catch {
    return 'NG';
  }
}
