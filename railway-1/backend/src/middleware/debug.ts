import { Request, Response, NextFunction } from 'express';

// ==================== DEBUG CONFIGURATION ====================
const env = process.env;

const getDebugLevel = () => {
  if (env['DEBUG_LEVEL']) return env['DEBUG_LEVEL'];
  if (env['NODE_ENV'] === 'development') return 'debug';
  if (env['NODE_ENV'] === 'production') return 'warn';
  return 'info';
};

// ==================== SIMPLE LOGGER ====================
const debugLogger = {
  debug: (message: string, context: any = {}) => {
    if (env['NODE_ENV'] === 'development') {
      console.debug(`[DEBUG] ${message}`, context);
    }
  },
  info: (message: string, context: any = {}) => {
    console.info(`[INFO] ${message}`, context);
  },
  warn: (message: string, context: any = {}) => {
    console.warn(`[WARN] ${message}`, context);
  },
  error: (message: string, context: any = {}, error?: Error) => {
    console.error(`[ERROR] ${message}`, context);
    if (error) {
      console.error(error.stack);
    }
  }
};

// ==================== DEBUG MIDDLEWARES ====================

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  debugLogger.info('Incoming Request', {
    module: 'debug-middleware',
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.on('finish', () => {
    const duration = Date.now() - start;
    debugLogger.info('Request Completed', {
      module: 'debug-middleware',
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });
  });

  next();
};

// SQL debugging middleware
export const sqlDebugger = (req: Request, res: Response, next: NextFunction) => {
  if (env['DEBUG_SQL']) {
    debugLogger.debug('SQL Debug Enabled', {
      module: 'debug-middleware',
      url: req.url,
      method: req.method
    });
  }
  next();
};

// Error enhancement middleware
export const errorEnhancer = (err: Error, req: Request, res: Response, next: NextFunction) => {
  debugLogger.error('Error Occurred', {
    module: 'debug-middleware',
    message: err.message,
    url: req.url,
    method: req.method
  }, err);

  // Enhanced error response
  res.status(500).json({
    error: {
      message: env['NODE_ENV'] === 'production' ? 'Internal Server Error' : err.message,
      stack: env['NODE_ENV'] === 'development' ? err.stack : undefined,
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
        module: 'debug-middleware',
        method: req.method,
        url: req.url,
        duration: `${duration.toFixed(2)}ms`,
        statusCode: res.statusCode
      });
    }

    debugLogger.debug('Request Performance', {
      module: 'debug-middleware',
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
  if (env['DEBUG_MEMORY']) {
    const memUsage = process.memoryUsage();
    debugLogger.debug('Memory Usage', {
      module: 'debug-middleware',
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
  if (env['DEBUG_API']) {
    debugLogger.info('API Call Inspection', {
      module: 'debug-middleware',
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
  if (env['NODE_ENV'] === 'development') {
    (req as any).debug = {
      enabled: true,
      level: getDebugLevel(),
      features: {
        sql: env['DEBUG_SQL'],
        memory: env['DEBUG_MEMORY'],
        api: env['DEBUG_API'],
        performance: env['DEBUG_PERFORMANCE']
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
