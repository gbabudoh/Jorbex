'use client';

import { useState, useEffect } from 'react';
import { detectUserCountry, getCurrency, formatPrice, type CurrencyConfig } from '@/lib/currency';

interface CurrencyDisplayProps {
  showSelector?: boolean;
  className?: string;
}

export function CurrencyDisplay({ showSelector = false, className = '' }: CurrencyDisplayProps) {
  const [currency, setCurrency] = useState<CurrencyConfig>(getCurrency('NG'));
  const [selectedCurrency, setSelectedCurrency] = useState<string>('NGN');

  useEffect(() => {
    detectUserCountry().then((countryCode) => {
      const userCurrency = getCurrency(countryCode);
      setCurrency(userCurrency);
      setSelectedCurrency(userCurrency.code);
    });
  }, []);

  const handleCurrencyChange = (currencyCode: string) => {
    const countryMap: Record<string, string> = {
      NGN: 'NG', KES: 'KE', GHS: 'GH', ZAR: 'ZA',
      EGP: 'EG', TZS: 'TZ', UGX: 'UG', XOF: 'SN', MAD: 'MA'
    };
    setSelectedCurrency(currencyCode);
    setCurrency(getCurrency(countryMap[currencyCode]));
  };

  if (showSelector) {
    return (
      <div className={className}>
        <select
          value={selectedCurrency}
          onChange={(e) => handleCurrencyChange(e.target.value)}
          className="px-3 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="NGN">🇳🇬 Nigeria</option>
          <option value="KES">🇰🇪 Kenya</option>
          <option value="GHS">🇬🇭 Ghana</option>
          <option value="ZAR">🇿🇦 South Africa</option>
          <option value="EGP">🇪🇬 Egypt</option>
          <option value="TZS">🇹🇿 Tanzania</option>
          <option value="UGX">🇺🇬 Uganda</option>
          <option value="XOF">🌍 West Africa</option>
          <option value="MAD">🇲🇦 Morocco</option>
        </select>
        <div className="mt-2 text-center">
          <span className="text-2xl font-bold">{formatPrice(currency.monthlyPrice, currency.code)}</span>
          <span className="text-gray-600 dark:text-gray-400">/month</span>
        </div>
      </div>
    );
  }

  return (
    <span className={className}>
      {formatPrice(currency.monthlyPrice, currency.code)}
    </span>
  );
}
