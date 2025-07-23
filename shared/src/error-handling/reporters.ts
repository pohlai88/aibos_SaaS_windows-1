/**
 * AI-BOS Error Reporters
 *
 * Error reporting utilities.
 */

export * from './types';

export const ErrorReporters = {
  report: () => {},
  reportAsync: () => {},
  reportToService: () => {}
} as const;
