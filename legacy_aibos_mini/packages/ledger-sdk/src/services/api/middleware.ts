// Enterprise-grade middleware for authentication, validation, error handling, and rate limiting
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

// JWT Auth Middleware
export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET || 'changeme');
      (req as any).user = user;
      return next();
    } catch (err) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }
  }
  return res.status(401).json({ success: false, error: 'No token provided' });
}

// Role-based Access Control
export function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (user && user.roles && user.roles.includes(role)) {
      return next();
    }
    return res.status(403).json({ success: false, error: 'Forbidden' });
  };
}

// Rate Limiting
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, error: 'Too many requests, please try again later.' }
});

// Centralized Error Handler
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('[API ERROR]', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
}
