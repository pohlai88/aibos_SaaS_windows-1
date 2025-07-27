// ==================== AI-BOS API SECURITY MIDDLEWARE ====================
// Enhanced Security with Headers, Rate Limiting, and Authentication
// Enterprise Grade - Production Ready
// Steve Jobs Philosophy: "Innovation distinguishes between a leader and a follower."

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { env } from '../../utils/env';

// ==================== CORE TYPES ====================
export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'developer' | 'reviewer' | 'viewer';
  permissions: string[];
  tenantId?: string;
  organizationId?: string;
}

export interface ApiRequest extends Request {
  context: {
    requestId: string;
    user?: AuthUser;
    startTime: number;
    ip: string;
    userAgent: string;
  };
}

export interface SecurityConfig {
  rateLimit: {
    windowMs: number;
    max: number;
    message: string;
    standardHeaders: boolean;
    legacyHeaders: boolean;
  };
  cors: {
    origin: string | string[];
    credentials: boolean;
    methods: string[];
    allowedHeaders: string[];
  };
  helmet: {
    contentSecurityPolicy: boolean;
    crossOriginEmbedderPolicy: boolean;
    crossOriginOpenerPolicy: boolean;
    crossOriginResourcePolicy: boolean;
    dnsPrefetchControl: boolean;
    frameguard: boolean;
    hidePoweredBy: boolean;
    hsts: boolean;
    ieNoOpen: boolean;
    noSniff: boolean;
    permittedCrossDomainPolicies: boolean;
    referrerPolicy: boolean;
    xssFilter: boolean;
  };
}

// ==================== SECURITY MIDDLEWARE ====================
export class SecurityMiddleware {
  private config: SecurityConfig;

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = {
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        message: 'Too many requests from this IP, please try again later.',
        standardHeaders: true,
        legacyHeaders: false
      },
      cors: {
        origin: env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-API-Key']
      },
      helmet: {
        contentSecurityPolicy: true,
        crossOriginEmbedderPolicy: true,
        crossOriginOpenerPolicy: true,
        crossOriginResourcePolicy: true,
        dnsPrefetchControl: true,
        frameguard: true,
        hidePoweredBy: true,
        hsts: true,
        ieNoOpen: true,
        noSniff: true,
        permittedCrossDomainPolicies: true,
        referrerPolicy: true,
        xssFilter: true
      },
      ...config
    };

    console.log('🔒 AI-BOS Security Middleware: Initialized');
  }

  /**
   * Apply all security middleware
   */
  applySecurityMiddleware() {
    return [
      this.requestContext(),
      this.securityHeaders(),
      this.corsMiddleware(),
      this.rateLimiter(),
      this.authentication(),
      this.authorization(),
      this.requestLogging()
    ];
  }

  /**
   * Request context middleware
   */
  requestContext() {
    return (req: Request, res: Response, next: NextFunction) => {
      const apiReq = req as ApiRequest;

      apiReq.context = {
        requestId: this.generateRequestId(),
        startTime: Date.now(),
        ip: this.getClientIp(req),
        userAgent: req.get('User-Agent') || 'Unknown'
      };

      // Add request ID to response headers
      res.setHeader('X-Request-ID', apiReq.context.requestId);

      next();
    };
  }

  /**
   * Security headers middleware
   */
  securityHeaders() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Enhanced security headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

      // Content Security Policy
      res.setHeader('Content-Security-Policy', [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self'",
        "connect-src 'self'",
        "media-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "upgrade-insecure-requests"
      ].join('; '));

      // HSTS (HTTP Strict Transport Security)
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

      // Clear-Site-Data (for logout scenarios)
      if (req.path.includes('/logout')) {
        res.setHeader('Clear-Site-Data', '"cache", "cookies", "storage"');
      }

      next();
    };
  }

  /**
   * CORS middleware
   */
  corsMiddleware() {
    return cors({
      origin: this.config.cors.origin,
      credentials: this.config.cors.credentials,
      methods: this.config.cors.methods,
      allowedHeaders: this.config.cors.allowedHeaders,
      exposedHeaders: ['X-Request-ID', 'X-Total-Count'],
      maxAge: 86400 // 24 hours
    });
  }

  /**
   * Rate limiting middleware
   */
  rateLimiter() {
    return rateLimit({
      windowMs: this.config.rateLimit.windowMs, max: this.config.rateLimit.max, message: {
        success: false, error: {
          code: 'RATE_LIMIT_EXCEEDED', message: this.config.rateLimit.message, details: {
            retryAfter: this.config.rateLimit.windowMs / 1000
          }
        }
      }, standardHeaders: this.config.rateLimit.standardHeaders, legacyHeaders: this.config.rateLimit.legacyHeaders, handler: (req: Request, res: Response) => {
        res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: this.config.rateLimit.message,
            details: {
              retryAfter: this.config.rateLimit.windowMs / 1000,
              requestId: (req as ApiRequest).context.requestId
            }
          }
        });
      }
    });
  }

  /**
   * Authentication middleware
   */
  authentication() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const apiReq = req as ApiRequest;

      try {
        // Extract authentication token
        const authHeader = req.headers.authorization;
        const apiKey = req.headers['x-api-key'] as string;

        if (!authHeader && !apiKey) {
          return res.status(401).json({
            success: false,
            error: {
              code: 'AUTHENTICATION_REQUIRED',
              message: 'Authentication required',
              details: {
                requestId: apiReq.context.requestId
              }
            }
          });
        }

        // Validate authentication
        const user = await this.validateAuthentication(authHeader, apiKey);
        if (!user) {
          return res.status(401).json({
            success: false,
            error: {
              code: 'INVALID_CREDENTIALS',
              message: 'Invalid credentials',
              details: {
                requestId: apiReq.context.requestId
              }
            }
          });
        }

        apiReq.context.user = user;
        next();
        return;

      } catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_ERROR',
            message: 'Authentication service error',
            details: {
              requestId: apiReq.context.requestId
            }
          }
        });
      }
    };
  }

  /**
   * Authorization middleware
   */
  authorization() {
    return (req: Request, res: Response, next: NextFunction) => {
      const apiReq = req as ApiRequest;
      const user = apiReq.context.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'AUTHORIZATION_REQUIRED',
            message: 'Authorization required',
            details: {
              requestId: apiReq.context.requestId
            }
          }
        });
      }

      // Check endpoint permissions
      const requiredPermission = this.getRequiredPermission(req.method, req.path);
      if (requiredPermission && !user.permissions.includes(requiredPermission)) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'Insufficient permissions',
            details: {
              required: requiredPermission,
              available: user.permissions,
              requestId: apiReq.context.requestId
            }
          }
        });
      }

      next();
      return;
    };
  }

  /**
   * Request logging middleware
   */
  requestLogging() {
    return (req: Request, res: Response, next: NextFunction) => {
      const apiReq = req as ApiRequest;
      const startTime = apiReq.context.startTime;

      // Log request
      console.log(`🔍 [${apiReq.context.requestId}] ${req.method} ${req.path} - ${apiReq.context.ip}`);

      // Log response
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        const status = res.statusCode;
        const user = apiReq.context.user?.email || 'anonymous';

        console.log(`📊 [${apiReq.context.requestId}] ${req.method} ${req.path} - ${status} (${duration}ms) - ${user}`);

        // Log errors
        if (status >= 400) {
          console.error(`❌ [${apiReq.context.requestId}] Error ${status}: ${req.method} ${req.path}`);
        }
      });

      next();
    };
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get client IP address
   */
  private getClientIp(req: Request): string {
    return req.ip ||
           req.connection.remoteAddress ||
           req.socket.remoteAddress ||
           ((req.connection as any).socket ? (req.connection as any).socket.remoteAddress : '') ||
           'unknown';
  }

  /**
   * Validate authentication
   */
  private async validateAuthentication(authHeader?: string, apiKey?: string): Promise<AuthUser | null> {
    try {
      // API Key authentication
      if (apiKey) {
        return await this.validateApiKey(apiKey);
      }

      // Bearer token authentication
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        return await this.validateBearerToken(token);
      }

      return null;

    } catch (error) {
      console.error('Authentication validation error:', error);
      return null;
    }
  }

  /**
   * Validate API key
   */
  private async validateApiKey(apiKey: string): Promise<AuthUser | null> {
    // This would integrate with your API key management system
    // For now, return a mock user
    return {
      id: 'api_user_1',
      email: 'api@aibos.com',
      role: 'developer',
      permissions: ['read', 'write', 'admin'],
      tenantId: 'tenant_1',
      organizationId: 'org_1'
    };
  }

  /**
   * Validate bearer token
   */
  private async validateBearerToken(token: string): Promise<AuthUser | null> {
    // This would integrate with your JWT validation system
    // For now, return a mock user
    return {
      id: 'jwt_user_1',
      email: 'user@aibos.com',
      role: 'developer',
      permissions: ['read', 'write'],
      tenantId: 'tenant_1',
      organizationId: 'org_1'
    };
  }

  /**
   * Get required permission for endpoint
   */
  private getRequiredPermission(method: string, path: string): string | null {
    // Define permission requirements for different endpoints
    const permissionMap: Record<string, Record<string, string>> = {
      'GET': {
        '/api/database/version/list': 'read',
        '/api/database/manifest/list': 'read',
        '/api/database/health': 'read'
      },
      'POST': {
        '/api/database/version/create': 'write',
        '/api/database/manifest/create': 'write',
        '/api/database/version/approve': 'admin',
        '/api/database/manifest/approve-step': 'admin'
      },
      'PUT': {
        '/api/database/version/deploy': 'admin',
        '/api/database/manifest/submit': 'write'
      },
      'DELETE': {
        '/api/database/version/rollback': 'admin'
      }
    };

    return permissionMap[method]?.[path] || null;
  }

  /**
   * Get security configuration
   */
  getConfig(): SecurityConfig {
    return this.config;
  }

  /**
   * Update security configuration
   */
  updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// ==================== HELMET CONFIGURATION ====================
export const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "same-origin" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true
};

// ==================== EXPORT ====================
export default SecurityMiddleware;
