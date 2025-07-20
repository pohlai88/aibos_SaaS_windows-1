import type { AccountType } from '../types';

export function isDebitAccount(accountType: AccountType): boolean {
  return ['asset', 'expense'].includes(accountType);
}

export function isCreditAccount(accountType: AccountType): boolean {
  return ['liability', 'equity', 'revenue'].includes(accountType);
}

export function calculateAccountBalance(debits: number, credits: number, accountType: AccountType): number {
  if (isDebitAccount(accountType)) {
    return debits - credits;
  } else {
    return credits - debits;
  }
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

export function roundToDecimal(amount: number, decimals: number = 2): number {
  return Math.round(amount * Math.pow(10, decimals)) / Math.pow(10, decimals);
} 