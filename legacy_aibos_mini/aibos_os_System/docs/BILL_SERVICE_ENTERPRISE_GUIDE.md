# Enterprise Bill Service Documentation

## Overview

The Enterprise Bill Service is a comprehensive, production-ready solution for managing vendor bills and accounts payable processes. This service provides enterprise-grade features including automated workflows, real-time payment processing, advanced analytics, and comprehensive audit trails.

## Features

### Core Bill Management
- **Advanced Bill Creation**: Comprehensive validation with duplicate detection
- **Multi-format Import**: Support for PDF, Excel, CSV, XML, and JSON formats
- **OCR Processing**: AI-powered invoice text extraction and data parsing
- **Real-time Processing**: Immediate bill processing with performance monitoring
- **Version Control**: Complete audit trail for all bill changes

### Approval Workflows
- **Multi-step Approvals**: Configurable approval chains with role-based access
- **Automatic Routing**: Smart routing based on amount thresholds and departments
- **Escalation Rules**: Automatic escalation for overdue approvals
- **Delegation Support**: Temporary approval delegation capabilities
- **Approval Analytics**: Track approval times and bottlenecks

### Payment Processing
- **Multiple Payment Methods**: Cash, check, bank transfer, credit card, ACH, wire transfer
- **Currency Conversion**: Real-time exchange rates with multi-currency support
- **Payment Reconciliation**: Automatic matching with bank statements
- **Payment Scheduling**: Schedule future payments with reminders
- **Payment Analytics**: Track payment patterns and vendor performance

### Vendor Management
- **Comprehensive Profiles**: Complete vendor information with banking details
- **Contact Management**: Multiple contacts per vendor with role assignments
- **Performance Tracking**: Monitor delivery times, quality, and compliance
- **Credit Limits**: Set and monitor vendor credit limits
- **1099 Processing**: Automated tax form generation and reporting

### Analytics & Reporting
- **Real-time Dashboards**: Live spend analytics and KPI monitoring
- **Cost Analysis**: Department, project, and cost center breakdowns
- **Vendor Performance**: Delivery times, quality metrics, and compliance rates
- **Budget Tracking**: Monitor spending against budgets with variance analysis
- **Predictive Analytics**: ML-powered spend forecasting and trend analysis

### Enterprise Features
- **Performance Monitoring**: Track response times, throughput, and error rates
- **Intelligent Caching**: Automatic cache management for optimal performance
- **Schema Validation**: Type-safe operations with comprehensive error handling
- **Audit Trails**: Complete activity logging for compliance and security
- **Health Monitoring**: Built-in system health checks and diagnostics

## API Reference

### Core Methods

#### `createBill(organization_id, billData, options, userContext)`
Creates a new bill with comprehensive validation and workflow processing.

**Parameters:**
- `organization_id` (string): Organization identifier
- `billData` (BillData): Bill information and line items
- `options` (BillOptions): Processing options and flags
- `userContext` (UserContext): User session and permissions

**Returns:** `BillServiceResponse<Bill>`

**Example:**
```typescript
const result = await billService.createBill(
  'org-123',
  {
    vendor_id: 'vendor-456',
    bill_date: '2025-01-01',
    due_date: '2025-01-31',
    total_amount: 1500.00,
    currency: 'USD',
    lines: [
      {
        account_id: 'office-supplies',
        description: 'Office supplies',
        quantity: 1,
        unit_price: 1500.00
      }
    ]
  },
  {
    auto_approve: false,
    send_notifications: true,
    validate_budget: true
  },
  userContext
);
```

#### `getBillById(bill_id, userContext)`
Retrieves a bill by ID with full enrichment including payments, approvals, and audit trail.

**Parameters:**
- `bill_id` (string): Bill identifier
- `userContext` (UserContext): User session and permissions

**Returns:** `BillServiceResponse<Bill>`

#### `getBills(organization_id, filters, pagination, userContext)`
Retrieves bills with advanced filtering and pagination.

**Parameters:**
- `organization_id` (string): Organization identifier
- `filters` (BillFilter): Search and filter criteria
- `pagination` (Pagination): Page and limit settings
- `userContext` (UserContext): User session and permissions

**Returns:** `BillServiceResponse<{ bills: Bill[]; total: number; summary: BillSummary }>`

#### `processPayment(bill_id, paymentData, userContext)`
Processes a payment for a bill with validation and reconciliation.

**Parameters:**
- `bill_id` (string): Bill identifier
- `paymentData` (PaymentData): Payment information
- `userContext` (UserContext): User session and permissions

**Returns:** `BillServiceResponse<BillPayment>`

#### `getBillAnalytics(organization_id, options, userContext)`
Generates comprehensive analytics and insights.

**Parameters:**
- `organization_id` (string): Organization identifier
- `options` (AnalyticsOptions): Analysis parameters
- `userContext` (UserContext): User session and permissions

**Returns:** `BillServiceResponse<BillAnalytics>`

### Vendor Management

#### `createVendor(organization_id, vendorData, userContext)`
Creates a new vendor with comprehensive validation.

#### `updateVendor(vendor_id, updates, userContext)`
Updates vendor information with audit trail.

#### `getVendorAnalytics(vendor_id, userContext)`
Provides vendor performance analytics and insights.

## Data Models

### Bill
Complete bill information with lines, payments, approvals, and audit trail.

```typescript
interface Bill {
  id: string;
  organization_id: string;
  bill_number: string;
  vendor_id: string;
  bill_date: string;
  due_date: string;
  total_amount: number;
  currency: string;
  status: BillStatus;
  approval_status: ApprovalStatus;
  lines: BillLine[];
  payments: BillPayment[];
  approvals: BillApproval[];
  audit_trail: BillAuditTrail[];
  // ... additional fields
}
```

### BillStatus Enum
- `DRAFT`: Initial state, not yet submitted
- `PENDING_APPROVAL`: Waiting for approval
- `APPROVED`: Approved and ready for payment
- `REJECTED`: Rejected during approval process
- `SENT`: Sent to vendor
- `RECEIVED`: Received by vendor
- `PARTIALLY_PAID`: Partial payment made
- `PAID`: Fully paid
- `OVERDUE`: Past due date
- `CANCELLED`: Cancelled
- `VOID`: Voided

### ApprovalStatus Enum
- `PENDING`: Waiting for approval
- `APPROVED`: Approved
- `REJECTED`: Rejected
- `DELEGATED`: Delegated to another approver
- `ESCALATED`: Escalated due to timeout
- `EXPIRED`: Approval timeout expired

## Configuration

### Environment Variables
```bash
# Database Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# Cache Configuration
CACHE_TTL_BILLS=120000        # 2 minutes
CACHE_TTL_VENDORS=300000      # 5 minutes
CACHE_TTL_ANALYTICS=1800000   # 30 minutes

# Performance Configuration
MAX_CACHE_SIZE=1000
MAX_METRICS_STORED=10000
BATCH_SIZE_LIMIT=1000
```

### Permissions
The service requires specific permissions for different operations:

- `bill.create` - Create bills
- `bill.read` - View bills
- `bill.update` - Update bills
- `bill.delete` - Delete bills
- `bill.approve` - Approve bills
- `bill.payment` - Process payments
- `vendor.create` - Create vendors
- `vendor.update` - Update vendors
- `analytics.view` - View analytics

## Error Handling

The service provides comprehensive error handling with specific error codes:

### Error Codes
- `VALIDATION_ERROR`: Input validation failures
- `PERMISSION_DENIED`: Insufficient permissions
- `BILL_NOT_FOUND`: Bill does not exist
- `VENDOR_NOT_FOUND`: Vendor does not exist
- `DUPLICATE_BILL`: Duplicate bill detected
- `INVALID_STATUS_TRANSITION`: Invalid status change
- `BUDGET_EXCEEDED`: Budget limits exceeded
- `PAYMENT_FAILED`: Payment processing failure
- `DATABASE_ERROR`: Database operation failure

### Error Response Format
```typescript
interface BillServiceError {
  code: BillErrorCode;
  message: string;
  severity: ErrorSeverity;
  field?: string;
  timestamp: Date;
  details?: any;
}
```

## Performance Monitoring

The service includes built-in performance monitoring:

### Metrics Tracked
- Average response time per operation
- Throughput (operations per second)
- Error rates and types
- Cache hit rates
- Memory usage patterns
- Database query performance

### Health Checks
```typescript
const health = await billService.healthCheck();
console.log(health);
// {
//   status: 'healthy',
//   checks: {
//     database: true,
//     cache: true,
//     performance: true
//   },
//   timestamp: '2025-01-01T12:00:00Z'
// }
```

## Caching Strategy

### Cache Types
- **Bill Cache**: Individual bills and bill lists (2 minutes TTL)
- **Vendor Cache**: Vendor information (5 minutes TTL)
- **Summary Cache**: Aggregated summaries (10 minutes TTL)
- **Analytics Cache**: Complex analytics (30 minutes TTL)

### Cache Invalidation
- Automatic invalidation on data changes
- Tag-based invalidation for related data
- Manual cache clearing for troubleshooting

## Security Features

### Data Protection
- Row-level security with organization isolation
- Field-level permissions for sensitive data
- Audit trails for all data changes
- IP address and user agent tracking

### Validation
- Schema validation using Zod
- Business rule validation
- Duplicate detection algorithms
- Budget constraint checking

## Integration Guide

### Basic Setup
```typescript
import { EnterpriseBillService } from '@aibos/ledger-sdk';

const billService = new EnterpriseBillService(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);
```

### User Context
```typescript
const userContext = {
  user_id: 'user-123',
  organization_id: 'org-456',
  role: 'accounts_payable_clerk',
  permissions: ['bill.create', 'bill.read', 'bill.update'],
  session_id: 'session-789'
};
```

### Error Handling
```typescript
try {
  const result = await billService.createBill(orgId, billData, options, userContext);
  
  if (!result.success) {
    console.error('Bill creation failed:', result.errors);
    return;
  }
  
  console.log('Bill created:', result.data);
} catch (error) {
  console.error('Unexpected error:', error);
}
```

## Best Practices

### Performance Optimization
1. Use filters to limit data retrieval
2. Implement pagination for large datasets
3. Cache frequently accessed data
4. Use batch operations for bulk processing
5. Monitor performance metrics regularly

### Security
1. Always validate user permissions
2. Use parameterized queries
3. Implement proper session management
4. Log all security-relevant events
5. Regular security audits

### Data Quality
1. Validate all input data
2. Implement duplicate detection
3. Use consistent data formats
4. Regular data cleanup processes
5. Monitor data quality metrics

## Troubleshooting

### Common Issues

**Slow Performance**
- Check cache hit rates
- Review database query performance
- Analyze network latency
- Monitor memory usage

**Permission Errors**
- Verify user permissions
- Check organization membership
- Review role assignments
- Validate session tokens

**Validation Failures**
- Check input data format
- Verify required fields
- Review business rule validation
- Check for duplicate data

### Diagnostic Tools

**Performance Metrics**
```typescript
const metrics = billService.getPerformanceMetrics();
console.log('Average response time:', metrics.average_response_time);
console.log('Error rate:', metrics.error_rate);
```

**Cache Statistics**
```typescript
const cacheStats = billService.getCacheStats();
console.log('Cache size:', cacheStats.size);
console.log('Hit rate:', cacheStats.hit_rate);
```

## Migration Guide

### From Basic Bill Service
1. Update import statements
2. Add user context parameters
3. Update error handling
4. Implement new response format
5. Add permission checks

### Database Schema Updates
The enterprise service requires additional tables:
- `bill_approvals`
- `bill_audit_trail`
- `bill_attachments`
- `vendor_contacts`
- `approval_workflows`

## Support and Maintenance

### Monitoring
- Set up performance alerts
- Monitor error rates
- Track usage patterns
- Regular health checks

### Backup and Recovery
- Regular database backups
- Cache warm-up procedures
- Disaster recovery plans
- Data retention policies

### Updates and Patches
- Regular security updates
- Performance improvements
- Feature enhancements
- Bug fixes and patches
