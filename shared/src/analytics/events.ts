/**
 * AI-BOS Analytics Events
 *
 * Predefined analytics events and tracking utilities.
 */

export * from './tracker';

// Predefined event types and utilities
export const AnalyticsEvents = {
  // User interaction events
  CLICK: 'click',
  SCROLL: 'scroll',
  HOVER: 'hover',
  FOCUS: 'focus',
  BLUR: 'blur',

  // Navigation events
  PAGE_VIEW: 'page_view',
  PAGE_HIDE: 'page_hide',
  PAGE_SHOW: 'page_show',
  NAVIGATION: 'navigation',

  // Form events
  FORM_SUBMIT: 'form_submit',
  FORM_ERROR: 'form_error',
  FORM_VALIDATION: 'form_validation',

  // API events
  API_CALL: 'api_call',
  API_SUCCESS: 'api_success',
  API_ERROR: 'api_error',

  // Error events
  ERROR: 'error',
  WARNING: 'warning',

  // Performance events
  PERFORMANCE: 'performance',
  LOAD_TIME: 'load_time',
  RENDER_TIME: 'render_time',

  // Business events
  CONVERSION: 'conversion',
  PURCHASE: 'purchase',
  SIGNUP: 'signup',
  LOGIN: 'login',
  LOGOUT: 'logout'
} as const;
