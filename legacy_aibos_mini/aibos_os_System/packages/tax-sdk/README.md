# @aibos/tax-sdk

Tax calculation and integration SDK for Aibos Accounting SaaS.

## Features

- **Tax Calculation**: Enterprise-grade tax calculation services
- **Tax Integration**: External tax service integrations
- **Validation**: Comprehensive tax validation and error handling
- **Performance**: Optimized for high-performance tax operations

## Services

### Tax Calculation Enterprise
- Advanced tax calculation algorithms
- Multi-jurisdiction support
- Real-time tax rate updates
- Audit trail and compliance features

### Tax Integration Service
- External tax API integrations
- Tax rate synchronization
- Compliance reporting
- Error handling and retry logic

## Usage

```typescript
import { 
  TaxCalculationService, 
  TaxIntegrationService 
} from '@aibos/tax-sdk';

// Initialize tax calculation service
const taxCalc = new TaxCalculationService();

// Calculate tax for a transaction
const result = await taxCalc.calculateTax({
  amount: 1000,
  currency: 'USD',
  jurisdiction: 'US-CA'
});
```

## Dependencies

- `@aibos/core-types`: Shared type definitions
- `@aibos/database`: Database access layer
- `zod`: Runtime validation

## Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm run build

# Run tests
pnpm run test

# Type checking
pnpm run type-check
``` 