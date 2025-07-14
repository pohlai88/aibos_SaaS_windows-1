import { 
  RateLimiter, 
  SecurityUtils, 
  SecurityMiddleware, 
  ValidationSchemas,
  security 
} from '../lib/security';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter({
      windowMs: 1000, // 1 second for testing
      maxRequests: 3
    });
  });

  describe('Rate Limiting', () => {
    it('should allow requests within limit', () => {
      const identifier = 'test-ip';
      
      const result1 = rateLimiter.isAllowed(identifier);
      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(2);

      const result2 = rateLimiter.isAllowed(identifier);
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(1);

      const result3 = rateLimiter.isAllowed(identifier);
      expect(result3.allowed).toBe(true);
      expect(result3.remaining).toBe(0);
    });

    it('should block requests over limit', () => {
      const identifier = 'test-ip';
      
      // Make 3 requests (at limit)
      rateLimiter.isAllowed(identifier);
      rateLimiter.isAllowed(identifier);
      rateLimiter.isAllowed(identifier);

      // 4th request should be blocked
      const result = rateLimiter.isAllowed(identifier);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should reset after window expires', async () => {
      const identifier = 'test-ip';
      
      // Make requests
      rateLimiter.isAllowed(identifier);
      rateLimiter.isAllowed(identifier);
      rateLimiter.isAllowed(identifier);

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Should be allowed again
      const result = rateLimiter.isAllowed(identifier);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);
    });

    it('should handle different identifiers separately', () => {
      const ip1 = '192.168.1.1';
      const ip2 = '192.168.1.2';

      // Both should be allowed
      expect(rateLimiter.isAllowed(ip1).allowed).toBe(true);
      expect(rateLimiter.isAllowed(ip2).allowed).toBe(true);
    });
  });

  describe('Cleanup', () => {
    it('should clean up expired entries', async () => {
      const identifier = 'test-ip';
      
      rateLimiter.isAllowed(identifier);
      
      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      rateLimiter.cleanup();
      
      // Should be allowed again
      const result = rateLimiter.isAllowed(identifier);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);
    });
  });
});

describe('SecurityUtils', () => {
  describe('Input Sanitization', () => {
    it('should sanitize HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello';
      const sanitized = SecurityUtils.sanitizeInput(input);
      expect(sanitized).toBe('alert("xss")Hello');
    });

    it('should remove javascript protocol', () => {
      const input = 'javascript:alert("xss")';
      const sanitized = SecurityUtils.sanitizeInput(input);
      expect(sanitized).toBe('alert("xss")');
    });

    it('should remove event handlers', () => {
      const input = 'onclick=alert("xss")';
      const sanitized = SecurityUtils.sanitizeInput(input);
      expect(sanitized).toBe('alert("xss")');
    });

    it('should trim whitespace', () => {
      const input = '  test  ';
      const sanitized = SecurityUtils.sanitizeInput(input);
      expect(sanitized).toBe('test');
    });
  });

  describe('Email Validation', () => {
    it('should validate correct email', () => {
      const result = SecurityUtils.validateEmail('test@example.com');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('test@example.com');
    });

    it('should reject invalid email', () => {
      const result = SecurityUtils.validateEmail('invalid-email');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should sanitize and lowercase email', () => {
      const result = SecurityUtils.validateEmail('  TEST@EXAMPLE.COM  ');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('test@example.com');
    });
  });

  describe('Password Validation', () => {
    it('should validate strong password', () => {
      const result = SecurityUtils.validatePassword('StrongPass123');
      expect(result.valid).toBe(true);
      expect(result.score).toBeGreaterThan(80);
    });

    it('should reject weak password', () => {
      const result = SecurityUtils.validatePassword('weak');
      expect(result.valid).toBe(false);
      expect(result.score).toBe(0);
    });

    it('should calculate password strength score', () => {
      const result = SecurityUtils.validatePassword('Password123!');
      expect(result.valid).toBe(true);
      expect(result.score).toBeGreaterThan(0);
    });
  });

  describe('Secure Token Generation', () => {
    it('should generate token of specified length', () => {
      const token = SecurityUtils.generateSecureToken(16);
      expect(token).toHaveLength(16);
    });

    it('should generate different tokens', () => {
      const token1 = SecurityUtils.generateSecureToken();
      const token2 = SecurityUtils.generateSecureToken();
      expect(token1).not.toBe(token2);
    });

    it('should generate alphanumeric tokens', () => {
      const token = SecurityUtils.generateSecureToken(32);
      expect(token).toMatch(/^[A-Za-z0-9]+$/);
    });
  });

  describe('Security Issue Detection', () => {
    it('should detect SQL injection patterns', () => {
      const input = "'; DROP TABLE users; --";
      const issues = SecurityUtils.detectSecurityIssues(input);
      expect(issues).toContain('Potential SQL injection detected');
    });

    it('should detect XSS patterns', () => {
      const input = '<script>alert("xss")</script>';
      const issues = SecurityUtils.detectSecurityIssues(input);
      expect(issues).toContain('Potential XSS attack detected');
    });

    it('should detect command injection patterns', () => {
      const input = 'rm -rf /';
      const issues = SecurityUtils.detectSecurityIssues(input);
      expect(issues).toContain('Potential command injection detected');
    });

    it('should return empty array for safe input', () => {
      const input = 'Hello, world!';
      const issues = SecurityUtils.detectSecurityIssues(input);
      expect(issues).toHaveLength(0);
    });
  });
});

describe('ValidationSchemas', () => {
  describe('Email Schema', () => {
    it('should validate correct email', () => {
      expect(() => ValidationSchemas.email.parse('test@example.com')).not.toThrow();
    });

    it('should reject invalid email', () => {
      expect(() => ValidationSchemas.email.parse('invalid')).toThrow();
    });
  });

  describe('Password Schema', () => {
    it('should validate strong password', () => {
      expect(() => ValidationSchemas.password.parse('StrongPass123')).not.toThrow();
    });

    it('should reject weak password', () => {
      expect(() => ValidationSchemas.password.parse('weak')).toThrow();
    });
  });

  describe('UUID Schema', () => {
    it('should validate correct UUID', () => {
      expect(() => ValidationSchemas.uuid.parse('123e4567-e89b-12d3-a456-426614174000')).not.toThrow();
    });

    it('should reject invalid UUID', () => {
      expect(() => ValidationSchemas.uuid.parse('invalid-uuid')).toThrow();
    });
  });

  describe('Safe String Schema', () => {
    it('should validate safe string', () => {
      expect(() => ValidationSchemas.safeString.parse('Hello, world!')).not.toThrow();
    });

    it('should reject unsafe characters', () => {
      expect(() => ValidationSchemas.safeString.parse('<script>')).toThrow();
    });

    it('should reject empty string', () => {
      expect(() => ValidationSchemas.safeString.parse('')).toThrow();
    });

    it('should reject very long string', () => {
      const longString = 'a'.repeat(1001);
      expect(() => ValidationSchemas.safeString.parse(longString)).toThrow();
    });
  });
});

describe('SecurityMiddleware', () => {
  let middleware: SecurityMiddleware;
  let mockReq: any;
  let mockRes: any;
  let mockNext: jest.Mock;

  beforeEach(() => {
    middleware = new SecurityMiddleware();
    mockReq = {
      ip: '127.0.0.1',
      method: 'GET',
      url: '/api/test',
      headers: {
        'user-agent': 'test-agent'
      },
      body: {},
      query: {},
      params: {}
    };
    mockRes = {
      set: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  describe('Rate Limiting Middleware', () => {
    it('should allow requests within limit', () => {
      const rateLimitMiddleware = middleware.rateLimit();
      rateLimitMiddleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.set).toHaveBeenCalledWith(
        expect.objectContaining({
          'X-RateLimit-Limit': expect.any(Number),
          'X-RateLimit-Remaining': expect.any(Number)
        })
      );
    });

    it('should block requests over limit', () => {
      const rateLimitMiddleware = middleware.rateLimit();
      
      // Make multiple requests to exceed limit
      for (let i = 0; i < 150; i++) {
        rateLimitMiddleware(mockReq, mockRes, mockNext);
      }

      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: expect.stringContaining('Too many requests')
      });
    });
  });

  describe('Security Headers Middleware', () => {
    it('should set security headers', () => {
      const headersMiddleware = middleware.securityHeaders();
      headersMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith(
        'X-Frame-Options',
        'DENY'
      );
      expect(mockRes.set).toHaveBeenCalledWith(
        'X-Content-Type-Options',
        'nosniff'
      );
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Input Validation Middleware', () => {
    it('should validate request body', () => {
      const validationMiddleware = middleware.validateInput(ValidationSchemas.email, 'body');
      mockReq.body = { email: 'test@example.com' };
      
      validationMiddleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.body).toEqual({ email: 'test@example.com' });
    });

    it('should reject invalid input', () => {
      const validationMiddleware = middleware.validateInput(ValidationSchemas.email, 'body');
      mockReq.body = { email: 'invalid-email' };
      
      validationMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: expect.any(Array)
      });
    });
  });

  describe('Security Scan Middleware', () => {
    it('should allow safe requests', () => {
      const scanMiddleware = middleware.securityScan();
      mockReq.body = { message: 'Hello, world!' };
      
      scanMiddleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should block requests with security issues', () => {
      const scanMiddleware = middleware.securityScan();
      mockReq.body = { query: "'; DROP TABLE users; --" };
      
      scanMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Security validation failed',
        message: 'Request contains potentially unsafe content'
      });
    });
  });

  describe('CORS Middleware', () => {
    it('should handle allowed origin', () => {
      const corsMiddleware = middleware.cors();
      mockReq.headers.origin = 'http://localhost:3000';
      
      corsMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith(
        'Access-Control-Allow-Origin',
        'http://localhost:3000'
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle OPTIONS request', () => {
      const corsMiddleware = middleware.cors();
      mockReq.method = 'OPTIONS';
      
      corsMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.end).toHaveBeenCalled();
    });
  });
});

describe('Global Security Instance', () => {
  it('should be properly configured', () => {
    expect(security).toBeInstanceOf(SecurityMiddleware);
  });

  it('should have rate limiter', () => {
    expect(security.rateLimiter).toBeDefined();
  });
}); 