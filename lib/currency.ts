// Currency configuration for African countries
export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  paystackAmount: number; // Amount in smallest unit (kobo, cents, etc.) for monthly
  paystackYearlyAmount: number; // Amount in smallest unit for yearly
  country: string;
}

export const CURRENCIES: Record<string, CurrencyConfig> = {
  NGN: {
    code: 'NGN',
    symbol: '₦',
    name: 'Nigerian Naira',
    monthlyPrice: 3000,
    yearlyPrice: 30000, // 10 months price (2 months free)
    paystackAmount: 300000, // 3000 * 100 kobo
    paystackYearlyAmount: 3000000, // 30000 * 100 kobo
    country: 'Nigeria',
  },
  KES: {
    code: 'KES',
    symbol: 'KSh',
    name: 'Kenyan Shilling',
    monthlyPrice: 350,
    yearlyPrice: 3500, // 10 months price
    paystackAmount: 35000, // 350 * 100 cents
    paystackYearlyAmount: 350000, // 3500 * 100 cents
    country: 'Kenya',
  },
  GHS: {
    code: 'GHS',
    symbol: '₵',
    name: 'Ghanaian Cedi',
    monthlyPrice: 35,
    yearlyPrice: 350, // 10 months price
    paystackAmount: 3500, // 35 * 100 pesewas
    paystackYearlyAmount: 35000, // 350 * 100 pesewas
    country: 'Ghana',
  },
  ZAR: {
    code: 'ZAR',
    symbol: 'R',
    name: 'South African Rand',
    monthlyPrice: 50,
    yearlyPrice: 500, // 10 months price
    paystackAmount: 5000, // 50 * 100 cents
    paystackYearlyAmount: 50000, // 500 * 100 cents
    country: 'South Africa',
  },
  EGP: {
    code: 'EGP',
    symbol: 'E£',
    name: 'Egyptian Pound',
    monthlyPrice: 90,
    yearlyPrice: 900, // 10 months price
    paystackAmount: 9000, // 90 * 100 piastres
    paystackYearlyAmount: 90000, // 900 * 100 piastres
    country: 'Egypt',
  },
  TZS: {
    code: 'TZS',
    symbol: 'TSh',
    name: 'Tanzanian Shilling',
    monthlyPrice: 7500,
    yearlyPrice: 75000, // 10 months price
    paystackAmount: 750000, // 7500 * 100 cents
    paystackYearlyAmount: 7500000, // 75000 * 100 cents
    country: 'Tanzania',
  },
  UGX: {
    code: 'UGX',
    symbol: 'USh',
    name: 'Ugandan Shilling',
    monthlyPrice: 11000,
    yearlyPrice: 110000, // 10 months price
    paystackAmount: 1100000, // 11000 * 100 cents
    paystackYearlyAmount: 11000000, // 110000 * 100 cents
    country: 'Uganda',
  },
  XOF: {
    code: 'XOF',
    symbol: 'CFA',
    name: 'West African CFA Franc',
    monthlyPrice: 1800,
    yearlyPrice: 18000, // 10 months price
    paystackAmount: 180000, // 1800 * 100 centimes
    paystackYearlyAmount: 1800000, // 18000 * 100 centimes
    country: 'West Africa',
  },
  MAD: {
    code: 'MAD',
    symbol: 'DH',
    name: 'Moroccan Dirham',
    monthlyPrice: 30,
    yearlyPrice: 300, // 10 months price
    paystackAmount: 3000, // 30 * 100 centimes
    paystackYearlyAmount: 30000, // 300 * 100 centimes
    country: 'Morocco',
  },
};

// Default currency
export const DEFAULT_CURRENCY = 'NGN';

// Get currency by country code or default
export function getCurrency(countryCode?: string): CurrencyConfig {
  if (!countryCode) return CURRENCIES[DEFAULT_CURRENCY];
  
  // Map country codes to currency codes
  const countryToCurrency: Record<string, string> = {
    NG: 'NGN',
    KE: 'KES',
    GH: 'GHS',
    ZA: 'ZAR',
    EG: 'EGP',
    TZ: 'TZS',
    UG: 'UGX',
    SN: 'XOF', // Senegal
    CI: 'XOF', // Côte d'Ivoire
    BJ: 'XOF', // Benin
    BF: 'XOF', // Burkina Faso
    ML: 'XOF', // Mali
    NE: 'XOF', // Niger
    TG: 'XOF', // Togo
    MA: 'MAD',
  };

  const currencyCode = countryToCurrency[countryCode] || DEFAULT_CURRENCY;
  return CURRENCIES[currencyCode];
}

// Format price with currency symbol
export function formatPrice(amount: number, currencyCode: string): string {
  const currency = CURRENCIES[currencyCode] || CURRENCIES[DEFAULT_CURRENCY];
  return `${currency.symbol}${amount.toLocaleString()}`;
}

// Calculate monthly equivalent for yearly plan
export function getYearlyMonthlyEquivalent(currencyCode: string): number {
  const currency = CURRENCIES[currencyCode] || CURRENCIES[DEFAULT_CURRENCY];
  return Math.round(currency.yearlyPrice / 12);
}

// Calculate savings for yearly plan
export function getYearlySavings(currencyCode: string): number {
  const currency = CURRENCIES[currencyCode] || CURRENCIES[DEFAULT_CURRENCY];
  return currency.monthlyPrice * 12 - currency.yearlyPrice;
}

// Detect user's country from browser (client-side only)
export async function detectUserCountry(): Promise<string> {
  try {
    // Try to get country from IP geolocation API
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return data.country_code || 'NG';
  } catch (error) {
    console.error('Failed to detect country:', error);
    return 'NG'; // Default to Nigeria
  }
}
