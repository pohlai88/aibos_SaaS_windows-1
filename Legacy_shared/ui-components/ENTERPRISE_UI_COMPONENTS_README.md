# AI-BOS Enterprise UI Components

Enterprise-grade React components with ISO27001, GDPR, SOC2, and HIPAA compliance for AI-BOS frontend development.

## 🚀 Features

- **Enterprise Compliance**: ISO27001, GDPR, SOC2, HIPAA compliant
- **Zero-Trust Security**: Audit logging, role-based access, data classification
- **Performance Optimized**: Virtualization, memoization, lazy loading
- **Accessibility**: WCAG 2.1 AA standards
- **TypeScript**: Strict mode with comprehensive type definitions
- **Modern Design**: Clean, professional UI with Tailwind CSS
- **AI-Ready**: Specialized components for AI applications

## 📦 Installation

```bash
npm install @aibos/ui-components
# or
yarn add @aibos/ui-components
```

## 🎯 Quick Start

```tsx
import { EnterpriseProvider, Button, ChatInterface, AIStatus } from '@aibos/ui-components';

function App() {
  return (
    <EnterpriseProvider>
      <div className="p-6">
        <Button variant="primary">Get Started</Button>
        
        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
        />
        
        <AIStatus
          models={aiModels}
          showDetails
          onModelClick={handleModelClick}
        />
      </div>
    </EnterpriseProvider>
  );
}
```

## 🧩 Component Library

### Primitive Components

#### Button
```tsx
import { Button } from '@aibos/ui-components';

<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>
```

#### Input
```tsx
import { Input } from '@aibos/ui-components';

<Input
  label="Email"
  placeholder="Enter your email"
  error="Invalid email"
  required
/>
```

#### Select
```tsx
import { Select } from '@aibos/ui-components';

<Select
  options={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' }
  ]}
  placeholder="Select an option"
  searchable
  multiSelect
/>
```

#### Checkbox & Radio
```tsx
import { Checkbox, Radio } from '@aibos/ui-components';

<Checkbox
  label="Accept terms"
  description="I agree to the terms and conditions"
  checked={accepted}
  onValueChange={setAccepted}
/>

<Radio
  label="Option A"
  checked={selected === 'a'}
  onValueChange={() => setSelected('a')}
/>
```

#### Textarea
```tsx
import { Textarea } from '@aibos/ui-components';

<Textarea
  label="Description"
  placeholder="Enter description"
  showCharacterCount
  maxLength={500}
/>
```

#### Alert
```tsx
import { Alert } from '@aibos/ui-components';

<Alert
  variant="success"
  title="Success!"
  description="Operation completed successfully"
  dismissible
  onDismiss={handleDismiss}
/>
```

#### Card
```tsx
import { Card, CardHeader, CardContent, CardFooter } from '@aibos/ui-components';

<Card variant="elevated">
  <CardHeader>
    <h3>Card Title</h3>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

#### Avatar
```tsx
import { Avatar } from '@aibos/ui-components';

<Avatar
  src="/path/to/image.jpg"
  alt="User Name"
  size="lg"
  status="online"
  fallback="UN"
/>
```

#### Badge
```tsx
import { Badge } from '@aibos/ui-components';

<Badge variant="success" size="md">
  Active
</Badge>
```

#### Modal
```tsx
import { Modal } from '@aibos/ui-components';

<Modal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Confirmation"
  size="md"
>
  <p>Are you sure you want to proceed?</p>
</Modal>
```

#### Tooltip
```tsx
import { Tooltip } from '@aibos/ui-components';

<Tooltip content="This is a helpful tooltip" position="top">
  <Button>Hover me</Button>
</Tooltip>
```

#### Progress
```tsx
import { Progress } from '@aibos/ui-components';

<Progress
  value={75}
  max={100}
  label="Upload Progress"
  showPercentage
  variant="success"
/>
```

### Layout Components

#### Header
```tsx
import { Header } from '@aibos/ui-components';

<Header
  title="AI-BOS Dashboard"
  navigation={[
    { label: 'Dashboard', href: '/dashboard', active: true },
    { label: 'Analytics', href: '/analytics' },
    { label: 'Settings', href: '/settings' }
  ]}
  user={{
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin'
  }}
  onUserMenuClick={handleUserAction}
/>
```

#### Sidebar
```tsx
import { Sidebar } from '@aibos/ui-components';

<Sidebar
  items={[
    { label: 'Dashboard', icon: 'home', href: '/dashboard' },
    { label: 'AI Models', icon: 'brain', href: '/models' },
    { label: 'Analytics', icon: 'chart', href: '/analytics' }
  ]}
  collapsed={isCollapsed}
  onToggle={setIsCollapsed}
/>
```

#### Grid
```tsx
import { Grid } from '@aibos/ui-components';

<Grid
  columns={{ sm: 1, md: 2, lg: 3 }}
  gap={4}
  items={data}
  renderItem={(item) => <Card>{item.content}</Card>}
/>
```

### Data Components

#### DataTable
```tsx
import { DataTable } from '@aibos/ui-components';

<DataTable
  data={users}
  columns={[
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', filterable: true }
  ]}
  sortable
  filterable
  selectable
  pagination
  virtualization
/>
```

### AI Components

#### ChatInterface
```tsx
import { ChatInterface } from '@aibos/ui-components';

<ChatInterface
  messages={chatMessages}
  onSendMessage={handleSendMessage}
  onRetryMessage={handleRetry}
  onDeleteMessage={handleDelete}
  loading={isLoading}
  userAvatar="/user-avatar.jpg"
  assistantAvatar="/ai-avatar.jpg"
  enableMarkdown
  maxMessages={100}
/>
```

#### AIStatus
```tsx
import { AIStatus } from '@aibos/ui-components';

<AIStatus
  models={aiModels}
  showDetails
  showPerformance
  showCompliance
  showUsage
  onModelClick={handleModelClick}
  onRefresh={refreshModels}
  refreshInterval={30000}
/>
```

## 🔧 Configuration

### Enterprise Provider Setup

```tsx
import { EnterpriseProvider } from '@aibos/ui-components';

<EnterpriseProvider
  config={{
    compliance: {
      gdpr: true,
      soc2: true,
      hipaa: true,
      iso27001: true
    },
    performance: {
      virtualization: true,
      memoization: true,
      lazyLoading: true
    },
    audit: {
      enabled: true,
      endpoint: '/api/audit'
    }
  }}
>
  <App />
</EnterpriseProvider>
```

### Compliance HOCs

```tsx
import { withCompliance, withGDPR, withSOC2, withHIPAA } from '@aibos/ui-components';

const CompliantComponent = withCompliance(MyComponent);
const GDPRComponent = withGDPR(MyComponent);
const SOC2Component = withSOC2(MyComponent);
const HIPAAComponent = withHIPAA(MyComponent);
```

### Performance HOCs

```tsx
import { withPerformance, withVirtualization, withMemoization } from '@aibos/ui-components';

const OptimizedComponent = withPerformance(MyComponent);
const VirtualizedComponent = withVirtualization(MyComponent);
const MemoizedComponent = withMemoization(MyComponent);
```

## 🎨 Theming

### Custom Variants

```tsx
import { cva } from 'class-variance-authority';

const customButtonVariants = cva(
  'px-4 py-2 rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
      },
      size: {
        sm: 'px-3 py-1 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);
```

### CSS Custom Properties

```css
:root {
  --aibos-primary: #3b82f6;
  --aibos-secondary: #6b7280;
  --aibos-success: #10b981;
  --aibos-warning: #f59e0b;
  --aibos-error: #ef4444;
}
```

## 🔒 Security & Compliance

### Audit Logging

All components automatically log user interactions for compliance:

```tsx
// Automatic audit logging
auditLog('button_click', {
  component: 'Button',
  variant: 'primary',
  timestamp: new Date().toISOString(),
  userId: 'user123',
  sessionId: 'session456'
});
```

### Data Classification

```tsx
import { DataClassification } from '@aibos/ui-components';

<Input
  label="SSN"
  dataClassification={DataClassification.RESTRICTED}
  encryption="AES-256"
  auditTrail={true}
/>
```

### Role-Based Access

```tsx
import { withRoleAccess } from '@aibos/ui-components';

const AdminOnlyComponent = withRoleAccess(MyComponent, {
  requiredRoles: ['admin'],
  fallback: <AccessDenied />
});
```

## 📊 Performance Monitoring

### Performance Metrics

```tsx
import { usePerformance } from '@aibos/ui-components';

function MyComponent() {
  const { measure, report } = usePerformance();
  
  const handleClick = () => {
    const start = performance.now();
    // ... operation
    const duration = performance.now() - start;
    report('operation_duration', duration);
  };
}
```

### Virtualization

```tsx
import { withVirtualization } from '@aibos/ui-components';

const VirtualizedList = withVirtualization(MyList, {
  itemHeight: 50,
  overscan: 5,
  threshold: 1000
});
```

## 🧪 Testing

### Component Testing

```tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@aibos/ui-components';

test('Button renders correctly', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole('button')).toBeInTheDocument();
});
```

### Compliance Testing

```tsx
import { testCompliance } from '@aibos/ui-components/testing';

test('Component meets GDPR requirements', () => {
  testCompliance(MyComponent, {
    gdpr: true,
    dataRetention: '30days',
    userConsent: true
  });
});
```

## 📚 Examples

### Complete Dashboard

```tsx
import {
  EnterpriseProvider,
  Header,
  Sidebar,
  Grid,
  Card,
  DataTable,
  AIStatus,
  ChatInterface
} from '@aibos/ui-components';

function Dashboard() {
  return (
    <EnterpriseProvider>
      <div className="min-h-screen bg-gray-50">
        <Header
          title="AI-BOS Dashboard"
          navigation={navigation}
          user={currentUser}
        />
        
        <div className="flex">
          <Sidebar items={sidebarItems} />
          
          <main className="flex-1 p-6">
            <Grid columns={{ md: 2, lg: 3 }} gap={6}>
              <Card>
                <CardHeader>
                  <h3>AI Model Performance</h3>
                </CardHeader>
                <CardContent>
                  <AIStatus models={aiModels} />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <h3>Recent Activity</h3>
                </CardHeader>
                <CardContent>
                  <DataTable data={activities} columns={activityColumns} />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <h3>AI Assistant</h3>
                </CardHeader>
                <CardContent>
                  <ChatInterface
                    messages={chatMessages}
                    onSendMessage={handleSendMessage}
                  />
                </CardContent>
              </Card>
            </Grid>
          </main>
        </div>
      </div>
    </EnterpriseProvider>
  );
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- Documentation: [docs.aibos.com](https://docs.aibos.com)
- Issues: [GitHub Issues](https://github.com/aibos/ui-components/issues)
- Discord: [AI-BOS Community](https://discord.gg/aibos)

---

**Built with ❤️ by the AI-BOS Team** 
