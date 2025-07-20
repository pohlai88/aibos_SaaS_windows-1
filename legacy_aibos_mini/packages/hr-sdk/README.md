# @aibos/hr-sdk

Human Resources SDK for Aibos Accounting SaaS.

## Features

- **Employee Management**: Comprehensive employee data and lifecycle management
- **Payroll Processing**: Automated payroll calculations and processing
- **Leave Management**: Employee leave tracking and approval workflows
- **Performance Management**: Employee performance evaluation and tracking
- **Compliance**: HR compliance and regulatory reporting
- **Integration**: Seamless integration with accounting and finance systems

## Services

### SHRM Service
- Strategic Human Resource Management
- Employee lifecycle management
- Payroll and benefits administration
- Performance and talent management
- Compliance and reporting
- HR analytics and insights

## Usage

```typescript
import { SHRMService } from '@aibos/hr-sdk';

// Initialize HR service
const hrService = new SHRMService();

// Create a new employee
const employee = await hrService.createEmployee({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@company.com',
  position: 'Software Engineer',
  department: 'Engineering',
  startDate: new Date('2024-01-15')
});

// Process payroll
const payroll = await hrService.processPayroll({
  employeeId: employee.id,
  period: '2024-01',
  hours: 160,
  overtime: 8
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