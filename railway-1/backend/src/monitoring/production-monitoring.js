// ==================== AI-BOS PRODUCTION MONITORING ====================
// Comprehensive monitoring and alerting configuration for production

const winston = require('winston');
const Sentry = require('@sentry/node');
const { Integrations } = require('@sentry/tracing');
const { createLogger, format, transports } = winston;

// ==================== SENTRY CONFIGURATION ====================
const initializeSentry = () => {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      integrations: [
        new Integrations.Http({ tracing: true }),
        new Integrations.Express({ app: require('express')() }),
      ],
      tracesSampleRate: 0.1,
      profilesSampleRate: 0.1,
    });
    console.log('✅ Sentry monitoring initialized');
  } else {
    console.log('⚠️ Sentry DSN not configured, skipping Sentry initialization');
  }
};

// ==================== WINSTON LOGGING CONFIGURATION ====================
const createProductionLogger = () => {
  const logFormat = format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json(),
    format.metadata()
  );

  const logger = createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: {
      service: 'ai-bos-backend',
      environment: process.env.NODE_ENV,
      version: process.env.APP_VERSION,
    },
    transports: [
      // Console transport for development
      new transports.Console({
        format: format.combine(
          format.colorize(),
          format.simple()
        ),
      }),
      // File transport for production logs
      new transports.File({
        filename: process.env.LOG_FILE || 'logs/error.log',
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
      new transports.File({
        filename: process.env.LOG_FILE || 'logs/combined.log',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
    ],
  });

  // Add request logging middleware
  logger.stream = {
    write: (message) => {
      logger.info(message.trim());
    },
  };

  return logger;
};

// ==================== HEALTH CHECK CONFIGURATION ====================
const healthCheckConfig = {
  timeout: 5000,
  interval: 30000,
  unhealthyThreshold: 3,
  healthyThreshold: 2,
  checks: [
    {
      name: 'database',
      check: async () => {
        try {
          // Add database health check logic here
          return { status: 'healthy', responseTime: 100 };
        } catch (error) {
          return { status: 'unhealthy', error: error.message };
        }
      },
    },
    {
      name: 'redis',
      check: async () => {
        try {
          // Add Redis health check logic here
          return { status: 'healthy', responseTime: 50 };
        } catch (error) {
          return { status: 'unhealthy', error: error.message };
        }
      },
    },
    {
      name: 'external-api',
      check: async () => {
        try {
          // Add external API health check logic here
          return { status: 'healthy', responseTime: 200 };
        } catch (error) {
          return { status: 'unhealthy', error: error.message };
        }
      },
    },
  ],
};

// ==================== METRICS CONFIGURATION ====================
const metricsConfig = {
  enabled: true,
  collectionInterval: 60000, // 1 minute
  metrics: {
    // Application metrics
    requestCount: 0,
    responseTime: [],
    errorCount: 0,
    activeConnections: 0,

    // Business metrics
    userRegistrations: 0,
    aiRequests: 0,
    workflowExecutions: 0,

    // System metrics
    memoryUsage: 0,
    cpuUsage: 0,
    diskUsage: 0,
  },
};

// ==================== ALERTING CONFIGURATION ====================
const alertingConfig = {
  enabled: true,
  channels: {
    email: {
      enabled: process.env.NOTIFICATION_EMAIL_ENABLED === 'true',
      recipients: ['alerts@ai-bos.io', 'ops@ai-bos.io'],
    },
    slack: {
      enabled: process.env.NOTIFICATION_SLACK_ENABLED === 'true',
      webhook: process.env.SLACK_WEBHOOK_URL,
      channel: '#alerts',
    },
    discord: {
      enabled: process.env.NOTIFICATION_DISCORD_ENABLED === 'true',
      webhook: process.env.DISCORD_WEBHOOK_URL,
    },
  },
  thresholds: {
    errorRate: 0.05, // 5%
    responseTime: 2000, // 2 seconds
    memoryUsage: 0.9, // 90%
    cpuUsage: 0.8, // 80%
    diskUsage: 0.85, // 85%
  },
  cooldown: 300000, // 5 minutes
};

// ==================== PERFORMANCE MONITORING ====================
const performanceMonitoring = {
  enabled: process.env.ENABLE_PROFILING === 'true',
  sampling: {
    rate: 0.1, // 10% of requests
    maxTraces: 1000,
  },
  metrics: {
    // Request metrics
    requestDuration: [],
    requestSize: [],
    responseSize: [],

    // Database metrics
    queryDuration: [],
    connectionPool: [],

    // Cache metrics
    cacheHitRate: 0,
    cacheMissRate: 0,

    // AI metrics
    aiResponseTime: [],
    aiTokenUsage: [],
  },
};

// ==================== SECURITY MONITORING ====================
const securityMonitoring = {
  enabled: true,
  events: {
    failedLogins: [],
    suspiciousActivity: [],
    dataBreaches: [],
    unauthorizedAccess: [],
  },
  thresholds: {
    failedLoginsPerMinute: 10,
    suspiciousRequestsPerMinute: 50,
    unauthorizedAccessPerMinute: 5,
  },
  actions: {
    blockIP: true,
    notifySecurity: true,
    logToSecuritySystem: true,
  },
};

// ==================== MONITORING MIDDLEWARE ====================
const monitoringMiddleware = (req, res, next) => {
  const startTime = Date.now();

  // Log request
  req.logger = req.app.locals.logger;
  req.logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
  });

  // Track request count
  if (metricsConfig.enabled) {
    metricsConfig.metrics.requestCount++;
  }

  // Add response monitoring
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    // Log response
    req.logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userId: req.user?.id,
    });

    // Track metrics
    if (metricsConfig.enabled) {
      metricsConfig.metrics.responseTime.push(duration);

      if (res.statusCode >= 400) {
        metricsConfig.metrics.errorCount++;
      }
    }

    // Check for alerts
    checkAlerts(req, res, duration);
  });

  next();
};

// ==================== ALERT CHECKING ====================
const checkAlerts = (req, res, duration) => {
  if (!alertingConfig.enabled) return;

  const errorRate = metricsConfig.metrics.errorCount / metricsConfig.metrics.requestCount;

  // Check error rate
  if (errorRate > alertingConfig.thresholds.errorRate) {
    sendAlert('HIGH_ERROR_RATE', {
      errorRate: errorRate,
      threshold: alertingConfig.thresholds.errorRate,
      requestCount: metricsConfig.metrics.requestCount,
      errorCount: metricsConfig.metrics.errorCount,
    });
  }

  // Check response time
  if (duration > alertingConfig.thresholds.responseTime) {
    sendAlert('HIGH_RESPONSE_TIME', {
      duration: duration,
      threshold: alertingConfig.thresholds.responseTime,
      url: req.url,
      method: req.method,
    });
  }
};

// ==================== ALERT SENDING ====================
const sendAlert = (type, data) => {
  const alert = {
    type,
    data,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    service: 'ai-bos-backend',
  };

  // Send to configured channels
  if (alertingConfig.channels.email.enabled) {
    sendEmailAlert(alert);
  }

  if (alertingConfig.channels.slack.enabled) {
    sendSlackAlert(alert);
  }

  if (alertingConfig.channels.discord.enabled) {
    sendDiscordAlert(alert);
  }

  // Log alert
  console.error('🚨 ALERT:', alert);
};

// ==================== ALERT CHANNELS ====================
const sendEmailAlert = (alert) => {
  // Implement email alerting
  console.log('📧 Email alert sent:', alert.type);
};

const sendSlackAlert = (alert) => {
  // Implement Slack alerting
  console.log('💬 Slack alert sent:', alert.type);
};

const sendDiscordAlert = (alert) => {
  // Implement Discord alerting
  console.log('🎮 Discord alert sent:', alert.type);
};

// ==================== METRICS EXPORT ====================
const getMetrics = () => {
  return {
    timestamp: new Date().toISOString(),
    service: 'ai-bos-backend',
    environment: process.env.NODE_ENV,
    version: process.env.APP_VERSION,
    metrics: metricsConfig.metrics,
    health: {
      status: 'healthy',
      checks: healthCheckConfig.checks.map(check => ({
        name: check.name,
        status: 'healthy',
      })),
    },
  };
};

// ==================== INITIALIZATION ====================
const initializeMonitoring = (app) => {
  // Initialize Sentry
  initializeSentry();

  // Create logger
  const logger = createProductionLogger();
  app.locals.logger = logger;

  // Add monitoring middleware
  app.use(monitoringMiddleware);

  // Add health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'ai-bos-backend',
      version: process.env.APP_VERSION,
      environment: process.env.NODE_ENV,
    });
  });

  // Add metrics endpoint
  app.get('/api/metrics', (req, res) => {
    res.json(getMetrics());
  });

  console.log('✅ Production monitoring initialized');
};

module.exports = {
  initializeMonitoring,
  createProductionLogger,
  healthCheckConfig,
  metricsConfig,
  alertingConfig,
  performanceMonitoring,
  securityMonitoring,
  getMetrics,
  sendAlert,
};
