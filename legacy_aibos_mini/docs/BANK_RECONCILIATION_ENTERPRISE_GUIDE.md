# Enterprise Bank Reconciliation Service Documentation

## Overview

The Enterprise Bank Reconciliation Service provides a comprehensive, production-ready solution for automated bank statement reconciliation. This service features advanced matching algorithms, ML-powered insights, comprehensive validation, performance monitoring, and extensive analytics capabilities.

## Key Features

### 🏦 Advanced Bank Account Management
- Multi-currency support with real-time exchange rates
- Comprehensive account validation and metadata management
- Automatic balance tracking and reconciliation monitoring
- Support for multiple account types (checking, savings, credit cards, etc.)

### 📊 Intelligent Statement Processing
- Multi-format statement import (CSV, OFX, QIF, MT940)
- Automatic duplicate detection and prevention
- Batch processing with configurable chunk sizes
- Real-time validation and error reporting
- Comprehensive transaction categorization

### 🔍 Advanced Matching Engine
- Rule-based matching with configurable confidence thresholds
- Fuzzy matching for partial matches
- ML-powered matching suggestions
- Multi-criteria matching (amount, date, description, reference)
- Automatic match approval workflow

### 📈 Comprehensive Analytics
- Real-time reconciliation performance metrics
- Exception pattern analysis and recommendations
- Rule effectiveness tracking
- Cost savings calculations
- Trend analysis and forecasting

### 🔒 Enterprise Security
- Role-based access control
- Audit trail for all operations
- Data encryption at rest and in transit
- Comprehensive permission management

### ⚡ Performance Optimization
- Intelligent caching with configurable TTL
- Parallel processing for large datasets
- Background job processing
- Performance monitoring and alerting

## Architecture

```
Enterprise Bank Reconciliation Service
├── Core Service Layer
│   ├── Account Management
│   ├── Statement Processing
│   ├── Reconciliation Engine
│   └── Analytics Engine
├── Data Layer
│   ├── Supabase Database
│   ├── Caching Layer
│   └── File Storage
├── Processing Layer
│   ├── Batch Processor
│   ├── Validation Engine
│   └── ML Matching Engine
└── Monitoring Layer
    ├── Performance Monitor
    ├── Health Checks
    └── Alerting System
```

## Quick Start

### Installation

```bash
npm install @aibos/ledger-sdk
```

### Basic Usage

```typescript
import { EnterpriseBankReconciliationService } from '@aibos/ledger-sdk';

// Initialize the service
const reconciliationService = new EnterpriseBankReconciliationService(
  'your-supabase-url',
  'your-supabase-key'
);

// Create user context
const userContext = {
  user_id: 'user-123',
  organization_id: 'org-123',
  role: 'admin',
  permissions: ['read', 'write', 'admin'],
  session_id: 'session-123'
};

// Create a bank account
const accountResult = await reconciliationService.createBankAccount(
  'org-123',
  {
    organization_id: 'org-123',
    account_number: '1234567890',
    account_name: 'Primary Checking',
    bank_name: 'First National Bank',
    account_type: BankAccountType.CHECKING,
    currency: 'USD',
    opening_balance: 10000.00,
    current_balance: 12500.00,
    available_balance: 12000.00,
    is_active: true,
    auto_reconcile: true,
    reconciliation_rules: [],
    tags: ['primary'],
    metadata: {},
    created_by: userContext.user_id,
    updated_by: userContext.user_id
  },
  userContext
);

// Import a bank statement
const statementResult = await reconciliationService.importBankStatement(
  accountResult.data.id,
  {
    bank_account_id: accountResult.data.id,
    statement_date: '2024-01-31',
    statement_period_start: '2024-01-01',
    statement_period_end: '2024-01-31',
    opening_balance: 10000.00,
    closing_balance: 12500.00,
    total_deposits: 5000.00,
    total_withdrawals: 2500.00,
    total_fees: 25.00,
    total_interest: 15.00,
    transaction_count: 45,
    statement_number: 'STMT-2024-01',
    statement_hash: 'unique-hash',
    imported_by: userContext.user_id,
    processing_status: StatementProcessingStatus.PENDING,
    validation_errors: [],
    transactions: [],
    metadata: {}
  },
  {
    validate_format: true,
    duplicate_detection: true,
    skip_duplicates: false,
    batch_size: 100,
    auto_categorize: true,
    auto_reconcile: false,
    generate_summary: true
  },
  userContext
);

// Perform reconciliation
const reconciliationResult = await reconciliationService.performReconciliation(
  accountResult.data.id,
  statementResult.data.id,
  {
    auto_match: true,
    confidence_threshold: 0.8,
    require_manual_review: false,
    generate_insights: true,
    batch_size: 50,
    date_tolerance: 3,
    amount_tolerance: 0.01,
    enable_ml_matching: false,
    parallel_processing: true,
    cache_results: true
  },
  userContext
);
```

## API Reference

### Core Methods

#### `createBankAccount(organizationId, accountData, userContext)`
Creates a new bank account with comprehensive validation.

**Parameters:**
- `organizationId`: Organization identifier
- `accountData`: Account details (account number, name, bank, type, etc.)
- `userContext`: User authentication and authorization context

**Returns:** `BankReconciliationServiceResponse<BankAccount>`

#### `importBankStatement(accountId, statementData, options, userContext)`
Imports a bank statement with optional validation and processing.

**Parameters:**
- `accountId`: Bank account identifier
- `statementData`: Statement details and transactions
- `options`: Import configuration options
- `userContext`: User authentication context

**Returns:** `BankReconciliationServiceResponse<BankStatement>`

#### `performReconciliation(accountId, statementId, options, userContext)`
Performs automated reconciliation with configurable matching rules.

**Parameters:**
- `accountId`: Bank account identifier
- `statementId`: Statement identifier
- `options`: Reconciliation configuration
- `userContext`: User authentication context

**Returns:** `BankReconciliationServiceResponse<ReconciliationSession>`

### Management Methods

#### `getBankAccount(accountId, userContext)`
Retrieves a bank account by ID.

#### `listBankAccounts(organizationId, options, userContext)`
Lists bank accounts with filtering and pagination.

#### `createReconciliationRule(organizationId, ruleData, userContext)`
Creates a new reconciliation rule.

#### `getReconciliationHistory(organizationId, options, userContext)`
Retrieves reconciliation history with filtering.

#### `getReconciliationMatches(sessionId, options, userContext)`
Gets reconciliation matches for a session.

#### `updateMatchStatus(matchId, status, approvalStatus, notes, userContext)`
Updates the status of a reconciliation match.

### Analytics Methods

#### `getReconciliationAnalytics(organizationId, options, userContext)`
Provides comprehensive analytics and insights.

#### `healthCheck()`
Performs system health check.

## Configuration

### Environment Variables

```bash
# Supabase Configuration
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key

# Cache Configuration
CACHE_TTL_BANK_ACCOUNT=300000    # 5 minutes
CACHE_TTL_STATEMENT=600000       # 10 minutes
CACHE_TTL_TRANSACTION=120000     # 2 minutes
CACHE_TTL_RULE=900000           # 15 minutes
CACHE_TTL_MATCH=1800000         # 30 minutes
CACHE_TTL_SESSION=3600000       # 1 hour
CACHE_TTL_ANALYTICS=7200000     # 2 hours

# Processing Configuration
BATCH_SIZE_DEFAULT=100
BATCH_SIZE_MAX=1000
PARALLEL_PROCESSING_MAX=5
```

### Reconciliation Rules

Reconciliation rules define how transactions are matched between bank statements and ledger entries. Rules support multiple criteria:

```typescript
const rule = {
  rule_name: 'Exact Amount and Date Match',
  description: 'Matches transactions with exact amount and date within tolerance',
  rule_type: ReconciliationRuleType.EXACT_MATCH,
  criteria: {
    amount_match: true,
    amount_tolerance: 0.01,
    date_match: true,
    date_tolerance: 3, // days
    description_match: true,
    description_similarity: 0.8,
    reference_match: true,
    reference_patterns: ['INV-*', 'PO-*'],
    counterparty_match: false,
    check_number_match: true,
    category_match: false,
    min_confidence: 0.8,
    fuzzy_matching: true,
    ml_scoring: false,
    custom_rules: {}
  },
  actions: [
    {
      type: 'auto_match',
      parameters: {},
      conditions: {}
    }
  ],
  priority: 10,
  auto_approve: true,
  confidence_threshold: 0.9
};
```

## Database Schema

### Required Tables

```sql
-- Bank Accounts
CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  bank_name VARCHAR(255) NOT NULL,
  bank_code VARCHAR(20),
  swift_code VARCHAR(20),
  iban VARCHAR(50),
  account_type VARCHAR(50) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  opening_balance DECIMAL(15,2) NOT NULL,
  current_balance DECIMAL(15,2) NOT NULL,
  available_balance DECIMAL(15,2) NOT NULL,
  last_reconciliation_date TIMESTAMP,
  last_statement_date TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  auto_reconcile BOOLEAN DEFAULT false,
  reconciliation_rules TEXT[],
  tags TEXT[],
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL
);

-- Bank Statements
CREATE TABLE bank_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_account_id UUID NOT NULL REFERENCES bank_accounts(id),
  statement_date DATE NOT NULL,
  statement_period_start DATE NOT NULL,
  statement_period_end DATE NOT NULL,
  opening_balance DECIMAL(15,2) NOT NULL,
  closing_balance DECIMAL(15,2) NOT NULL,
  total_deposits DECIMAL(15,2) NOT NULL,
  total_withdrawals DECIMAL(15,2) NOT NULL,
  total_fees DECIMAL(15,2) NOT NULL,
  total_interest DECIMAL(15,2) NOT NULL,
  transaction_count INTEGER NOT NULL,
  statement_number VARCHAR(100) NOT NULL,
  statement_hash VARCHAR(255) NOT NULL,
  imported_at TIMESTAMP DEFAULT NOW(),
  imported_by UUID NOT NULL,
  file_name VARCHAR(255),
  file_type VARCHAR(50),
  file_size INTEGER,
  processing_status VARCHAR(50) NOT NULL,
  validation_errors TEXT[],
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Bank Transactions
CREATE TABLE bank_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_statement_id UUID NOT NULL REFERENCES bank_statements(id),
  transaction_date DATE NOT NULL,
  value_date DATE NOT NULL,
  description TEXT NOT NULL,
  reference VARCHAR(255),
  amount DECIMAL(15,2) NOT NULL,
  type VARCHAR(50) NOT NULL,
  category VARCHAR(100),
  subcategory VARCHAR(100),
  check_number VARCHAR(50),
  counterparty VARCHAR(255),
  counterparty_account VARCHAR(100),
  is_reconciled BOOLEAN DEFAULT false,
  matched_transaction_id UUID,
  confidence_score DECIMAL(5,4),
  reconciliation_notes TEXT,
  tags TEXT[],
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Reconciliation Rules
CREATE TABLE reconciliation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  rule_name VARCHAR(255) NOT NULL,
  description TEXT,
  rule_type VARCHAR(50) NOT NULL,
  criteria JSONB NOT NULL,
  actions JSONB NOT NULL,
  priority INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  auto_approve BOOLEAN DEFAULT false,
  confidence_threshold DECIMAL(5,4) NOT NULL,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL,
  usage_count INTEGER DEFAULT 0
);

-- Reconciliation Sessions
CREATE TABLE reconciliation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  bank_account_id UUID NOT NULL REFERENCES bank_accounts(id),
  bank_statement_id UUID NOT NULL REFERENCES bank_statements(id),
  status VARCHAR(50) NOT NULL,
  total_transactions INTEGER,
  matched_transactions INTEGER,
  unmatched_transactions INTEGER,
  variance_amount DECIMAL(15,2),
  reconciliation_rate DECIMAL(5,4),
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  started_by UUID NOT NULL,
  completed_by UUID,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Reconciliation Matches
CREATE TABLE reconciliation_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_transaction_id UUID NOT NULL REFERENCES bank_transactions(id),
  ledger_transaction_id UUID NOT NULL,
  match_type VARCHAR(50) NOT NULL,
  confidence_score DECIMAL(5,4) NOT NULL,
  matching_criteria TEXT[],
  match_details JSONB,
  status VARCHAR(50) NOT NULL,
  matched_by UUID NOT NULL,
  matched_at TIMESTAMP DEFAULT NOW(),
  reviewed_by UUID,
  reviewed_at TIMESTAMP,
  approval_status VARCHAR(50) NOT NULL,
  rule_id UUID REFERENCES reconciliation_rules(id),
  variance_amount DECIMAL(15,2),
  variance_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Error Handling

The service provides comprehensive error handling with structured error responses:

```typescript
enum BankReconciliationErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  BANK_ACCOUNT_NOT_FOUND = 'BANK_ACCOUNT_NOT_FOUND',
  STATEMENT_NOT_FOUND = 'STATEMENT_NOT_FOUND',
  TRANSACTION_NOT_FOUND = 'TRANSACTION_NOT_FOUND',
  DUPLICATE_STATEMENT = 'DUPLICATE_STATEMENT',
  INVALID_FILE_FORMAT = 'INVALID_FILE_FORMAT',
  PROCESSING_ERROR = 'PROCESSING_ERROR',
  MATCHING_ERROR = 'MATCHING_ERROR',
  RULE_ERROR = 'RULE_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  CACHE_ERROR = 'CACHE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR'
}
```

## Performance Considerations

### Caching Strategy
- Account data cached for 5 minutes
- Statement data cached for 10 minutes
- Transaction data cached for 2 minutes
- Rule data cached for 15 minutes
- Match data cached for 30 minutes
- Session data cached for 1 hour
- Analytics data cached for 2 hours

### Batch Processing
- Default batch size: 100 transactions
- Maximum batch size: 1000 transactions
- Parallel processing: Up to 5 concurrent batches

### Database Optimization
- Proper indexing on frequently queried columns
- Connection pooling for database connections
- Query optimization for large datasets

## Security

### Authentication
- User context required for all operations
- Role-based access control
- Session validation

### Authorization
- Permission-based access control
- Organization-level data isolation
- Action-specific permissions

### Data Protection
- Encryption at rest and in transit
- Audit logging for all operations
- Data masking for sensitive information

## Monitoring & Alerting

### Health Checks
- Database connectivity
- Cache availability
- Performance metrics
- Error rates

### Metrics
- Processing time per operation
- Cache hit rates
- Error rates by type
- Reconciliation success rates

### Alerts
- High error rates
- Performance degradation
- Failed reconciliations
- System health issues

## Testing

### Unit Tests
Run comprehensive unit tests:
```bash
npm test
```

### Integration Tests
Run integration tests with real database:
```bash
npm run test:integration
```

### Load Testing
Performance testing with large datasets:
```bash
npm run test:load
```

## Migration Guide

### From Basic Service
1. Update imports to use `EnterpriseBankReconciliationService`
2. Add user context to all method calls
3. Update error handling to use structured responses
4. Implement proper permission checking
5. Update database schema with new tables

### Version Compatibility
- Backward compatible with existing data
- Gradual migration support
- Version-specific configuration options

## Support

For technical support and questions:
- Documentation: [Link to full documentation]
- Issues: [GitHub Issues]
- Community: [Discord/Slack]
- Enterprise Support: [Contact Information]

## License

This software is licensed under the MIT License. See LICENSE file for details.

## Changelog

### v2.0.0 (Enterprise)
- Complete rewrite with enterprise features
- Advanced matching algorithms
- Comprehensive analytics
- Performance optimizations
- Enhanced security
- ML-powered insights

### v1.0.0 (Basic)
- Initial release
- Basic reconciliation features
- Simple matching rules
- Manual processing
