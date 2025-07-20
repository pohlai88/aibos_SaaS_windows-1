export interface ExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  effectiveDate: string;
  source: string;
}

export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRate: number
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  return amount * exchangeRate;
}

export function validateCurrencyCode(currencyCode: string): boolean {
  const validCurrencies = [
    'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'BRL'
  ];
  return validCurrencies.includes(currencyCode.toUpperCase());
}

export function formatCurrencyCode(currencyCode: string): string {
  return currencyCode.toUpperCase();
} 