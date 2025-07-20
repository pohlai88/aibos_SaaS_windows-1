import { z } from 'zod';
import { logger } from './logger';

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message: string;
  statusCode: number;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
}

/**
 * Security headers configuration
 */
export interface SecurityHeaders {
  'X-Frame-Options': string;
  'X-Content-Type-Options': string;
  'X-XSS-Protection': string;
  'Strict-Transport-Security': string;
  'Content-Security-Policy': string;
  'Referrer-Policy': string;
  'Permissions-Policy': string;
}

/**
 * Rate limiter implementation
 */
export class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();
  private config: RateLimitConfig;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100,
      message: 'Too many requests, please try again later.',
      statusCode: 429,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...config,
    };
  }

  /**
   * Check if request is allowed
   */
  isAllowed(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const record = this.requests.get(identifier);

    if (!record || now > record.resetTime) {
      // First request or window expired
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs,
      };
    }

    if (record.count >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
      };
    }

    // Increment count
    record.count++;
    this.requests.set(identifier, record);

    return {
      allowed: true,
      remaining: this.config.maxRequests - record.count,
      resetTime: record.resetTime,
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

/**
 * Security utilities for input validation and sanitization
 */
export class SecurityUtils {
  /**
   * Sanitize input by removing dangerous characters and scripts
   */
  static sanitizeInput(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  /**
   * Validate email address
   */
  static validateEmail(email: string): { valid: boolean; sanitized: string; error?: string } {
    const sanitized = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(sanitized)) {
      return { valid: false, sanitized, error: 'Invalid email format' };
    }

    return { valid: true, sanitized };
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): {
    valid: boolean;
    score: number;
    feedback?: string[];
  } {
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 8) score += 25;
    else feedback.push('Password should be at least 8 characters');

    if (/[A-Z]/.test(password)) score += 25;
    else feedback.push('Add uppercase letters');

    if (/[a-z]/.test(password)) score += 25;
    else feedback.push('Add lowercase letters');

    if (/[0-9]/.test(password)) score += 25;
    else feedback.push('Add numbers');

    if (/[^A-Za-z0-9]/.test(password)) score += 10;
    else feedback.push('Add special characters');

    return {
      valid: score >= 80,
      score,
      feedback: feedback.length > 0 ? feedback : undefined,
    };
  }

  /**
   * Generate secure random token
   */
  static generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    // Use crypto.randomInt if available, fallback to Math.random
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const array = new Uint8Array(length);
      crypto.getRandomValues(array);
      for (let i = 0; i < length; i++) {
        result += chars[array[i] % chars.length];
      }
    } else {
      for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
      }
    }

    return result;
  }

  /**
   * Detect potential security issues in input
   */
  static detectSecurityIssues(input: string): string[] {
    const issues: string[] = [];

    if (input.includes('DROP TABLE') || input.includes('SELECT *') || input.includes(';--')) {
      issues.push('Potential SQL injection detected');
    }

    if (input.includes('<script>') || input.includes('javascript:')) {
      issues.push('Potential XSS attack detected');
    }

    if (input.includes('rm -rf') || input.includes('del /f')) {
      issues.push('Potential command injection detected');
    }

    return issues;
  }
}

/**
 * Validation schemas for common types
 */
export const ValidationSchemas = {
  email: z.string().email(),
  password: z.string().min(8),
  uuid: z.string().uuid(),
  safeString: z.string().refine((val) => SecurityUtils.detectSecurityIssues(val).length === 0, {
    message: 'Input contains potentially dangerous content',
  }),
};

/**
 * Security middleware for Express applications
 */
export class SecurityMiddleware {
  public rateLimiter: RateLimiter;

  constructor(config?: Partial<RateLimitConfig>) {
    this.rateLimiter = new RateLimiter(config);
  }

  /**
   * Rate limiting middleware
   */
  rateLimit() {
    return (req: any, res: any, next: any) => {
      const identifier = req.ip || req.connection.remoteAddress;

      if (this.rateLimiter.isAllowed(identifier)) {
        next();
      } else {
        res.status(429).json({ error: 'Too many requests' });
      }
    };
  }

  /**
   * Security headers middleware
   */
  securityHeaders() {
    return (req: any, res: any, next: any) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      next();
    };
  }

  /**
   * Input validation middleware
   */
  validateInput(schema: z.ZodSchema) {
    return (req: any, res: any, next: any) => {
      try {
        schema.parse(req.body);
        next();
      } catch (error) {
        res.status(400).json({ error: 'Invalid input', details: error });
      }
    };
  }

  /**
   * Security scan middleware
   */
  securityScan() {
    return (req: any, res: any, next: any) => {
      const body = JSON.stringify(req.body || {});
      const issues = SecurityUtils.detectSecurityIssues(body);

      if (issues.length > 0) {
        res.status(403).json({ error: 'Security issues detected', issues });
        return;
      }

      next();
    };
  }

  /**
   * CORS middleware
   */
  cors(allowedOrigins: string[] = []) {
    return (req: any, res: any, next: any) => {
      const origin = req.headers.origin;

      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }

      if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.status(204).end();
        return;
      }

      next();
    };
  }
}

// Global security instance
export const security = new SecurityMiddleware();

/**
 * Cleanup rate limiter periodically
 */
setInterval(() => {
  security.rateLimiter.cleanup();
}, 60000); // Clean up every minute
