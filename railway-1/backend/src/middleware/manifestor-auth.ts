import { Request, Response, NextFunction } from 'express';
import { Manifestor, User } from '../lib/manifestor';

// ==================== MANIFESTOR AUTHENTICATION MIDDLEWARE ====================

/**
 * Middleware to check if user has permission for a specific action and resource
 */
export function requirePermission(action: string, resource: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Get user from request (this would be set by your auth middleware)
      const user = (req as any).user as User;

      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
        return;
      }

      // Check permission using manifestor
      const hasPermission = Manifestor.can(user, action, resource);

      if (!hasPermission) {
        res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
          required: `${resource}:${action}`,
          user: {
            id: user.id,
            role: user.role
          }
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Permission check failed:', error);
      res.status(500).json({
        success: false,
        error: 'Permission check failed',
        code: 'PERMISSION_CHECK_ERROR'
      });
      return;
    }
  };
}

/**
 * Middleware to check if a module is enabled
 */
export function requireModule(moduleId: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const isEnabled = Manifestor.isEnabled(moduleId);

      if (!isEnabled) {
        res.status(503).json({
          success: false,
          error: 'Module is disabled',
          code: 'MODULE_DISABLED',
          moduleId
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Module check failed:', error);
      res.status(500).json({
        success: false,
        error: 'Module check failed',
        code: 'MODULE_CHECK_ERROR'
      });
      return;
    }
  };
}

/**
 * Middleware to get module configuration
 */
export function withModuleConfig(moduleId: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const config = Manifestor.getConfig(moduleId);

      if (!config) {
        res.status(404).json({
          success: false,
          error: 'Module configuration not found',
          code: 'MODULE_CONFIG_NOT_FOUND',
          moduleId
        });
        return;
      }

      // Add config to request
      (req as any).moduleConfig = config;
      next();
    } catch (error) {
      console.error('Module config check failed:', error);
      res.status(500).json({
        success: false,
        error: 'Module config check failed',
        code: 'MODULE_CONFIG_CHECK_ERROR'
      });
      return;
    }
  };
}

/**
 * Middleware to validate request against manifest validators
 */
export function validateRequest(validators: Record<string, any>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const errors: string[] = [];

      // Validate request body, query, and params
      const dataToValidate = {
        body: req.body,
        query: req.query,
        params: req.params
      };

      for (const [field, value] of Object.entries(dataToValidate)) {
        for (const [key, validator] of Object.entries(validators)) {
          if (value[key] !== undefined) {
            const isValid = validateValue(value[key], validator);
            if (!isValid) {
              errors.push(`${field}.${key} failed validation: ${validator}`);
            }
          }
        }
      }

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          errors
        });
      }

      next();
    } catch (error) {
      console.error('Request validation failed:', error);
      res.status(500).json({
        success: false,
        error: 'Request validation failed',
        code: 'VALIDATION_ERROR'
      });
    }
  };
}

/**
 * Helper function to validate a value against a validator
 */
function validateValue(value: any, validator: any): boolean {
  switch (validator) {
    case 'uuid':
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    case 'password':
      return typeof value === 'string' && value.length >= 8;
    case 'dateRange':
      return Array.isArray(value) && value.length === 2;
    case 'array':
      return Array.isArray(value);
    case 'chartType':
      return ['line', 'bar', 'pie', 'area', 'scatter', 'heatmap'].includes(value);
    case 'exportFormat':
      return ['csv', 'json', 'pdf', 'excel'].includes(value);
    case 'threatLevel':
      return ['low', 'medium', 'high', 'critical'].includes(value);
    case 'securityCategory':
      return ['authentication', 'authorization', 'data', 'network', 'application', 'infrastructure'].includes(value);
    case 'alertStatus':
      return ['new', 'investigating', 'resolved', 'false_positive'].includes(value);
    case 'scanType':
      return ['vulnerability', 'compliance', 'backup'].includes(value);
    case 'iso8601':
      return !isNaN(Date.parse(value));
    default:
      return true; // Unknown validator, allow
  }
}

/**
 * Middleware to apply rate limiting based on manifest configuration
 */
export function rateLimitFromManifest(moduleId: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const config = Manifestor.getConfig(moduleId);
      const rateLimit = config?.api?.rateLimit || 100;

      // This is a simplified rate limiting implementation
      // In production, you'd want to use a proper rate limiting library
      // like express-rate-limit with Redis storage

      // For now, we'll just add the rate limit info to the response headers
      res.set('X-RateLimit-Limit', rateLimit.toString());
      res.set('X-RateLimit-Remaining', (rateLimit - 1).toString());

      next();
    } catch (error) {
      console.error('Rate limit check failed:', error);
      next(); // Continue without rate limiting if there's an error
    }
  };
}

/**
 * Middleware to add manifestor to request
 */
export function withManifestor(req: Request, res: Response, next: NextFunction): void {
  (req as any).manifestor = Manifestor;
  next();
}

/**
 * Middleware to check manifestor health
 */
export function requireManifestorHealth(req: Request, res: Response, next: NextFunction): void {
  try {
    const health = Manifestor.healthCheck();

    if (health.status === 'unhealthy') {
      res.status(503).json({
        success: false,
        error: 'Manifestor is unhealthy',
        code: 'MANIFESTOR_UNHEALTHY',
        health
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Manifestor health check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Manifestor health check failed',
      code: 'MANIFESTOR_HEALTH_ERROR'
    });
    return;
  }
}
