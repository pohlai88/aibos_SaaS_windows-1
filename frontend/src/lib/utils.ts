import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility function for conditional classes
export function classNames(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

// Utility function for responsive classes
export function responsiveClass(base: string, responsive: Record<string, string>) {
  const classes = [base];
  Object.entries(responsive).forEach(([breakpoint, className]) => {
    classes.push(`${breakpoint}:${className}`);
  });
  return classes.join(' ');
}

// Utility function for variant classes
export function variantClass(base: string, variants: Record<string, string>, variant?: string) {
  if (!variant || !variants[variant]) return base;
  return `${base} ${variants[variant]}`;
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date) {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function generateId() {
  return Math.random().toString(36).substr(2, 9);
} 