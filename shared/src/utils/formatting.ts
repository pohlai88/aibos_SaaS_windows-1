/**
 * AI-BOS Formatting Utilities
 *
 * Data formatting utilities.
 */

export const formatDate = (date: Date): string => {
  return date.toISOString();
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};
