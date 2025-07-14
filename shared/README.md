# AI-BOS Shared Library

Enterprise-grade shared utilities, types, and configurations for the AI-BOS platform.

## 🏗️ Architecture Overview

The shared library provides a robust foundation for the AI-BOS platform with:

- **Type Safety**: Comprehensive TypeScript types and Zod validation schemas
- **Security**: Enterprise-grade security utilities and middleware
- **Monitoring**: Production-ready logging and metrics collection
- **Testing**: Comprehensive test suite with 80%+ coverage requirements
- **CI/CD**: Automated testing, security scanning, and deployment pipeline

## 📁 Directory Structure

```
shared/
├── config/                 # Configuration files
│   ├── jest.config.js     # Jest test configuration
│   └── jest.setup.js      # Jest test setup and mocks
├── lib/                   # Core utilities
│   ├── logger.ts          # Structured logging system
│   ├── security.ts        # Security utilities and middleware
│   └── monitoring.ts      # Performance and health monitoring
├── types/                 # TypeScript type definitions
│   ├── billing/           # Billing and subscription types
│   ├── roles/             # User roles and permissions
│   └── ...                # Other type categories
├── validation/            # Zod validation schemas
├── utils/                 # Utility functions
├── constants/             # Application constants
├── examples/              # Usage examples and tests
└── __tests__/            # Comprehensive test suite
```

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Development

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Format code
npm run format

# Type checking
npm run type-check
```

### Building

```bash
# Build the library
npm run build

# Clean build artifacts
npm run clean
```

## 🔧 Core Features

### 1. Structured Logging (`lib/logger.ts`)

Enterprise-grade logging with structured output, context tracking, and multiple output formats.

```typescript
import { logger, createLogger } from '@shared/lib/logger';

// Global logger
logger.info('Application started', { component: 'server' });

// Component-specific logger
const authLogger = createLogger('auth');
authLogger.error('Authentication failed', { userId: '123', reason: 'invalid_token' });

// Request logging middleware
import { requestLogger, errorLogger } from '@shared/lib/logger';
app.use(requestLogger());
app.use(errorLogger());
```

**Features:**
- Multiple log levels (ERROR, WARN, INFO, DEBUG, TRACE)
- Structured JSON output for production
- Request context tracking
- Child loggers with additional context
- Express middleware integration
- Metrics collection integration

### 2. Security System (`lib/security.ts`)

Comprehensive security utilities including rate limiting, input validation, and threat detection.

```typescript
import { security, SecurityUtils } from '@shared/lib/security';

// Rate limiting middleware
app.use(security.rateLimit());

// Security headers
app.use(security.securityHeaders());

// Input validation
app.use(security.validateInput(ValidationSchemas.email, 'body'));

// Security scanning
app.use(security.securityScan());

// CORS configuration
app.use(security.cors());

// Input sanitization
const sanitized = SecurityUtils.sanitizeInput(userInput);

// Password validation
const result = SecurityUtils.validatePassword(password);
```

**Features:**
- Rate limiting with configurable windows
- Security headers (HSTS, CSP, X-Frame-Options, etc.)
- Input validation with Zod schemas
- Threat detection (SQL injection, XSS, command injection)
- Password strength validation
- Secure token generation
- CORS configuration

### 3. Monitoring System (`lib/monitoring.ts`)

Production-ready monitoring with metrics collection and health checks.

```typescript
import { monitoring } from '@shared/lib/monitoring';

// Record API requests (automatic via middleware)
app.use(requestMonitoring());

// Record database operations
const result = await monitorDatabaseOperation('SELECT', 'users', async () => {
  return await db.query('SELECT * FROM users');
});

// Record business events
monitoring.recordBusinessEvent('user_registered', tenantId, userId);

// Health check endpoints
app.get('/health', async (req, res) => {
  const health = await monitoring.getHealthEndpoint();
  res.json(health);
});

app.get('/metrics', (req, res) => {
  const metrics = monitoring.getMetricsEndpoint();
  res.set('Content-Type', 'text/plain');
  res.send(metrics);
});
```

**Features:**
- Performance metrics (counters, gauges, histograms)
- Health checks with configurable thresholds
- Prometheus-compatible metrics format
- Memory and CPU monitoring
- Database operation tracking
- Business event recording
- Express middleware integration

## 🧪 Testing

### Test Configuration

The library includes comprehensive testing setup:

- **Jest Configuration**: TypeScript support, coverage reporting, path mapping
- **Test Setup**: Global mocks, test utilities, data factories
- **Coverage Requirements**: 80% minimum coverage for all metrics
- **Test Categories**: Unit, integration, performance, smoke tests

### Running Tests

```bash
# All tests
npm test

# Specific test categories
npm run test:integration
npm run test:e2e
npm run test:performance
npm run test:smoke:staging
npm run test:smoke:production

# Coverage report
npm run test:coverage
```

### Test Utilities

```typescript
// Test data factories
const user = createTestUser({ role: 'ADMIN' });
const tenant = createTestTenant({ name: 'Test Corp' });
const subscription = createTestSubscription({ plan: 'PRO' });

// Mock utilities
const supabase = createMockSupabaseClient();
const apiResponse = mockApiResponse({ data: 'success' });
const apiError = mockApiError('Not found', 404);

// Test helpers
await waitFor(1000); // Wait for async operations
```

## 🔒 Security Features

### Input Validation

```typescript
import { ValidationSchemas } from '@shared/lib/security';

// Email validation
ValidationSchemas.email.parse('user@example.com');

// Password validation
ValidationSchemas.password.parse('StrongPass123');

// UUID validation
ValidationSchemas.uuid.parse('123e4567-e89b-12d3-a456-426614174000');

// Safe string validation
ValidationSchemas.safeString.parse('Hello, world!');
```

### Threat Detection

```typescript
import { SecurityUtils } from '@shared/lib/security';

// Detect security issues
const issues = SecurityUtils.detectSecurityIssues(input);
// Returns: ['Potential SQL injection detected', 'Potential XSS attack detected']

// Sanitize input
const sanitized = SecurityUtils.sanitizeInput('<script>alert("xss")</script>');
// Returns: 'alert("xss")'
```

## 📊 Monitoring & Observability

### Metrics Collection

```typescript
import { monitoring } from '@shared/lib/monitoring';

// Custom metrics
monitoring.getPerformanceMetrics().incrementCounter('custom_metric', 1, { label: 'value' });
monitoring.getPerformanceMetrics().setGauge('memory_usage', 512);
monitoring.getPerformanceMetrics().recordHistogram('response_time', 150);
```

### Health Checks

```typescript
import { monitoring, HealthStatus } from '@shared/lib/monitoring';

// Custom health check
monitoring.getHealthMonitor().registerCheck('database', async () => {
  try {
    await db.ping();
    return {
      status: HealthStatus.HEALTHY,
      message: 'Database connection OK',
      timestamp: Date.now()
    };
  } catch (error) {
    return {
      status: HealthStatus.UNHEALTHY,
      message: 'Database connection failed',
      timestamp: Date.now(),
      details: { error: error.message }
    };
  }
});
```

## 🚀 CI/CD Pipeline

### GitHub Actions Workflow

The library includes a comprehensive CI/CD pipeline:

1. **Security Scanning**: Snyk, CodeQL, npm audit
2. **Code Quality**: ESLint, Prettier, TypeScript checking
3. **Testing**: Unit, integration, performance, smoke tests
4. **Build**: TypeScript compilation and packaging
5. **Deployment**: Staging and production deployments
6. **Monitoring**: Post-deployment verification

### Quality Gates

- **Test Coverage**: Minimum 80% coverage required
- **Security**: No high-severity vulnerabilities
- **Code Quality**: All linting rules must pass
- **Type Safety**: No TypeScript errors
- **Performance**: Performance tests must pass

## 📈 Performance

### Metrics Dashboard

The monitoring system provides:

- **Request Metrics**: Count, duration, error rates
- **Database Metrics**: Operation counts, response times
- **Business Metrics**: Event counts, user actions
- **System Metrics**: Memory, CPU, uptime
- **Custom Metrics**: Application-specific measurements

### Health Monitoring

- **Memory Usage**: Heap and RSS monitoring
- **CPU Usage**: User and system time tracking
- **Uptime**: Application runtime tracking
- **Custom Checks**: Database, external services

## 🔧 Configuration

### Environment Variables

```bash
# Logging
LOG_LEVEL=INFO
NODE_ENV=production

# Security
ALLOWED_ORIGINS=http://localhost:3000,https://app.example.com

# Monitoring
ENABLE_METRICS=true
ENABLE_HEALTH_CHECKS=true
```

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

## 📚 API Reference

### Logger

```typescript
interface Logger {
  error(message: string, context?: LogContext, error?: Error, data?: any): void;
  warn(message: string, context?: LogContext, data?: any): void;
  info(message: string, context?: LogContext, data?: any): void;
  debug(message: string, context?: LogContext, data?: any): void;
  trace(message: string, context?: LogContext, data?: any): void;
  child(additionalContext: LogContext): Logger;
  setRequestContext(requestId: string, sessionId?: string): void;
  clearRequestContext(): void;
}
```

### Security

```typescript
interface SecurityMiddleware {
  rateLimit(): ExpressMiddleware;
  securityHeaders(): ExpressMiddleware;
  validateInput(schema: ZodSchema, field: string): ExpressMiddleware;
  securityScan(): ExpressMiddleware;
  cors(): ExpressMiddleware;
}

interface SecurityUtils {
  static sanitizeInput(input: string): string;
  static validateEmail(email: string): ValidationResult;
  static validatePassword(password: string): PasswordResult;
  static generateSecureToken(length?: number): string;
  static detectSecurityIssues(input: string): string[];
}
```

### Monitoring

```typescript
interface ApplicationMonitor {
  recordApiRequest(method: string, path: string, statusCode: number, duration: number): void;
  recordDatabaseOperation(operation: string, table: string, duration: number, success: boolean): void;
  recordBusinessEvent(event: string, tenantId?: string, userId?: string): void;
  getStatus(): Promise<ApplicationStatus>;
  getMetricsEndpoint(): string;
  getHealthEndpoint(): Promise<HealthData>;
}
```

## 🤝 Contributing

### Development Setup

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Install dependencies**: `npm install`
4. **Run tests**: `npm test`
5. **Make changes and test**: `npm run test:coverage`
6. **Commit changes**: `git commit -m 'Add amazing feature'`
7. **Push to branch**: `git push origin feature/amazing-feature`
8. **Create Pull Request**

### Code Standards

- **TypeScript**: Strict mode, explicit types
- **Testing**: 80%+ coverage required
- **Documentation**: JSDoc for all public APIs
- **Formatting**: Prettier configuration
- **Linting**: ESLint with TypeScript rules

### Pre-commit Hooks

The project uses Husky for pre-commit hooks:

- **Linting**: ESLint with auto-fix
- **Formatting**: Prettier formatting
- **Type Checking**: TypeScript compilation
- **Tests**: Unit test execution

## 📄 License

MIT License - see [LICENSE](../LICENSE) file for details.

## 🆘 Support

- **Documentation**: [AI-BOS Platform Docs](https://docs.aibos-platform.com)
- **Issues**: [GitHub Issues](https://github.com/aibos-platform/aibos-platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/aibos-platform/aibos-platform/discussions)
- **Security**: [Security Policy](https://github.com/aibos-platform/aibos-platform/security/policy)

---

**AI-BOS Platform** - Building the future of SaaS integration 🚀 