# @aibos/crm-sdk

Customer Relationship Management SDK for Aibos Accounting SaaS.

## Features

- **Customer Management**: Comprehensive customer data and relationship management
- **Lead Management**: Lead tracking and conversion pipeline
- **Pipeline Management**: Sales pipeline and opportunity tracking
- **Activity Tracking**: Customer interaction and activity logging
- **Marketing Integration**: Marketing campaign and lead generation
- **Analytics**: CRM analytics and reporting
- **Hybrid CRM**: Advanced hybrid CRM functionality

## Services

### Customer Service
- Customer profile management
- Contact information handling
- Customer segmentation
- Relationship tracking

### Lead Management
- Lead capture and qualification
- Lead scoring and prioritization
- Lead conversion tracking
- Lead nurturing workflows

### Pipeline Management
- Sales pipeline configuration
- Opportunity tracking
- Stage progression management
- Pipeline analytics

### Activity Management
- Customer interaction logging
- Activity timeline tracking
- Communication history
- Task and follow-up management

### Marketing Integration
- Campaign management
- Lead generation tracking
- Marketing automation
- ROI measurement

### Analytics
- CRM performance metrics
- Sales analytics
- Customer insights
- Predictive analytics

### Hybrid CRM
- Advanced CRM functionality
- Multi-channel integration
- AI-powered insights
- Automated workflows

## Usage

```typescript
import { 
  CustomerService, 
  LeadService, 
  PipelineService 
} from '@aibos/crm-sdk';

// Initialize CRM services
const customerService = new CustomerService();
const leadService = new LeadService();
const pipelineService = new PipelineService();

// Create a new customer
const customer = await customerService.createCustomer({
  name: 'Acme Corp',
  email: 'contact@acme.com',
  phone: '+1-555-0123'
});

// Create a lead
const lead = await leadService.createLead({
  name: 'John Doe',
  company: 'Tech Startup',
  email: 'john@techstartup.com',
  source: 'website'
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