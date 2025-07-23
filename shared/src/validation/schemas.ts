/**
 * AI-BOS Validation Schemas
 *
 * Data validation schemas.
 */

export const ValidationSchemas = {
  email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  password: (value: string) => value.length >= 8,
  required: (value: any) => value !== null && value !== undefined && value !== ''
} as const;
