import { Request, Response, NextFunction } from 'express';
import { createLogger, format, transports } from 'winston';
import { env, getDebugLevel } from '../utils/env';

// Enhanced debug logger
const debugLogger = createLogger({
  level: getDebugLevel(),
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    }),
    new transports.File({
      filename: 'logs/debug.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Request/Response logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Log incoming request
  debugLogger.info('Incoming Request', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
    query: req.query,
    params: req.params,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Capture response
  const originalSend = res.send;
  res.send = function(body: any) {
    const duration = Date.now() - start;

    debugLogger.info('Outgoing Response', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      responseSize: body?.length || 0,
      headers: res.getHeaders()
    });

    return originalSend.call(this, body);
  };

  next();
};

// SQL Query debugging middleware
export const sqlDebugger = (req: Request, res: Response, next: NextFunction) => {
  if (env.DEBUG_SQL) {
    const originalQuery = (req as any).db?.query;
    if (originalQuery) {
      (req as any).db.query = function(...args: any[]) {
        const query = args[0];
        const params = args[1];

        debugLogger.debug('SQL Query', {
          query,
          params,
          timestamp: new Date().toISOString(),
          url: req.url,
          method: req.method
        });

        return originalQuery.apply(this, args);
      };
    }
  }
  next();
};

// Error stack trace enhancement
export const errorEnhancer = (err: Error, req: Request, res: Response, next: NextFunction) => {
  debugLogger.error('Application Error', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    headers: req.headers,
    body: req.body,
    query: req.query,
    params: req.params,
    timestamp: new Date().toISOString()
  });

  // Enhanced error response
  res.status(500).json({
    error: {
      message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || Math.random().toString(36).substr(2, 9)
    }
  });
};

// Performance monitoring middleware
export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const duration = Number(process.hrtime.bigint() - start) / 1000000; // Convert to milliseconds

    if (duration > 1000) { // Log slow requests (>1s)
      debugLogger.warn('Slow Request Detected', {
        method: req.method,
        url: req.url,
        duration: `${duration.toFixed(2)}ms`,
        statusCode: res.statusCode
      });
    }

    debugLogger.debug('Request Performance', {
      method: req.method,
      url: req.url,
      duration: `${duration.toFixed(2)}ms`,
      statusCode: res.statusCode
    });
  });

  next();
};

// Memory usage monitoring
export const memoryMonitor = (req: Request, res: Response, next: NextFunction) => {
  if (env.DEBUG_MEMORY) {
    const memUsage = process.memoryUsage();
    debugLogger.debug('Memory Usage', {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
      url: req.url,
      method: req.method
    });
  }
  next();
};

// API call inspection middleware
export const apiInspector = (req: Request, res: Response, next: NextFunction) => {
  if (env.DEBUG_API) {
    debugLogger.info('API Call Inspection', {
      endpoint: req.url,
      method: req.method,
      contentType: req.get('Content-Type'),
      accept: req.get('Accept'),
      authorization: req.get('Authorization') ? '[PRESENT]' : '[MISSING]',
      bodyKeys: req.body ? Object.keys(req.body) : [],
      queryKeys: req.query ? Object.keys(req.query) : [],
      paramKeys: req.params ? Object.keys(req.params) : []
    });
  }
  next();
};

// Debug configuration middleware
export const debugConfig = (req: Request, res: Response, next: NextFunction) => {
  // Set debug flags based on environment
  if (env.NODE_ENV === 'development') {
    (req as any).debug = {
      enabled: true,
      level: getDebugLevel(),
      features: {
        sql: env.DEBUG_SQL,
        memory: env.DEBUG_MEMORY,
        api: env.DEBUG_API,
        performance: env.DEBUG_PERFORMANCE
      }
    };
  }
  next();
};

// Export all debug middlewares
export const debugMiddleware = [
  debugConfig,
  requestLogger,
  sqlDebugger,
  performanceMonitor,
  memoryMonitor,
  apiInspector
];

export default debugMiddleware;
