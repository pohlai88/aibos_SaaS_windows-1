import type { Subscription } from '../types/billing/subscription';
import type { Currency } from '../types/billing/currency.enums';
import { CurrencyUtils } from '../types/billing/currency.enums';
import { SubscriptionPlan, BillingInterval } from '../types/billing/billing.enums';

// Create localization maps for user-friendly display names
const PLAN_DISPLAY_NAMES: Record<SubscriptionPlan, string> = {
  [SubscriptionPlan.FREE]: 'Free Tier',
  [SubscriptionPlan.PRO]: 'Professional',
  [SubscriptionPlan.ENTERPRISE]: 'Enterprise',
  // Add other plans as needed
};

const INTERVAL_DISPLAY_NAMES: Record<BillingInterval, string> = {
  [BillingInterval.MONTHLY]: 'month',
  [BillingInterval.YEARLY]: 'year',
  // Add other intervals as needed
};

/**
 * Gets appropriate locale for currency formatting
 * Maps currencies to their most common locale for proper formatting
 */
function getLocaleForCurrency(currency: Currency): string {
  const localeMap: Partial<Record<Currency, string>> = {
    // Major Global Currencies
    [Currency.USD]: 'en-US',
    [Currency.EUR]: 'de-DE',
    [Currency.GBP]: 'en-GB',
    [Currency.JPY]: 'ja-JP',
    [Currency.CNY]: 'zh-CN',
    [Currency.AUD]: 'en-AU',
    [Currency.CAD]: 'en-CA',
    [Currency.CHF]: 'de-CH',

    // Southeast Asian Currencies
    [Currency.MYR]: 'ms-MY',
    [Currency.SGD]: 'en-SG',
    [Currency.THB]: 'th-TH',
    [Currency.IDR]: 'id-ID',
    [Currency.PHP]: 'en-PH',
    [Currency.VND]: 'vi-VN',
    [Currency.BND]: 'ms-BN',
    [Currency.KHR]: 'km-KH',
    [Currency.LAK]: 'lo-LA',
    [Currency.MMK]: 'my-MM',

    // Other Asian Currencies
    [Currency.KRW]: 'ko-KR',
    [Currency.INR]: 'en-IN',
    [Currency.HKD]: 'zh-HK',
    [Currency.TWD]: 'zh-TW',
    [Currency.PKR]: 'en-PK',
    [Currency.BDT]: 'bn-BD',
    [Currency.LKR]: 'si-LK',
    [Currency.NPR]: 'ne-NP',
    [Currency.MNT]: 'mn-MN',

    // Middle Eastern Currencies
    [Currency.AED]: 'ar-AE',
    [Currency.SAR]: 'ar-SA',
    [Currency.QAR]: 'ar-QA',
    [Currency.KWD]: 'ar-KW',
    [Currency.BHD]: 'ar-BH',
    [Currency.OMR]: 'ar-OM',

    // African Currencies
    [Currency.ZAR]: 'en-ZA',
    [Currency.EGP]: 'ar-EG',
    [Currency.NGN]: 'en-NG',
    [Currency.KES]: 'en-KE',
    [Currency.GHS]: 'en-GH',

    // Latin American Currencies
    [Currency.BRL]: 'pt-BR',
    [Currency.MXN]: 'es-MX',
    [Currency.ARS]: 'es-AR',
    [Currency.CLP]: 'es-CL',
    [Currency.COP]: 'es-CO',
    [Currency.PEN]: 'es-PE',
  };

  return localeMap[currency] ?? 'en-US'; // Default fallback
}

/**
 * Formats a price with currency symbol and proper decimal places using Intl.NumberFormat
 * This provides more precise locale-specific formatting than basic string manipulation
 */
function formatPriceWithLocale(price: number, currency: Currency): string {
  const locale = getLocaleForCurrency(currency);

  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return formatter.format(price);
  } catch (error) {
    // Fallback to our CurrencyUtils if Intl.NumberFormat fails
    return CurrencyUtils.format(price, currency);
  }
}

// Different rendering formats
export type BillingRenderFormat = 'short' | 'full' | 'detailed';

/**
 * Renders billing information in a human-readable format
 * @param subscription - The subscription data to render
 * @param format - (Optional) The display format ('short', 'full', or 'detailed')
 * @returns Formatted billing information string
 * @throws {Error} When invalid format is specified
 */
export function renderBilling(
  subscription: Subscription,
  format: BillingRenderFormat = 'short',
): string {
  // Validate subscription first
  if (!subscription.plan || !subscription.price) {
    return 'Billing information not available';
  }

  try {
    const formattedPrice = formatPriceWithLocale(subscription.price, subscription.currency);
    const planName = PLAN_DISPLAY_NAMES[subscription.plan] || subscription.plan;
    const intervalName = INTERVAL_DISPLAY_NAMES[subscription.interval] || subscription.interval;

    switch (format) {
      case 'short':
        return `${planName} (${formattedPrice})`;
      case 'full':
        return `${planName}: ${formattedPrice}/${intervalName}`;
      case 'detailed':
        return `Subscription: ${planName}\nPrice: ${formattedPrice}\nBilled: ${intervalName}ly\nStatus: ${subscription.status}`;
      default:
        throw new Error(`Unknown render format: ${format}`);
    }
  } catch (error) {
    console.error('Error rendering billing information:', error);
    return 'Error displaying billing information';
  }
}

/**
 * Renders detailed billing information including status and dates
 */
export function renderDetailedBilling(subscription: Subscription): string {
  const formattedPrice = formatPriceWithLocale(subscription.price, subscription.currency);
  const planName = PLAN_DISPLAY_NAMES[subscription.plan];
  const intervalName = INTERVAL_DISPLAY_NAMES[subscription.interval];
  const statusText = subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1);

  let details = `${planName}: ${formattedPrice}/${intervalName} - ${statusText}`;

  if (subscription.trial_end_date) {
    const trialEnd = new Date(subscription.trial_end_date);
    const now = new Date();
    if (trialEnd > now) {
      const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      details += ` - Trial ends in ${daysLeft} days`;
    }
  }

  if (subscription.cancel_at_period_end) {
    details += ' - Cancels at period end';
  }

  return details;
}

/**
 * Renders a simple price display without plan information
 */
export function renderPrice(price: number, currency: Currency, interval?: BillingInterval): string {
  const formattedPrice = formatPriceWithLocale(price, currency);

  if (interval) {
    const intervalName = INTERVAL_DISPLAY_NAMES[interval];
    return `${formattedPrice}/${intervalName}`;
  }

  return formattedPrice;
}

/**
 * Renders billing summary for multiple subscriptions
 */
export function renderBillingSummary(subscriptions: Subscription[]): string {
  if (subscriptions.length === 0) {
    return 'No active subscriptions';
  }

  const totalByCurrency = subscriptions.reduce(
    (acc, sub) => {
      const key = sub.currency;
      if (!acc[key]) {
        acc[key] = { total: 0, currency: sub.currency };
      }
      acc[key].total += sub.price;
      return acc;
    },
    {} as Record<string, { total: number; currency: Currency }>,
  );

  const summaries = Object.values(totalByCurrency).map(({ total, currency }) =>
    formatPriceWithLocale(total, currency),
  );

  return `Total: ${summaries.join(', ')}`;
}

// Export types for consumers
export type { BillingRenderFormat };

/**
 * Renders billing information as HTML
 */
export function renderBillingHTML(subscription: Subscription): string {
  return `
    <div class="billing-info">
      <h3>${PLAN_DISPLAY_NAMES[subscription.plan]}</h3>
      <p class="price">${formatPriceWithLocale(subscription.price, subscription.currency)}</p>
      <p class="interval">per ${INTERVAL_DISPLAY_NAMES[subscription.interval]}</p>
    </div>
  `;
}
