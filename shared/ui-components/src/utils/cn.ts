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

// Utility function for combining multiple class utilities
export function combineClasses(...classUtils: (string | undefined | null | false)[]) {
  return classUtils.filter(Boolean).join(' ');
}

// Utility function for dynamic class generation
export function dynamicClass(base: string, conditions: Record<string, boolean | undefined | null>) {
  const classes = [base];
  Object.entries(conditions).forEach(([className, condition]) => {
    if (condition) {
      classes.push(className);
    }
  });
  return classes.join(' ');
} 