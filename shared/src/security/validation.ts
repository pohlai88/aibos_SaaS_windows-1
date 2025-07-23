/**
 * AI-BOS Security Validation
 *
 * Critical security validation utilities for production use.
 */

/**
 * Security validation utilities
 */
export const SecurityValidation = {
  /**
   * Sanitize input to prevent XSS attacks
   */
  sanitizeInput: (input: string): string => {
    if (typeof input !== 'string') return '';
    return input
      .replace(/[<>]/g, '') // Basic XSS prevention
      .replace(/javascript:/gi, '') // Prevent javascript: URLs
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  },

  /**
   * Validate email format
   */
  validateEmail: (email: string): boolean => {
    if (typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  },

  /**
   * Validate password strength
   */
  validatePassword: (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (typeof password !== 'string') {
      errors.push('Password must be a string');
      return { isValid: false, errors };
    }

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Validate URL format
   */
  validateUrl: (url: string): boolean => {
    if (typeof url !== 'string') return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Validate phone number format
   */
  validatePhone: (phone: string): boolean => {
    if (typeof phone !== 'string') return false;
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  },

  /**
   * Validate and sanitize user input
   */
  validateAndSanitize: (input: string, type: 'text' | 'email' | 'url' | 'phone' = 'text'): {
    isValid: boolean;
    sanitized: string;
    errors: string[];
  } => {
    const errors: string[] = [];
    let sanitized = SecurityValidation.sanitizeInput(input);

    switch (type) {
      case 'email':
        if (!SecurityValidation.validateEmail(sanitized)) {
          errors.push('Invalid email format');
        }
        break;
      case 'url':
        if (!SecurityValidation.validateUrl(sanitized)) {
          errors.push('Invalid URL format');
        }
        break;
      case 'phone':
        if (!SecurityValidation.validatePhone(sanitized)) {
          errors.push('Invalid phone number format');
        }
        break;
      case 'text':
      default:
        if (sanitized.length === 0) {
          errors.push('Input cannot be empty');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      sanitized,
      errors
    };
  }
} as const;

/**
 * Rate limiting utility
 */
export const RateLimiter = {
  requests: new Map<string, { count: number; resetTime: number }>(),

  /**
   * Check if request is allowed
   */
  isAllowed: (key: string, limit: number = 100, windowMs: number = 60000): boolean => {
    const now = Date.now();
    const record = RateLimiter.requests.get(key);

    if (!record || now > record.resetTime) {
      RateLimiter.requests.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= limit) {
      return false;
    }

    record.count++;
    return true;
  },

  /**
   * Reset rate limiter for a key
   */
  reset: (key: string): void => {
    RateLimiter.requests.delete(key);
  }
};

/**
 * Security constants
 */
export const SECURITY_CONSTANTS = {
  MAX_INPUT_LENGTH: 1000,
  MAX_EMAIL_LENGTH: 254,
  MAX_PASSWORD_LENGTH: 128,
  MIN_PASSWORD_LENGTH: 8,
  RATE_LIMIT_DEFAULT: 100,
  RATE_LIMIT_WINDOW: 60000, // 1 minute
  ALLOWED_FILE_TYPES: ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx'],
  MAX_FILE_SIZE: 10 * 1024 * 1024 // 10MB
} as const;
