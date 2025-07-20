# @aibos/procurement-sdk

Procurement and Supply Chain SDK for Aibos Accounting SaaS.

## Features

- **Procurement Management**: End-to-end procurement process automation
- **Supplier Management**: Comprehensive supplier lifecycle management
- **RFQ Management**: Request for Quotation automation and tracking
- **Catalog Management**: Product catalog and pricing management
- **Spend Analytics**: Advanced spend analysis and reporting
- **AI Intelligence**: AI-powered procurement insights and optimization
- **Integration**: Seamless integration with accounting and finance systems

## Services

### Procurement Service Enterprise
- Core procurement process management
- Purchase order automation
- Contract management
- Compliance and audit trails
- Performance monitoring

### Procurement Enterprise Ultimate
- Advanced procurement features
- Multi-entity procurement
- Complex approval workflows
- Advanced reporting and analytics

### AI Procurement Intelligence
- AI-powered spend analysis
- Predictive procurement insights
- Automated supplier recommendations
- Cost optimization algorithms

### RFQ Management Service
- Request for Quotation automation
- Supplier bidding management
- Evaluation and selection processes
- Contract award management

### Supplier Portal Service
- Supplier self-service portal
- Document management
- Communication workflows
- Performance tracking

### Catalog Management Service
- Product catalog management
- Pricing and discount management
- Category management
- Supplier catalog integration

### Spend Analytics Service
- Spend analysis and reporting
- Cost optimization insights
- Supplier performance analytics
- Compliance reporting

## Usage

```typescript
import { 
  ProcurementService, 
  RFQService, 
  SupplierService 
} from '@aibos/procurement-sdk';

// Initialize procurement services
const procurementService = new ProcurementService();
const rfqService = new RFQService();
const supplierService = new SupplierService();

// Create a new supplier
const supplier = await supplierService.createSupplier({
  name: 'Tech Supplies Inc',
  email: 'contact@techsupplies.com',
  category: 'IT Equipment',
  rating: 4.5
});

// Create an RFQ
const rfq = await rfqService.createRFQ({
  title: 'Laptop Procurement 2024',
  description: 'Purchase 100 laptops for office use',
  budget: 50000,
  deadline: new Date('2024-02-15')
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