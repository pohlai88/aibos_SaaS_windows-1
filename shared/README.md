# @aibos/shared-infrastructure

> World-class shared infrastructure for the AI-BOS platform

[![Version](https://img.shields.io/npm/v/@aibos/shared-infrastructure.svg)](https://npmjs.com/package/@aibos/shared-infrastructure)
[![License](https://img.shields.io/npm/l/@aibos/shared-infrastructure.svg)](https://github.com/aibos/shared-infrastructure/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

## 🚀 Overview

The `@aibos/shared-infrastructure` package provides world-class, enterprise-grade infrastructure components that serve as the foundation for the entire AI-BOS platform. This package ensures consistency, reliability, and maintainability across all frontend and backend applications.

## ✨ Features

### 🎨 Design System
- **Comprehensive Design Tokens**: Colors, spacing, typography, shadows, animations
- **Type-Safe Design System**: Full TypeScript support with strict typing
- **Consistent Theming**: Unified design language across all applications
- **AI-Specific Colors**: Specialized color palettes for AI/ML interfaces

### 🛡️ Error Handling
- **Structured Error Types**: Comprehensive error categorization and codes
- **Error Context Management**: Rich context and metadata for debugging
- **Error Reporting**: Built-in error reporting and monitoring capabilities
- **User-Friendly Messages**: Automatic error message formatting

### ⚡ Performance Monitoring
- **Real-time Metrics**: Performance monitoring and profiling
- **Resource Tracking**: Memory, CPU, and disk usage monitoring
- **Performance Alerts**: Automatic performance degradation detection
- **Optimization Insights**: AI-powered performance recommendations

### 🔒 Security Utilities
- **Input Validation**: Comprehensive input sanitization and validation
- **Encryption Helpers**: Secure data encryption and decryption
- **Security Monitoring**: Threat detection and security event logging
- **Compliance Tools**: Built-in compliance and audit trail support

### ♿ Accessibility
- **WCAG Compliance**: Built-in accessibility standards compliance
- **Keyboard Navigation**: Comprehensive keyboard navigation support
- **Screen Reader Support**: ARIA labels and screen reader optimization
- **Focus Management**: Intelligent focus trapping and management

## 📦 Installation

```bash
npm install @aibos/shared-infrastructure
```

## 🎯 Quick Start

### Design System Usage

```typescript
import { colors, spacing, typography, designTokens } from '@aibos/shared-infrastructure';

// Use design tokens
const buttonStyle = {
  backgroundColor: colors.primary[500],
  padding: spacing.md,
  fontSize: typography.fontSize.base,
  borderRadius: designTokens.borderRadius.lg
};
```

### Error Handling Usage

```typescript
import { 
  createErrorId, 
  ErrorCode, 
  ErrorCategory, 
  ErrorSeverity,
  BaseError 
} from '@aibos/shared-infrastructure';

// Create a structured error
const error: BaseError = {
  id: createErrorId(),
  code: ErrorCode.VALIDATION_REQUIRED_FIELD_MISSING,
  category: ErrorCategory.VALIDATION,
  severity: ErrorSeverity.MEDIUM,
  message: 'Required field "email" is missing',
  timestamp: new Date(),
  context: {
    userId: 'user123',
    field: 'email',
    form: 'registration'
  }
};
```

## 🏗️ Architecture

### Directory Structure

```
shared/
├── src/
│   ├── design-system/          # Design tokens and theming
│   │   └── tokens.ts
│   ├── error-handling/         # Error management system
│   │   └── types.ts
│   ├── performance/            # Performance monitoring
│   ├── security/              # Security utilities
│   ├── accessibility/         # Accessibility helpers
│   ├── types/                 # Common TypeScript types
│   ├── constants/             # Application constants
│   ├── utils/                 # Utility functions
│   └── index.ts              # Main exports
├── package.json
├── tsconfig.json
└── README.md
```

### Module Exports

The package provides granular exports for optimal tree-shaking:

```typescript
// Main package
import { designTokens, createErrorId } from '@aibos/shared-infrastructure';

// Specific modules
import { colors, spacing } from '@aibos/shared-infrastructure/design-system';
import { BaseError, ErrorCode } from '@aibos/shared-infrastructure/error-handling';
import { performanceMonitor } from '@aibos/shared-infrastructure/performance';
import { securityUtils } from '@aibos/shared-infrastructure/security';
import { a11yHelpers } from '@aibos/shared-infrastructure/accessibility';
```

## 🎨 Design System

### Color System

The design system includes a comprehensive color palette:

```typescript
import { colors } from '@aibos/shared-infrastructure';

// Primary colors
colors.primary[500] // #3b82f6

// Semantic colors
colors.success[500] // #22c55e
colors.warning[500] // #f59e0b
colors.error[500]   // #ef4444

// AI-specific colors
colors.ai.purple[500] // #a855f7
colors.ai.cyan[500]   // #06b6d4
```

### Spacing System

4px grid-based spacing system:

```typescript
import { spacing } from '@aibos/shared-infrastructure';

spacing.xs  // 4px
spacing.sm  // 8px
spacing.md  // 16px
spacing.lg  // 24px
spacing.xl  // 32px
```

### Typography System

Comprehensive typography scale:

```typescript
import { typography } from '@aibos/shared-infrastructure';

typography.fontSize.xs    // 12px
typography.fontSize.base  // 16px
typography.fontSize.lg    // 18px
typography.fontSize.xl    // 20px
```

## 🛡️ Error Handling

### Error Categories

The error handling system categorizes errors into logical groups:

- **System Errors**: Infrastructure and platform issues
- **Network Errors**: Connectivity and API issues
- **Database Errors**: Data persistence issues
- **Authentication Errors**: User authentication issues
- **Authorization Errors**: Permission and access control issues
- **Validation Errors**: Input validation issues
- **Business Logic Errors**: Application-specific logic issues
- **AI/ML Errors**: Machine learning model issues
- **Performance Errors**: Performance and resource issues
- **Security Errors**: Security and threat detection issues

### Error Codes

Each error has a unique numeric code for easy identification:

```typescript
import { ErrorCode } from '@aibos/shared-infrastructure';

// System errors (1000-1999)
ErrorCode.SYSTEM_INITIALIZATION_FAILED // 1000

// Network errors (2000-2999)
ErrorCode.NETWORK_CONNECTION_FAILED // 2000

// Database errors (3000-3999)
ErrorCode.DATABASE_CONNECTION_FAILED // 3000

// Authentication errors (4000-4999)
ErrorCode.AUTH_INVALID_CREDENTIALS // 4000
```

## ⚡ Performance Monitoring

### Real-time Metrics

Monitor application performance in real-time:

```typescript
import { performanceMonitor } from '@aibos/shared-infrastructure/performance';

// Start monitoring
performanceMonitor.start();

// Track custom metrics
performanceMonitor.track('api_call', {
  endpoint: '/api/users',
  duration: 150,
  status: 200
});

// Get performance insights
const insights = performanceMonitor.getInsights();
```

## 🔒 Security Utilities

### Input Validation

Comprehensive input validation and sanitization:

```typescript
import { securityUtils } from '@aibos/shared-infrastructure/security';

// Validate email
const isValidEmail = securityUtils.validateEmail('user@example.com');

// Sanitize HTML
const sanitizedHtml = securityUtils.sanitizeHtml('<script>alert("xss")</script>');

// Validate password strength
const passwordStrength = securityUtils.validatePassword('MySecurePass123!');
```

## ♿ Accessibility

### WCAG Compliance

Built-in accessibility compliance tools:

```typescript
import { a11yHelpers } from '@aibos/shared-infrastructure/accessibility';

// Generate ARIA labels
const ariaLabel = a11yHelpers.generateAriaLabel('Submit form');

// Check color contrast
const contrastRatio = a11yHelpers.getContrastRatio('#ffffff', '#000000');

// Validate accessibility
const violations = a11yHelpers.validateAccessibility(element);
```

## 🧪 Testing

### Unit Tests

```bash
npm test
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## 📚 Documentation

- [Design System Guide](./docs/design-system.md)
- [Error Handling Guide](./docs/error-handling.md)
- [Performance Monitoring Guide](./docs/performance.md)
- [Security Guide](./docs/security.md)
- [Accessibility Guide](./docs/accessibility.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@aibos.com
- 💬 Discord: [AI-BOS Community](https://discord.gg/aibos)
- 📖 Documentation: [docs.aibos.com](https://docs.aibos.com)
- 🐛 Issues: [GitHub Issues](https://github.com/aibos/shared-infrastructure/issues)

## 🙏 Acknowledgments

- **Design System**: Inspired by modern design systems like Material Design and Ant Design
- **Error Handling**: Based on industry best practices from Sentry and Rollbar
- **Performance Monitoring**: Built on concepts from New Relic and DataDog
- **Security**: Following OWASP guidelines and security best practices
- **Accessibility**: WCAG 2.1 AA compliance with modern accessibility standards

---

**Built with ❤️ by the AI-BOS Team** 
