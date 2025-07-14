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
      ...config
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
        resetTime: now + this.config.windowMs
      });
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs
      };
    }

    if (record.count >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime
      };
    }

    // Increment count
    record.count++;
    this.requests.set(identifier, record);

    return {
      allowed: true,
      remaining: this.config.maxRequests - record.count,
      resetTime: record.resetTime
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
 * Input validation schemas
 */
export const ValidationSchemas = {
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  uuid: z.string().uuid('Invalid UUID format'),
  url: z.string().url('Invalid URL format'),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format'),
  date: z.string().datetime('Invalid date format'),
  integer: z.number().int('Must be an integer'),
  positiveNumber: z.number().positive('Must be a positive number'),
  nonEmptyString: z.string().min(1, 'String cannot be empty'),
  safeString: z.string()
    .min(1, 'String cannot be empty')
    .max(1000, 'String too long')
    .regex(/^[a-zA-Z0-9\s\-_.,!?@#$%^&*()+=:;'"`~<>[\]{}|\\/]+$/, 'Contains unsafe characters')
};

/**
 * Security utilities
 */
export class SecurityUtils {
  /**
   * Sanitize user input
   */
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * Validate and sanitize email
   */
  static validateEmail(email: string): { valid: boolean; sanitized?: string; error?: string } {
    try {
      const sanitized = this.sanitizeInput(email.toLowerCase());
      ValidationSchemas.email.parse(sanitized);
      return { valid: true, sanitized };
    } catch (error) {
      return { valid: false, error: error instanceof Error ? error.message : 'Invalid email' };
    }
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): { valid: boolean; error?: string; score: number } {
    try {
      ValidationSchemas.password.parse(password);
      
      // Calculate password strength score (0-100)
      let score = 0;
      if (password.length >= 8) score += 20;
      if (password.length >= 12) score += 10;
      if (/[a-z]/.test(password)) score += 20;
      if (/[A-Z]/.test(password)) score += 20;
      if (/\d/.test(password)) score += 20;
      if (/[^a-zA-Z0-9]/.test(password)) score += 10;

      return { valid: true, score };
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Invalid password',
        score: 0
      };
    }
  }

  /**
   * Generate secure random string
   */
  static generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const randomArray = new Uint8Array(length);
    crypto.getRandomValues(randomArray);
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(randomArray[i] % chars.length);
    }
    
    return result;
  }

  /**
   * Hash password (placeholder for bcrypt)
   */
  static async hashPassword(password: string): Promise<string> {
    // In production, use bcrypt or similar
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Verify password hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    const passwordHash = await this.hashPassword(password);
    return passwordHash === hash;
  }

  /**
   * Check for common security vulnerabilities
   */
  static detectSecurityIssues(input: string): string[] {
    const issues: string[] = [];
    
    // SQL Injection patterns
    const sqlPatterns = [
      /(\b(union|select|insert|update|delete|drop|create|alter)\b)/i,
      /(--|\/\*|\*\/|;)/,
      /(\b(exec|execute|xp_|sp_)\b)/i
    ];
    
    // XSS patterns
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi
    ];
    
    // Command injection patterns
    const cmdPatterns = [
      /(\b(cmd|powershell|bash|sh|exec|system)\b)/i,
      /[;&|`$()]/,
      /(\b(rm|del|format|mkfs)\b)/i
    ];

    sqlPatterns.forEach(pattern => {
      if (pattern.test(input)) {
        issues.push('Potential SQL injection detected');
      }
    });

    xssPatterns.forEach(pattern => {
      if (pattern.test(input)) {
        issues.push('Potential XSS attack detected');
      }
    });

    cmdPatterns.forEach(pattern => {
      if (pattern.test(input)) {
        issues.push('Potential command injection detected');
      }
    });

    return issues;
  }
}

/**
 * Security middleware for Express
 */
export class SecurityMiddleware {
  private rateLimiter: RateLimiter;
  private securityHeaders: SecurityHeaders;

  constructor() {
    this.rateLimiter = new RateLimiter();
    this.securityHeaders = {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:; frame-ancestors 'none';",
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    };
  }

  /**
   * Rate limiting middleware
   */
  rateLimit() {
    return (req: any, res: any, next: any) => {
      const identifier = req.ip || req.connection.remoteAddress || 'unknown';
      const result = this.rateLimiter.isAllowed(identifier);

      if (!result.allowed) {
        logger.warn('Rate limit exceeded', {
          ip: identifier,
          userAgent: req.headers['user-agent'],
          url: req.url
        });

        res.set({
          'X-RateLimit-Limit': this.rateLimiter.config.maxRequests,
          'X-RateLimit-Remaining': result.remaining,
          'X-RateLimit-Reset': result.resetTime
        });

        return res.status(this.rateLimiter.config.statusCode).json({
          error: this.rateLimiter.config.message
        });
      }

      res.set({
        'X-RateLimit-Limit': this.rateLimiter.config.maxRequests,
        'X-RateLimit-Remaining': result.remaining,
        'X-RateLimit-Reset': result.resetTime
      });

      next();
    };
  }

  /**
   * Security headers middleware
   */
  securityHeaders() {
    return (req: any, res: any, next: any) => {
      Object.entries(this.securityHeaders).forEach(([header, value]) => {
        res.set(header, value);
      });
      next();
    };
  }

  /**
   * Input validation middleware
   */
  validateInput(schema: z.ZodSchema, field: 'body' | 'query' | 'params' = 'body') {
    return (req: any, res: any, next: any) => {
      try {
        const validated = schema.parse(req[field]);
        req[field] = validated;
        next();
      } catch (error) {
        if (error instanceof z.ZodError) {
          logger.warn('Input validation failed', {
            field,
            errors: error.errors,
            ip: req.ip,
            url: req.url
          });

          return res.status(400).json({
            error: 'Validation failed',
            details: error.errors
          });
        }
        next(error);
      }
    };
  }

  /**
   * Security scanning middleware
   */
  securityScan() {
    return (req: any, res: any, next: any) => {
      const input = JSON.stringify(req.body) + JSON.stringify(req.query) + JSON.stringify(req.params);
      const issues = SecurityUtils.detectSecurityIssues(input);

      if (issues.length > 0) {
        logger.error('Security issues detected', {
          issues,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          url: req.url,
          body: req.body
        });

        return res.status(400).json({
          error: 'Security validation failed',
          message: 'Request contains potentially unsafe content'
        });
      }

      next();
    };
  }

  /**
   * CORS configuration
   */
  cors() {
    return (req: any, res: any, next: any) => {
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
      const origin = req.headers.origin;

      if (origin && allowedOrigins.includes(origin)) {
        res.set('Access-Control-Allow-Origin', origin);
      }

      res.set({
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Credentials': 'true'
      });

      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }

      next();
    };
  }
}

/**
 * Global security instance
 */
export const security = new SecurityMiddleware();

/**
 * Cleanup rate limiter periodically
 */
setInterval(() => {
  security.rateLimiter.cleanup();
}, 60000); // Clean up every minute 