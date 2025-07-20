# SHRM Module - Enterprise Grade Human Resource Management

## Overview

The SHRM (Strategic Human Resource Management) module is a comprehensive, enterprise-grade solution for managing all aspects of human resources. Built with isolation standards, it provides a complete suite of components, services, and utilities for employee lifecycle management, payroll processing, leave management, performance reviews, and compliance tracking.

## 🏗️ Architecture

The module follows a modular, isolated architecture with clear separation of concerns:

```
shrm/
├── components/           # React components
│   ├── EmployeeForm.tsx
│   ├── PayrollCalculator.tsx
│   ├── LeaveRequestForm.tsx
│   ├── PerformanceReviewForm.tsx
│   ├── AttendanceTracker.tsx
│   ├── ContractManager.tsx
│   ├── ComplianceDashboard.tsx
│   ├── DocumentGenerator.tsx
│   └── NotificationCenter.tsx
├── reports/             # Report components
│   ├── EmployeeReport.tsx
│   ├── PayrollReport.tsx
│   ├── LeaveReport.tsx
│   ├── PerformanceReport.tsx
│   └── ComplianceReport.tsx
├── services/            # Business logic services
│   ├── validation-service.ts
│   ├── notification-service.ts
│   └── shrm-service.ts
├── types/               # TypeScript type definitions
│   └── index.ts
├── validation/          # Zod validation schemas
│   └── index.ts
├── constants/           # Application constants
│   └── index.ts
├── index.ts            # Module exports
└── README.md           # This file
```

## 🚀 Features

### Core Functionality
- **Employee Management**: Complete employee lifecycle from hire to termination
- **Payroll Processing**: Automated payroll calculation with tax deductions
- **Leave Management**: Comprehensive leave request and approval workflow
- **Performance Reviews**: Structured performance evaluation system
- **Attendance Tracking**: Clock in/out and attendance monitoring
- **Contract Management**: Employment contract lifecycle management
- **Compliance Tracking**: Regulatory compliance and statutory reporting
- **Document Generation**: Automated document creation and management
- **Notification System**: Multi-channel notification delivery

### Enterprise Features
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Validation**: Zod-based validation with business rule enforcement
- **Error Handling**: Structured error handling with custom error classes
- **Security**: Role-based access control and data encryption
- **Audit Logging**: Comprehensive audit trail for all operations
- **Performance**: Optimized with caching and efficient data structures
- **Scalability**: Designed for enterprise-scale deployments
- **Compliance**: SEA (Southeast Asia) regulatory compliance built-in

## 📦 Installation

The SHRM module is part of the AIBOS_MINI project. No additional installation is required.

## 🛠️ Usage

### Basic Import

```typescript
import { 
  SHRMDashboard,
  EmployeeForm,
  PayrollCalculator,
  LeaveRequestForm,
  SHRMService,
  SHRMValidationService,
  SHRMNotificationService
} from '@/components/shrm';
```

### Employee Management

```typescript
import { EmployeeForm } from '@/components/shrm';

// Create new employee
<EmployeeForm
  departments={departments}
  positions={positions}
  managers={managers}
  onSubmit={handleCreateEmployee}
  onCancel={handleCancel}
/>
```

### Payroll Processing

```typescript
import { PayrollCalculator } from '@/components/shrm';

// Calculate payroll
<PayrollCalculator
  employee={employee}
  onCalculate={handleCalculatePayroll}
  onSave={handleSavePayroll}
  onExport={handleExportPayroll}
/>
```

### Leave Management

```typescript
import { LeaveRequestForm } from '@/components/shrm';

// Create leave request
<LeaveRequestForm
  employee={employee}
  onSubmit={handleCreateLeaveRequest}
  onCancel={handleCancel}
/>
```

### Service Usage

```typescript
import { SHRMService, SHRMValidationService } from '@/components/shrm';

// Initialize services
const shrmService = new SHRMService(supabaseUrl, supabaseKey);
const validationService = new SHRMValidationService();

// Validate employee data
const validation = validationService.validateEmployee(employeeData);
if (validation.success) {
  // Create employee
  const employee = await shrmService.createEmployee(employeeData);
}
```

## 🔧 Configuration

### Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Notification Configuration
SHRM_EMAIL_ENABLED=true
SHRM_SMS_ENABLED=false
SHRM_PUSH_ENABLED=false
SHRM_IN_APP_ENABLED=true

# Validation Configuration
SHRM_MAX_SALARY=1000000
SHRM_MAX_LEAVE_DAYS=365
SHRM_MAX_HOURS=24
```

### Service Configuration

```typescript
import { SHRMNotificationService } from '@/components/shrm';

const notificationService = new SHRMNotificationService({
  emailEnabled: true,
  smsEnabled: false,
  pushEnabled: false,
  inAppEnabled: true,
  defaultPriority: 'medium',
  retryAttempts: 3,
  retryDelay: 1000
});
```

## 📊 Data Models

### Employee

```typescript
interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  employment_status: 'active' | 'inactive' | 'terminated' | 'probation' | 'contract';
  hire_date: string;
  salary: number;
  currency: string;
  // ... additional fields
}
```

### PayrollRecord

```typescript
interface PayrollRecord {
  id: string;
  employee_id: string;
  pay_period_start: string;
  pay_period_end: string;
  basic_salary: number;
  gross_pay: number;
  net_pay: number;
  // ... additional fields
}
```

### LeaveRequest

```typescript
interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type: 'annual' | 'sick' | 'maternity' | 'paternity' | 'unpaid' | 'other';
  start_date: string;
  end_date: string;
  days_requested: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  // ... additional fields
}
```

## 🔒 Security

### Access Control

The module implements role-based access control with the following roles:

- **HR Admin**: Full access to all SHRM functions
- **HR Manager**: Employee management and approval workflows
- **Manager**: Team member management and performance reviews
- **Employee**: Self-service functions and personal information

### Data Protection

- All sensitive data is encrypted at rest and in transit
- Personal information is masked in logs and audit trails
- GDPR and local privacy law compliance built-in
- Secure file upload and document storage

## 🧪 Testing

### Unit Tests

```bash
# Run unit tests
npm test -- --testPathPattern=shrm

# Run with coverage
npm test -- --coverage --testPathPattern=shrm
```

### Integration Tests

```bash
# Run integration tests
npm run test:integration -- --testPathPattern=shrm
```

### E2E Tests

```bash
# Run end-to-end tests
npm run test:e2e -- --spec="**/shrm/**/*.spec.ts"
```

## 📈 Performance

### Optimization Features

- **Caching**: Redis-based caching for frequently accessed data
- **Pagination**: Efficient data loading with pagination
- **Lazy Loading**: Components and data loaded on demand
- **Database Optimization**: Indexed queries and optimized schemas
- **CDN Integration**: Static assets served via CDN

### Monitoring

- Performance metrics tracking
- Error rate monitoring
- User experience analytics
- Database query performance monitoring

## 🔄 API Integration

### REST API Endpoints

```typescript
// Employee endpoints
GET    /api/shrm/employees
POST   /api/shrm/employees
GET    /api/shrm/employees/:id
PUT    /api/shrm/employees/:id
DELETE /api/shrm/employees/:id

// Payroll endpoints
GET    /api/shrm/payroll
POST   /api/shrm/payroll
GET    /api/shrm/payroll/:id
PUT    /api/shrm/payroll/:id

// Leave endpoints
GET    /api/shrm/leave-requests
POST   /api/shrm/leave-requests
PUT    /api/shrm/leave-requests/:id/approve
PUT    /api/shrm/leave-requests/:id/reject
```

### WebSocket Events

```typescript
// Real-time notifications
'shrm:notification:created'
'shrm:leave:request:updated'
'shrm:payroll:processed'
'shrm:performance:review:due'
```

## 🌍 Internationalization

The module supports multiple languages and regional configurations:

- **Languages**: English, Malay, Chinese, Tamil
- **Currencies**: MYR, USD, SGD, EUR, GBP
- **Date Formats**: ISO 8601, local formats
- **Number Formats**: Localized number formatting
- **Time Zones**: UTC, local time zones

## 📋 Compliance

### Regulatory Compliance

- **EPF (Employees Provident Fund)**: Automatic contribution calculation
- **SOCSO (Social Security Organization)**: Social security compliance
- **EIS (Employment Insurance System)**: Insurance contribution tracking
- **PCB (Monthly Tax Deduction)**: Tax deduction automation
- **EA Form**: Annual employment income reporting
- **CP204/CP500**: Tax installment management

### Audit Requirements

- Complete audit trail for all operations
- Data retention policies
- Access log monitoring
- Compliance report generation
- Regular security assessments

## 🚀 Deployment

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Monitoring tools configured
- [ ] Backup procedures tested
- [ ] Security audit completed
- [ ] Performance testing passed
- [ ] User acceptance testing completed

### Deployment Commands

```bash
# Build for production
npm run build

# Deploy to production
npm run deploy:prod

# Run database migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

## 🤝 Contributing

### Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run development server: `npm run dev`
5. Run tests: `npm test`

### Code Standards

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write comprehensive unit tests
- Document all public APIs
- Follow the isolation pattern

### Pull Request Process

1. Create a feature branch
2. Make your changes
3. Add tests for new functionality
4. Update documentation
5. Submit a pull request
6. Code review and approval
7. Merge to main branch

## 📞 Support

### Documentation

- [API Documentation](./api.md)
- [Component Documentation](./components.md)
- [Service Documentation](./services.md)
- [Deployment Guide](./deployment.md)

### Contact

- **Technical Support**: tech-support@aibos.com
- **Feature Requests**: features@aibos.com
- **Bug Reports**: bugs@aibos.com

### Community

- **GitHub Issues**: [Report Issues](https://github.com/aibos/shrm/issues)
- **Discussions**: [Community Forum](https://github.com/aibos/shrm/discussions)
- **Wiki**: [Documentation Wiki](https://github.com/aibos/shrm/wiki)

## 📄 License

This module is part of the AIBOS_MINI project and is licensed under the MIT License.

## 🔄 Version History

### v1.0.0 (Current)
- Initial release with core SHRM functionality
- Employee management system
- Payroll processing
- Leave management
- Performance reviews
- Compliance tracking
- Notification system

### Planned Features
- Advanced analytics and reporting
- Mobile application
- AI-powered insights
- Advanced workflow automation
- Multi-tenant support
- Advanced security features

---

**Built with ❤️ by the AIBOS Team** 