import type { Money, ExchangeRates } from '../types/billing/currency.enums';
import {
  Currency,
  CurrencyUtils,
  CurrencyConversionService,
} from '../types/billing/currency.enums';

/**
 * Example 1: Southeast Asian Currency Formatting
 */
export function exampleSoutheastAsianFormatting() {
  console.log('=== Southeast Asian Currency Formatting ===');

  const seaCurrencies = CurrencyUtils.getSoutheastAsianCurrencies();

  seaCurrencies.forEach((currency) => {
    const amount = 1234567.89;
    const formatted = CurrencyUtils.format(amount, currency.isoCode as Currency);
    console.log(`${currency.name} (${currency.isoCode}): ${formatted}`);
  });
}

/**
 * Example 2: Currency Metadata by Region
 */
export function exampleCurrencyByRegion() {
  console.log('=== Currencies by Region ===');

  const regions = ['southeast-asia', 'asia', 'middle-east', 'africa', 'latin-america'] as const;

  regions.forEach((region) => {
    const currencies = CurrencyUtils.getCurrenciesByRegion(region);
    console.log(`\n${region.toUpperCase()}:`);
    currencies.forEach((currency) => {
      console.log(`  ${currency.isoCode} - ${currency.name} (${currency.symbol})`);
    });
  });
}

/**
 * Example 3: Money Object Operations
 */
export function exampleMoneyOperations() {
  console.log('=== Money Object Operations ===');

  const prices: Money[] = [
    { amount: 99.99, currency: Currency.USD },
    { amount: 1500, currency: Currency.THB },
    { amount: 50000, currency: Currency.MYR },
    { amount: 1000000, currency: Currency.IDR },
    { amount: 25000, currency: Currency.VND },
  ];

  prices.forEach((price) => {
    const formatted = CurrencyUtils.formatMoney(price);
    console.log(`${price.currency}: ${formatted}`);
  });
}

/**
 * Example 4: Currency Conversion
 */
export function exampleCurrencyConversion() {
  console.log('=== Currency Conversion ===');

  // Sample exchange rates (in real app, these would come from an API)
  const rates: ExchangeRates = {
    USD_MYR: 4.2,
    USD_THB: 35.5,
    USD_SGD: 1.35,
    USD_IDR: 15000,
    USD_VND: 24000,
    MYR_USD: 0.238,
    THB_USD: 0.028,
    SGD_USD: 0.741,
    IDR_USD: 0.000067,
    VND_USD: 0.000042,
  };

  const usdPrice: Money = { amount: 100, currency: Currency.USD };

  const seaCurrencies = [Currency.MYR, Currency.THB, Currency.SGD, Currency.IDR, Currency.VND];

  seaCurrencies.forEach((targetCurrency) => {
    try {
      const converted = CurrencyUtils.convertMoney(usdPrice, targetCurrency, rates);
      const formatted = CurrencyUtils.formatMoney(converted);
      console.log(`$100 USD = ${formatted}`);
    } catch (error) {
      console.log(`Cannot convert to ${targetCurrency}: ${error}`);
    }
  });
}

/**
 * Example 5: Currency Conversion Service
 */
export async function exampleCurrencyConversionService() {
  console.log('=== Currency Conversion Service ===');

  const conversionService = new CurrencyConversionService();

  // Set some sample rates
  const rates: ExchangeRates = {
    USD_MYR: 4.2,
    USD_THB: 35.5,
    USD_SGD: 1.35,
    MYR_USD: 0.238,
    THB_USD: 0.028,
    SGD_USD: 0.741,
  };

  conversionService.setRates(rates);

  const prices: Money[] = [
    { amount: 50, currency: Currency.USD },
    { amount: 200, currency: Currency.MYR },
    { amount: 1000, currency: Currency.THB },
  ];

  for (const price of prices) {
    console.log(`\nConverting ${CurrencyUtils.formatMoney(price)}:`);

    const targetCurrencies = [Currency.USD, Currency.MYR, Currency.THB, Currency.SGD];

    for (const targetCurrency of targetCurrencies) {
      if (price.currency !== targetCurrency) {
        try {
          const converted = await conversionService.convertMoney(price, targetCurrency);
          console.log(`  → ${CurrencyUtils.formatMoney(converted)}`);
        } catch (error) {
          console.log(`  → Cannot convert to ${targetCurrency}`);
        }
      }
    }
  }
}

/**
 * Example 6: Currency Parsing
 */
export function exampleCurrencyParsing() {
  console.log('=== Currency Parsing ===');

  const formattedValues = [
    { value: '$1,234.56', currency: Currency.USD },
    { value: 'RM5,000.00', currency: Currency.MYR },
    { value: '฿2,500.00', currency: Currency.THB },
    { value: 'Rp1.500.000', currency: Currency.IDR },
    { value: '50.000₫', currency: Currency.VND },
  ];

  formattedValues.forEach(({ value, currency }) => {
    try {
      const parsed = CurrencyUtils.parse(value, currency);
      console.log(`${value} (${currency}) = ${parsed}`);
    } catch (error) {
      console.log(`Failed to parse ${value}: ${error}`);
    }
  });
}

/**
 * Example 7: Currency Rounding
 */
export function exampleCurrencyRounding() {
  console.log('=== Currency Rounding ===');

  const testAmounts = [123.456, 99.999, 1000.001];
  const testCurrencies = [Currency.USD, Currency.JPY, Currency.KWD]; // Different decimal places

  testCurrencies.forEach((currency) => {
    const meta = CurrencyUtils.getCurrencyMetadata(currency);
    console.log(`\n${currency} (${meta.decimalDigits} decimal places):`);

    testAmounts.forEach((amount) => {
      const rounded = CurrencyUtils.round(amount, currency);
      const formatted = CurrencyUtils.format(rounded, currency);
      console.log(`  ${amount} → ${rounded} → ${formatted}`);
    });
  });
}

/**
 * Example 8: Currency Validation
 */
export function exampleCurrencyValidation() {
  console.log('=== Currency Validation ===');

  const testCurrencies = ['USD', 'MYR', 'THB', 'INVALID', 'SGD'];

  testCurrencies.forEach((currency) => {
    const isValid = CurrencyUtils.isSupported(currency);
    console.log(`${currency}: ${isValid ? '✓ Supported' : '✗ Not supported'}`);

    if (isValid) {
      const meta = CurrencyUtils.getCurrencyMetadata(currency as Currency);
      console.log(`  Name: ${meta.name}`);
      console.log(`  Symbol: ${meta.symbol}`);
      console.log(`  Region: ${meta.region}`);
    }
  });
}

/**
 * Example 9: Regional Currency Comparison
 */
export function exampleRegionalComparison() {
  console.log('=== Regional Currency Comparison ===');

  const regions = ['southeast-asia', 'asia', 'middle-east'] as const;
  const testAmount = 1000;

  regions.forEach((region) => {
    const currencies = CurrencyUtils.getCurrenciesByRegion(region);
    console.log(`\n${region.toUpperCase()} (${currencies.length} currencies):`);

    currencies.slice(0, 5).forEach((currency) => {
      // Show first 5 for brevity
      const formatted = CurrencyUtils.format(testAmount, currency.isoCode as Currency);
      console.log(`  ${currency.isoCode}: ${formatted}`);
    });
  });
}

/**
 * Example 10: Currency Priority and Sorting
 */
export function exampleCurrencyPriority() {
  console.log('=== Currency Priority and Sorting ===');

  const allCurrencies = CurrencyUtils.listSupportedCurrencies();

  console.log('Top 10 currencies by priority:');
  allCurrencies.slice(0, 10).forEach((currency, index) => {
    console.log(
      `${index + 1}. ${currency.isoCode} - ${currency.name} (Priority: ${currency.priority})`,
    );
  });

  console.log('\nSoutheast Asian currencies by priority:');
  const seaCurrencies = CurrencyUtils.getSoutheastAsianCurrencies();
  seaCurrencies.forEach((currency, index) => {
    console.log(
      `${index + 1}. ${currency.isoCode} - ${currency.name} (Priority: ${currency.priority})`,
    );
  });
}

/**
 * Run all currency examples
 */
export async function runAllCurrencyExamples() {
  exampleSoutheastAsianFormatting();
  exampleCurrencyByRegion();
  exampleMoneyOperations();
  exampleCurrencyConversion();
  await exampleCurrencyConversionService();
  exampleCurrencyParsing();
  exampleCurrencyRounding();
  exampleCurrencyValidation();
  exampleRegionalComparison();
  exampleCurrencyPriority();
}
