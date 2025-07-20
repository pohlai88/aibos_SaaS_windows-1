# @aibos/workflow-sdk

Workflow Automation SDK for Aibos Accounting SaaS.

## Features

- **Workflow Automation**: Enterprise-grade workflow automation and orchestration
- **Approval Workflows**: Configurable approval processes and routing
- **Process Management**: End-to-end process tracking and management
- **Integration**: Seamless integration with all Aibos modules
- **Compliance**: Audit trails and compliance reporting
- **Scalability**: High-performance workflow execution

## Services

### Workflow Automation Enterprise
- Advanced workflow orchestration
- Multi-step process automation
- Conditional routing and branching
- Error handling and recovery
- Performance monitoring and optimization
- Integration with external systems

### Approval Workflow Engine
- Configurable approval hierarchies
- Multi-level approval processes
- Delegation and escalation rules
- Approval tracking and notifications
- Compliance and audit trails
- Mobile-friendly approval interfaces

## Usage

```typescript
import { 
  WorkflowAutomationService, 
  ApprovalWorkflowEngine 
} from '@aibos/workflow-sdk';

// Initialize workflow services
const workflowService = new WorkflowAutomationService();
const approvalEngine = new ApprovalWorkflowEngine();

// Create a new workflow
const workflow = await workflowService.createWorkflow({
  name: 'Invoice Approval',
  description: 'Automated invoice approval process',
  steps: [
    { name: 'Submit', action: 'submit_invoice' },
    { name: 'Review', action: 'review_invoice' },
    { name: 'Approve', action: 'approve_invoice' }
  ]
});

// Start approval process
const approval = await approvalEngine.startApproval({
  workflowId: workflow.id,
  documentId: 'INV-001',
  approvers: ['manager1', 'manager2'],
  deadline: new Date('2024-02-01')
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