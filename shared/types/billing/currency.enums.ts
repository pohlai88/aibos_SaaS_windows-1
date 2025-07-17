/**
 * Supported currencies with complete ISO 4217 metadata
 * Focused on Southeast Asia and major global currencies
 */
export enum Currency {
  // Major Global Currencies
  USD = 'USD', // United States Dollar
  EUR = 'EUR', // Euro
  GBP = 'GBP', // British Pound Sterling
  JPY = 'JPY', // Japanese Yen
  CNY = 'CNY', // Chinese Yuan
  AUD = 'AUD', // Australian Dollar
  CAD = 'CAD', // Canadian Dollar
  CHF = 'CHF', // Swiss Franc

  // Southeast Asian Currencies
  MYR = 'MYR', // Malaysian Ringgit
  SGD = 'SGD', // Singapore Dollar
  THB = 'THB', // Thai Baht
  IDR = 'IDR', // Indonesian Rupiah
  PHP = 'PHP', // Philippine Peso
  VND = 'VND', // Vietnamese Dong
  BND = 'BND', // Brunei Dollar
  KHR = 'KHR', // Cambodian Riel
  LAK = 'LAK', // Lao Kip
  MMK = 'MMK', // Myanmar Kyat

  // Other Asian Currencies
  KRW = 'KRW', // South Korean Won
  INR = 'INR', // Indian Rupee
  HKD = 'HKD', // Hong Kong Dollar
  TWD = 'TWD', // Taiwan Dollar
  PKR = 'PKR', // Pakistani Rupee
  BDT = 'BDT', // Bangladeshi Taka
  LKR = 'LKR', // Sri Lankan Rupee
  NPR = 'NPR', // Nepalese Rupee
  MNT = 'MNT', // Mongolian Tugrik

  // Middle Eastern Currencies
  AED = 'AED', // UAE Dirham
  SAR = 'SAR', // Saudi Riyal
  QAR = 'QAR', // Qatari Riyal
  KWD = 'KWD', // Kuwaiti Dinar
  BHD = 'BHD', // Bahraini Dinar
  OMR = 'OMR', // Omani Rial

  // African Currencies
  ZAR = 'ZAR', // South African Rand
  EGP = 'EGP', // Egyptian Pound
  NGN = 'NGN', // Nigerian Naira
  KES = 'KES', // Kenyan Shilling
  GHS = 'GHS', // Ghanaian Cedi

  // Latin American Currencies
  BRL = 'BRL', // Brazilian Real
  MXN = 'MXN', // Mexican Peso
  ARS = 'ARS', // Argentine Peso
  CLP = 'CLP', // Chilean Peso
  COP = 'COP', // Colombian Peso
  PEN = 'PEN', // Peruvian Sol
}

/**
 * Currency metadata including symbols and formatting rules
 */
export interface CurrencyMetadata {
  symbol: string;
  name: string;
  nativeName: string; // Name in native language
  decimalDigits: number;
  rounding: number;
  symbolPosition: 'before' | 'after';
  thousandsSeparator: string;
  decimalSeparator: string;
  isoCode: string;
  country: string;
  region:
    | 'global'
    | 'southeast-asia'
    | 'asia'
    | 'middle-east'
    | 'africa'
    | 'latin-america'
    | 'europe'
    | 'north-america'
    | 'oceania';
  isActive: boolean; // For future deprecation
  priority: number; // For sorting/display priority
}

/**
 * Complete currency registry with formatting information
 */
export const CurrencyMetadataMap: Record<Currency, CurrencyMetadata> = {
  // Major Global Currencies
  [Currency.USD]: {
    symbol: '$',
    name: 'US Dollar',
    nativeName: 'US Dollar',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    isoCode: 'USD',
    country: 'United States',
    region: 'north-america',
    isActive: true,
    priority: 1,
  },
  [Currency.EUR]: {
    symbol: '€',
    name: 'Euro',
    nativeName: 'Euro',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'after',
    thousandsSeparator: '.',
    decimalSeparator: ',',
    isoCode: 'EUR',
    country: 'European Union',
    region: 'europe',
    isActive: true,
    priority: 2,
  },
  [Currency.GBP]: {
    symbol: '£',
    name: 'British Pound',
    nativeName: 'British Pound',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    isoCode: 'GBP',
    country: 'United Kingdom',
    region: 'europe',
    isActive: true,
    priority: 3,
  },
  [Currency.JPY]: {
    symbol: '¥',
    name: 'Japanese Yen',
    nativeName: '円',
    decimalDigits: 0,
    rounding: 0,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    isoCode: 'JPY',
    country: 'Japan',
    region: 'asia',
    isActive: true,
    priority: 4,
  },
  [Currency.CNY]: {
    symbol: '¥',
    name: 'Chinese Yuan',
    nativeName: '人民币',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    isoCode: 'CNY',
    country: 'China',
    region: 'asia',
    isActive: true,
    priority: 5,
  },
  [Currency.AUD]: {
    symbol: 'A$',
    name: 'Australian Dollar',
    nativeName: 'Australian Dollar',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    isoCode: 'AUD',
    country: 'Australia',
    region: 'oceania',
    isActive: true,
    priority: 6,
  },
  [Currency.CAD]: {
    symbol: 'C$',
    name: 'Canadian Dollar',
    nativeName: 'Canadian Dollar',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    isoCode: 'CAD',
    country: 'Canada',
    region: 'north-america',
    isActive: true,
    priority: 7,
  },
  [Currency.CHF]: {
    symbol: 'CHF',
    name: 'Swiss Franc',
    nativeName: 'Schweizer Franken',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    thousandsSeparator: "'",
    decimalSeparator: '.',
    isoCode: 'CHF',
    country: 'Switzerland',
    region: 'europe',
    isActive: true,
    priority: 8,
  },

  // Southeast Asian Currencies
  [Currency.MYR]: {
    symbol: 'RM',
    name: 'Malaysian Ringgit',
    nativeName: 'Ringgit Malaysia',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    isoCode: 'MYR',
    country: 'Malaysia',
    region: 'southeast-asia',
    isActive: true,
    priority: 10,
  },
  [Currency.SGD]: {
    symbol: 'S$',
    name: 'Singapore Dollar',
    nativeName: 'Singapore Dollar',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    isoCode: 'SGD',
    country: 'Singapore',
    region: 'southeast-asia',
    isActive: true,
    priority: 11,
  },
  [Currency.THB]: {
    symbol: '฿',
    name: 'Thai Baht',
    nativeName: 'บาท',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    isoCode: 'THB',
    country: 'Thailand',
    region: 'southeast-asia',
    isActive: true,
    priority: 12,
  },
  [Currency.IDR]: {
    symbol: 'Rp',
    name: 'Indonesian Rupiah',
    nativeName: 'Rupiah Indonesia',
    decimalDigits: 0,
    rounding: 0,
    symbolPosition: 'before',
    thousandsSeparator: '.',
    decimalSeparator: ',',
    isoCode: 'IDR',
    country: 'Indonesia',
    region: 'southeast-asia',
    isActive: true,
    priority: 13,
  },
  [Currency.PHP]: {
    symbol: '₱',
    name: 'Philippine Peso',
    nativeName: 'Piso ng Pilipinas',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    isoCode: 'PHP',
    country: 'Philippines',
    region: 'southeast-asia',
    isActive: true,
    priority: 14,
  },
  [Currency.VND]: {
    symbol: '₫',
    name: 'Vietnamese Dong',
    nativeName: 'Đồng Việt Nam',
    decimalDigits: 0,
    rounding: 0,
    symbolPosition: 'after',
    thousandsSeparator: '.',
    decimalSeparator: ',',
    isoCode: 'VND',
    country: 'Vietnam',
    region: 'southeast-asia',
    isActive: true,
    priority: 15,
  },
  [Currency.BND]: {
    symbol: 'B$',
    name: 'Brunei Dollar',
    nativeName: 'Dolar Brunei',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    isoCode: 'BND',
    country: 'Brunei',
    region: 'southeast-asia',
    isActive: true,
    priority: 16,
  },
  [Currency.KHR]: {
    symbol: '៛',
    name: 'Cambodian Riel',
    nativeName: 'រៀល',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'after',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    isoCode: 'KHR',
    country: 'Cambodia',
    region: 'southeast-asia',
    isActive: true,
    priority: 17,
  },
  [Currency.LAK]: {
    symbol: '₭',
    name: 'Lao Kip',
    nativeName: 'ກີບ',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'after',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    isoCode: 'LAK',
    country: 'Laos',
    region: 'southeast-asia',
    isActive: true,
    priority: 18,
  },
  [Currency.MMK]: {
    symbol: 'K',
    name: 'Myanmar Kyat',
    nativeName: 'ကျပ်',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'after',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    isoCode: 'MMK',
    country: 'Myanmar',
    region: 'southeast-asia',
    isActive: true,
    priority: 19,
  },

  // Other Asian Currencies
  [Currency.KRW]: {
    symbol: '₩',
    name: 'South Korean Won',
    nativeName: '원',
    decimalDigits: 0,
    rounding: 0,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    isoCode: 'KRW',
    country: 'South Korea',
    region: 'asia',
    isActive: true,
    priority: 20,
  },
  [Currency.INR]: {
    symbol: '₹',
    name: 'Indian Rupee',
    nativeName: 'भारतीय रुपया',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    isoCode: 'INR',
    country: 'India',
    region: 'asia',
    isActive: true,
    priority: 21,
  },
  [Currency.HKD]: {
    symbol: 'HK$',
    name: 'Hong Kong Dollar',
    nativeName: '港幣',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    isoCode: 'HKD',
    country: 'Hong Kong',
    region: 'asia',
    isActive: true,
    priority: 22,
  },
  [Currency.TWD]: {
    symbol: 'NT$',
    name: 'Taiwan Dollar',
    nativeName: '新台幣',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    isoCode: 'TWD',
    country: 'Taiwan',
    region: 'asia',
    isActive: true,
    priority: 23,
  },
  [Currency.PKR]: {
    symbol: '₨',
    name: 'Pakistani Rupee',
    nativeName: 'پاکستانی روپیہ',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    isoCode: 'PKR',
    country: 'Pakistan',
    region: 'asia',
    isActive: true,
    priority: 24,
  },
  [Currency.BDT]: {
    symbol: '৳',
    name: 'Bangladeshi Taka',
    nativeName: 'টাকা',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    isoCode: 'BDT',
    country: 'Bangladesh',
    region: 'asia',
    isActive: true,
    priority: 25,
  },
  [Currency.LKR]: {
    symbol: 'Rs',
    name: 'Sri Lankan Rupee',
    nativeName: 'ශ්‍රී ලංකා රුපියල්',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    isoCode: 'LKR',
    country: 'Sri Lanka',
    region: 'asia',
    isActive: true,
    priority: 26,
  },
  [Currency.NPR]: {
    symbol: '₨',
    name: 'Nepalese Rupee',
    nativeName: 'नेपाली रुपैयाँ',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    isoCode: 'NPR',
    country: 'Nepal',
    region: 'asia',
    isActive: true,
    priority: 27,
  },
  [Currency.MNT]: {
    symbol: '₮',
    name: 'Mongolian Tugrik',
    nativeName: 'Төгрөг',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'after',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    isoCode: 'MNT',
    country: 'Mongolia',
    region: 'asia',
    isActive: true,
    priority: 28,
  },

  // Middle Eastern Currencies
  [Currency.AED]: {
    symbol: 'د.إ',
    name: 'UAE Dirham',
    nativeName: 'درهم إماراتي',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    isoCode: 'AED',
    country: 'United Arab Emirates',
    region: 'middle-east',
    isActive: true,
    priority: 30,
  },
  [Currency.SAR]: {
    symbol: 'ر.س',
    name: 'Saudi Riyal',
    nativeName: 'ريال سعودي',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    isoCode: 'SAR',
    country: 'Saudi Arabia',
    region: 'middle-east',
    isActive: true,
    priority: 31,
  },
  [Currency.QAR]: {
    symbol: 'ر.ق',
    name: 'Qatari Riyal',
    nativeName: 'ريال قطري',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    isoCode: 'QAR',
    country: 'Qatar',
    region: 'middle-east',
    isActive: true,
    priority: 32,
  },
  [Currency.KWD]: {
    symbol: 'د.ك',
    name: 'Kuwaiti Dinar',
    nativeName: 'دينار كويتي',
    decimalDigits: 3,
    rounding: 0,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    isoCode: 'KWD',
    country: 'Kuwait',
    region: 'middle-east',
    isActive: true,
    priority: 33,
  },
  [Currency.BHD]: {
    symbol: 'د.ب',
    name: 'Bahraini Dinar',
    nativeName: 'دينار بحريني',
    decimalDigits: 3,
    rounding: 0,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    isoCode: 'BHD',
    country: 'Bahrain',
    region: 'middle-east',
    isActive: true,
    priority: 34,
  },
  [Currency.OMR]: {
    symbol: 'ر.ع.',
    name: 'Omani Rial',
    nativeName: 'ريال عماني',
    decimalDigits: 3,
    rounding: 0,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    isoCode: 'OMR',
    country: 'Oman',
    region: 'middle-east',
    isActive: true,
    priority: 35,
  },

  // African Currencies
  [Currency.ZAR]: {
    symbol: 'R',
    name: 'South African Rand',
    nativeName: 'Suid-Afrikaanse Rand',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    thousandsSeparator: ' ',
    decimalSeparator: '.',
    isoCode: 'ZAR',
    country: 'South Africa',
    region: 'africa',
    isActive: true,
    priority: 40,
  },
  [Currency.EGP]: {
    symbol: 'ج.م',
    name: 'Egyptian Pound',
    nativeName: 'جنيه مصري',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    isoCode: 'EGP',
    country: 'Egypt',
    region: 'africa',
    isActive: true,
    priority: 41,
  },
  [Currency.NGN]: {
    symbol: '₦',
    name: 'Nigerian Naira',
    nativeName: 'Naira',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    isoCode: 'NGN',
    country: 'Nigeria',
    region: 'africa',
    isActive: true,
    priority: 42,
  },
  [Currency.KES]: {
    symbol: 'KSh',
    name: 'Kenyan Shilling',
    nativeName: 'Shilingi ya Kenya',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    isoCode: 'KES',
    country: 'Kenya',
    region: 'africa',
    isActive: true,
    priority: 43,
  },
  [Currency.GHS]: {
    symbol: 'GH₵',
    name: 'Ghanaian Cedi',
    nativeName: 'Cedi',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    isoCode: 'GHS',
    country: 'Ghana',
    region: 'africa',
    isActive: true,
    priority: 44,
  },

  // Latin American Currencies
  [Currency.BRL]: {
    symbol: 'R$',
    name: 'Brazilian Real',
    nativeName: 'Real Brasileiro',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    thousandsSeparator: '.',
    decimalSeparator: ',',
    isoCode: 'BRL',
    country: 'Brazil',
    region: 'latin-america',
    isActive: true,
    priority: 50,
  },
  [Currency.MXN]: {
    symbol: '$',
    name: 'Mexican Peso',
    nativeName: 'Peso Mexicano',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    isoCode: 'MXN',
    country: 'Mexico',
    region: 'latin-america',
    isActive: true,
    priority: 51,
  },
  [Currency.ARS]: {
    symbol: '$',
    name: 'Argentine Peso',
    nativeName: 'Peso Argentino',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    thousandsSeparator: '.',
    decimalSeparator: ',',
    isoCode: 'ARS',
    country: 'Argentina',
    region: 'latin-america',
    isActive: true,
    priority: 52,
  },
  [Currency.CLP]: {
    symbol: '$',
    name: 'Chilean Peso',
    nativeName: 'Peso Chileno',
    decimalDigits: 0,
    rounding: 0,
    symbolPosition: 'before',
    thousandsSeparator: '.',
    decimalSeparator: ',',
    isoCode: 'CLP',
    country: 'Chile',
    region: 'latin-america',
    isActive: true,
    priority: 53,
  },
  [Currency.COP]: {
    symbol: '$',
    name: 'Colombian Peso',
    nativeName: 'Peso Colombiano',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    thousandsSeparator: '.',
    decimalSeparator: ',',
    isoCode: 'COP',
    country: 'Colombia',
    region: 'latin-america',
    isActive: true,
    priority: 54,
  },
  [Currency.PEN]: {
    symbol: 'S/',
    name: 'Peruvian Sol',
    nativeName: 'Sol Peruano',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    isoCode: 'PEN',
    country: 'Peru',
    region: 'latin-america',
    isActive: true,
    priority: 55,
  },
};

/**
 * Price object with currency handling
 */
export interface Money {
  amount: number;
  currency: Currency;
}

/**
 * Enhanced utility functions for currency handling
 */
export class CurrencyUtils {
  /**
   * Formats a monetary amount according to currency rules
   */
  static format(value: number, currency: Currency): string {
    const meta = CurrencyMetadataMap[currency];
    if (!meta) throw new Error(`Unsupported currency: ${currency}`);

    const formatted = value.toFixed(meta.decimalDigits);
    const [integer, decimal] = formatted.split('.');

    const withThousands = integer.replace(/\B(?=(\d{3})+(?!\d))/g, meta.thousandsSeparator);

    const formattedNumber =
      meta.decimalDigits > 0 ? `${withThousands}${meta.decimalSeparator}${decimal}` : withThousands;

    return meta.symbolPosition === 'before'
      ? `${meta.symbol}${formattedNumber}`
      : `${formattedNumber}${meta.symbol}`;
  }

  /**
   * Formats a Money object
   */
  static formatMoney(money: Money): string {
    return this.format(money.amount, money.currency);
  }

  /**
   * Converts between currencies using a rate table
   */
  static convert(
    amount: number,
    from: Currency,
    to: Currency,
    rates: Record<string, number>,
  ): number {
    if (from === to) return amount;
    const rateKey = `${from}_${to}`;
    const rate = rates[rateKey];
    if (!rate) throw new Error(`Conversion rate not found for ${rateKey}`);
    return amount * rate;
  }

  /**
   * Converts a Money object to another currency
   */
  static convertMoney(money: Money, toCurrency: Currency, rates: Record<string, number>): Money {
    return {
      amount: this.convert(money.amount, money.currency, toCurrency, rates),
      currency: toCurrency,
    };
  }

  /**
   * Gets all supported currencies
   */
  static listSupportedCurrencies(): CurrencyMetadata[] {
    return Object.values(CurrencyMetadataMap)
      .filter((currency) => currency.isActive)
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * Gets currencies by region
   */
  static getCurrenciesByRegion(region: CurrencyMetadata['region']): CurrencyMetadata[] {
    return Object.values(CurrencyMetadataMap)
      .filter((currency) => currency.region === region && currency.isActive)
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * Gets Southeast Asian currencies
   */
  static getSoutheastAsianCurrencies(): CurrencyMetadata[] {
    return this.getCurrenciesByRegion('southeast-asia');
  }

  /**
   * Gets Asian currencies
   */
  static getAsianCurrencies(): CurrencyMetadata[] {
    return this.getCurrenciesByRegion('asia');
  }

  /**
   * Validates if a currency is supported
   */
  static isSupported(currency: string): currency is Currency {
    return currency in CurrencyMetadataMap;
  }

  /**
   * Gets currency metadata
   */
  static getCurrencyMetadata(currency: Currency): CurrencyMetadata {
    const meta = CurrencyMetadataMap[currency];
    if (!meta) throw new Error(`Unsupported currency: ${currency}`);
    return meta;
  }

  /**
   * Parses a formatted currency string back to number
   */
  static parse(value: string, currency: Currency): number {
    const meta = CurrencyMetadataMap[currency];
    if (!meta) throw new Error(`Unsupported currency: ${currency}`);

    // Remove currency symbol
    let cleaned = value.replace(meta.symbol, '').trim();

    // Replace separators
    cleaned = cleaned.replace(new RegExp(`\\${meta.thousandsSeparator}`, 'g'), '');
    cleaned = cleaned.replace(meta.decimalSeparator, '.');

    const parsed = parseFloat(cleaned);
    if (isNaN(parsed)) throw new Error(`Invalid currency format: ${value}`);

    return parsed;
  }

  /**
   * Rounds amount according to currency rules
   */
  static round(amount: number, currency: Currency): number {
    const meta = CurrencyMetadataMap[currency];
    if (!meta) throw new Error(`Unsupported currency: ${currency}`);

    const factor = Math.pow(10, meta.decimalDigits);
    return Math.round(amount * factor) / factor;
  }
}

/**
 * Type for exchange rate tables
 */
export type ExchangeRates = Record<`${Currency}_${Currency}`, number>;

/**
 * Exchange rate provider interface for future extensibility
 */
export interface ExchangeRateProvider {
  getRate(from: Currency, to: Currency): Promise<number>;
  getRates(base: Currency, targets: Currency[]): Promise<Record<Currency, number>>;
  getSupportedCurrencies(): Promise<Currency[]>;
}

/**
 * Currency conversion service
 */
export class CurrencyConversionService {
  private rates: ExchangeRates = {};
  private provider?: ExchangeRateProvider;

  constructor(provider?: ExchangeRateProvider) {
    this.provider = provider;
  }

  /**
   * Set exchange rates manually
   */
  setRates(rates: ExchangeRates): void {
    this.rates = { ...this.rates, ...rates };
  }

  /**
   * Convert amount between currencies
   */
  async convert(amount: number, from: Currency, to: Currency): Promise<number> {
    if (from === to) return amount;

    // Try to get rate from provider first
    if (this.provider) {
      try {
        const rate = await this.provider.getRate(from, to);
        return amount * rate;
      } catch (error) {
        console.warn('Failed to get rate from provider, using cached rates');
      }
    }

    // Fall back to cached rates
    const rateKey = `${from}_${to}` as keyof ExchangeRates;
    const rate = this.rates[rateKey];
    if (!rate) throw new Error(`Conversion rate not found for ${rateKey}`);

    return amount * rate;
  }

  /**
   * Convert Money object to another currency
   */
  async convertMoney(money: Money, toCurrency: Currency): Promise<Money> {
    return {
      amount: await this.convert(money.amount, money.currency, toCurrency),
      currency: toCurrency,
    };
  }
}

// Example usage:
const price: Money = { amount: 1234.56, currency: Currency.USD };

// Format price for display
console.log(CurrencyUtils.format(price.amount, price.currency)); // "$1,234.56"

// Southeast Asian currency examples
console.log(CurrencyUtils.format(50000, Currency.MYR)); // "RM50,000.00"
console.log(CurrencyUtils.format(1500, Currency.THB)); // "฿1,500.00"
console.log(CurrencyUtils.format(1000000, Currency.IDR)); // "Rp1.000.000"
console.log(CurrencyUtils.format(25000, Currency.VND)); // "25.000₫"

// Get Southeast Asian currencies
const seaCurrencies = CurrencyUtils.getSoutheastAsianCurrencies();
console.log(
  'Southeast Asian currencies:',
  seaCurrencies.map((c) => c.isoCode),
);
// ["MYR", "SGD", "THB", "IDR", "PHP", "VND", "BND", "KHR", "LAK", "MMK"]
