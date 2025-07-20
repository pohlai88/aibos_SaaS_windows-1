# 🔧 AI-BOS SDK Reference Guide

## **Quick SDK Overview**

```
@aibos/auth-sdk          - Authentication, permissions, RBAC
@aibos/core-types        - Shared TypeScript interfaces
@aibos/database          - Database schemas and types
@aibos/ledger-sdk        - Financial/accounting services
@aibos/module-registry   - Module lifecycle management
@aibos/ui-components     - Shared UI components
@aibos/[module]-sdk      - Module-specific SDKs
```

---

# 🔐 **@aibos/auth-sdk**

## **Core Services**

### **AuthService**
```typescript
import { AuthService } from '@aibos/auth-sdk';

const authService = new AuthService({
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_KEY
});

// Authentication methods
await authService.signUp(email, password, userData);
await authService.signIn(email, password);
await authService.signOut();
await authService.getSession();
await authService.getUser();
await authService.resetPassword(email);
await authService.changePassword(currentPassword, newPassword);
```

### **PermissionService**
```typescript
import { PermissionService } from '@aibos/auth-sdk';

const permissionService = new PermissionService();

// Check permissions
const hasPermission = await permissionService.checkPermission(
  userId, 
  'module:action', 
  organizationId
);

// Get user roles
const roles = await permissionService.getUserRoles(userId, organizationId);

// Assign role
await permissionService.assignRole(userId, organizationId, role);
```

### **OrganizationService**
```typescript
import { OrganizationService } from '@aibos/auth-sdk';

const orgService = new OrganizationService();

// Organization management
const org = await orgService.createOrganization(orgData);
const orgs = await orgService.getUserOrganizations(userId);
await orgService.addUserToOrganization(userId, orgId, role);
```

---

# 📊 **@aibos/core-types**

## **Shared Interfaces**

### **Base Types**
```typescript
import { 
  BaseEntity, 
  OrganizationEntity, 
  UserEntity,
  AuditEntity 
} from '@aibos/core-types';

// Base entity with common fields
interface BaseEntity {
  id: string;
  organizationId: string;
  metadata?: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

// Organization entity
interface OrganizationEntity extends BaseEntity {
  name: string;
  legalName?: string;
  taxId?: string;
  baseCurrency: string;
  timezone: string;
  address?: Address;
  contactInfo?: ContactInfo;
  settings?: Record<string, any>;
}

// User entity
interface UserEntity extends BaseEntity {
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  phone?: string;
  emailVerified: boolean;
  lastLogin?: Date;
}
```

### **Module Types**
```typescript
import { 
  ModuleMetadata, 
  ModuleCategory, 
  ModuleStatus,
  InstallationStatus 
} from '@aibos/core-types';

enum ModuleCategory {
  ACCOUNTING = 'accounting',
  CRM = 'crm',
  HR = 'hr',
  WORKFLOW = 'workflow',
  PROCUREMENT = 'procurement',
  TAX = 'tax',
  REPORTING = 'reporting',
  INTEGRATION = 'integration',
  UTILITY = 'utility',
  CUSTOM = 'custom'
}

enum ModuleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  DEPRECATED = 'deprecated',
  SUSPENDED = 'suspended'
}
```

---

# 🗄️ **@aibos/database**

## **Database Schemas & Types**

### **Core Tables**
```typescript
import { 
  DatabaseService,
  Organization,
  User,
  OrganizationUser,
  AuditLog
} from '@aibos/database';

// Database service
const db = new DatabaseService();

// Core entities
interface Organization {
  id: string;
  parentOrgId?: string;
  name: string;
  legalName?: string;
  taxId?: string;
  registrationNumber?: string;
  fiscalYearStart: Date;
  baseCurrency: string;
  timezone: string;
  address?: any;
  contactInfo?: any;
  settings?: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  phone?: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface OrganizationUser {
  id: string;
  organizationId: string;
  userId: string;
  role: string; // owner, admin, accountant, user, viewer
  permissions?: any;
  isActive: boolean;
  joinedAt: Date;
  createdAt: Date;
}
```

### **Audit System**
```typescript
interface AuditLog {
  id: string;
  organizationId: string;
  userId: string;
  tableName: string;
  recordId: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}
```

---

# 💰 **@aibos/ledger-sdk**

## **Financial Services**

### **Chart of Accounts**
```typescript
import { ChartOfAccountsService } from '@aibos/ledger-sdk';

const coaService = new ChartOfAccountsService();

// Account management
const account = await coaService.createAccount({
  organizationId,
  accountCode: '1000',
  accountName: 'Cash',
  accountType: 'Asset',
  normalBalance: 'Debit',
  description: 'Cash on hand and in bank'
});

const accounts = await coaService.getAccounts(organizationId);
const accountTree = await coaService.getAccountHierarchy(organizationId);
```

### **Journal Entries**
```typescript
import { JournalEntryService } from '@aibos/ledger-sdk';

const jeService = new JournalEntryService();

// Create journal entry
const entry = await jeService.createEntry({
  organizationId,
  entryNumber: 'JE-2024-001',
  entryDate: new Date(),
  reference: 'Invoice #123',
  description: 'Sale of goods',
  currency: 'USD',
  lines: [
    {
      accountId: 'cash-account-id',
      description: 'Cash received',
      debitAmount: 1000,
      creditAmount: 0
    },
    {
      accountId: 'revenue-account-id',
      description: 'Sales revenue',
      debitAmount: 0,
      creditAmount: 1000
    }
  ]
});

await jeService.postEntry(entry.id);
```

### **General Ledger**
```typescript
import { GeneralLedgerService } from '@aibos/ledger-sdk';

const glService = new GeneralLedgerService();

// Get ledger balances
const balances = await glService.getAccountBalances(
  organizationId,
  startDate,
  endDate
);

const trialBalance = await glService.getTrialBalance(organizationId, date);
const ledgerReport = await glService.generateLedgerReport(
  organizationId,
  accountId,
  startDate,
  endDate
);
```

### **Financial Reports**
```typescript
import { FinancialReportsService } from '@aibos/ledger-sdk';

const reportsService = new FinancialReportsService();

// Generate reports
const balanceSheet = await reportsService.generateBalanceSheet(
  organizationId,
  date
);

const incomeStatement = await reportsService.generateIncomeStatement(
  organizationId,
  startDate,
  endDate
);

const cashFlow = await reportsService.generateCashFlowStatement(
  organizationId,
  startDate,
  endDate
);
```

---

# 📦 **@aibos/module-registry**

## **Module Lifecycle Management**

### **ModuleRegistry**
```typescript
import { ModuleRegistry, ModuleMetadata } from '@aibos/module-registry';

const moduleRegistry = new ModuleRegistry();

// Register module
await moduleRegistry.registerModule({
  id: 'my-module',
  name: 'My Module',
  version: '1.0.0',
  description: 'A custom module',
  author: 'Developer Name',
  category: ModuleCategory.CUSTOM,
  tags: ['custom', 'business'],
  dependencies: [],
  requirements: {
    nodeVersion: '>=20.0.0',
    typescriptVersion: '>=5.3.0',
    aiBosVersion: '>=1.0.0'
  },
  permissions: {
    fileSystem: [],
    network: [],
    database: ['my_module.*'],
    api: ['/api/my-module/*']
  },
  entryPoints: {
    main: 'dist/index.js',
    types: 'dist/index.d.ts'
  },
  metadata: {},
  createdAt: new Date(),
  updatedAt: new Date(),
  downloads: 0,
  rating: 0,
  status: ModuleStatus.DRAFT
});

// Install module
const installation = await moduleRegistry.installModule(
  'my-module',
  '1.0.0',
  { config: 'value' }
);

// Uninstall module
await moduleRegistry.uninstallModule(installation.id);

// List modules
const available = moduleRegistry.getAvailableModules();
const installed = moduleRegistry.getInstalledModules();
```

### **Module Integration**
```typescript
import { moduleIntegration } from '@aibos/module-registry';

// Set up integration between modules
await moduleIntegration.setupIntegration({
  sourceModule: 'customer',
  targetModule: 'invoice',
  dataAccess: {
    read: ['customers.*'],
    write: ['invoices.*']
  },
  eventTypes: ['customer.created', 'customer.updated'],
  transformations: {
    'customer.id': 'invoice.customerId',
    'customer.name': 'invoice.customerName'
  }
});

// Migrate data for new module
await moduleIntegration.migrateDataForNewModule('invoice', ['customer']);

// Get integrated data
const data = await moduleIntegration.getIntegratedData(
  'invoice',
  'customers',
  { customerId: '123' }
);
```

---

# 🎨 **@aibos/ui-components**

## **UI Components**

### **Core Components**
```typescript
import { 
  Button, 
  Card, 
  Input, 
  Modal, 
  Table, 
  Badge,
  LoadingSpinner 
} from '@aibos/ui-components';

// Button variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="danger">Danger</Button>
<Button variant="luxury">Luxury</Button>

// Card with glass effect
<Card className="glass-panel p-6">
  <h3>Card Title</h3>
  <p>Card content</p>
</Card>

// Input with validation
<Input 
  type="text"
  placeholder="Enter text"
  error={errors.name}
  className="input-field"
/>

// Modal
<Modal 
  isOpen={isOpen}
  onClose={onClose}
  title="Modal Title"
>
  <p>Modal content</p>
</Modal>

// Table
<Table 
  data={data}
  columns={columns}
  className="luxury-table"
/>

// Badge
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="danger">Danger</Badge>
<Badge variant="info">Info</Badge>
```

### **Luxury Components**
```typescript
import { 
  LuxuryButton,
  LuxuryModal,
  LuxuryDropdown,
  LuxurySelect,
  LuxuryTabs,
  LuxuryDisclosure,
  LuxuryInput,
  GlassPanel
} from '@aibos/ui-components';

// Luxury button with neon glow
<LuxuryButton 
  variant="neon"
  className="btn-neon"
  onClick={handleClick}
>
  Luxury Action
</LuxuryButton>

// Luxury modal
<LuxuryModal 
  isOpen={isOpen}
  onClose={onClose}
  title="Luxury Modal"
  className="glass-panel"
>
  <p>Luxury modal content</p>
</LuxuryModal>

// Luxury dropdown
<LuxuryDropdown 
  options={options}
  value={value}
  onChange={onChange}
  placeholder="Select option"
/>

// Glass panel
<GlassPanel className="p-6">
  <h3>Glass Panel Content</h3>
  <p>With backdrop blur effect</p>
</GlassPanel>
```

---

# 🔄 **Event System**

## **Event Management**

### **EventSystem**
```typescript
import { EventSystem } from '@aibos/ledger-sdk';

const eventSystem = new EventSystem();

// Emit events
await eventSystem.emit('customer.created', {
  id: customer.id,
  organizationId: customer.organizationId,
  name: customer.name,
  email: customer.email,
  timestamp: new Date()
});

// Listen for events
eventSystem.on('customer.created', async (event) => {
  // Handle customer creation
  await createCustomerInInvoiceModule(event.data);
});

eventSystem.on('invoice.created', async (event) => {
  // Handle invoice creation
  await updateCustomerBalance(event.data);
});

// Event patterns
eventSystem.on('*.created', async (event) => {
  // Handle any creation event
  await auditService.logCreation(event);
});

eventSystem.on('customer.*', async (event) => {
  // Handle any customer event
  await customerService.handleEvent(event);
});
```

---

# 📊 **Metadata Registry**

## **Metadata Management**

### **MetadataRegistry**
```typescript
import { MetadataRegistry } from '@aibos/ledger-sdk';

const metadataRegistry = new MetadataRegistry();

// Register field
await metadataRegistry.registerField({
  fieldName: 'customer_email',
  domain: 'customer',
  dataType: 'string',
  description: 'Customer email address',
  validation: 'email',
  tags: ['contact', 'communication'],
  synonyms: ['email', 'contact_email']
});

// Get fields by domain
const customerFields = await metadataRegistry.getFieldsByDomain('customer');
const invoiceFields = await metadataRegistry.getFieldsByDomain('invoice');

// Suggest mapping
const mapping = await metadataRegistry.suggestMapping(
  customerFields, 
  invoiceFields
);

// Get field relationships
const relationships = await metadataRegistry.getFieldRelationships('customer_email');

// Search fields
const searchResults = await metadataRegistry.searchFields('email');
```

---

# 🛠️ **CLI Tools**

## **Command Line Interface**

### **Micro-Developer CLI**
```bash
# Initialize as micro-developer
aibos init -n "Developer Name" -e "dev@example.com" -s "fullstack"

# Create new module
aibos create-module -n "my-module" -t "custom" -d "My custom module"

# Browse marketplace
aibos browse-marketplace

# Install module
aibos install my-module

# List installed modules
aibos list-installed

# Contribute to module
aibos contribute my-module
```

### **Module Migration CLI**
```bash
# Validate migration
aibos module-migration --validate --module my-module

# Execute migration
aibos module-migration --execute --module my-module --version 2.0.0

# Rollback migration
aibos module-migration --rollback --module my-module

# Create backup
aibos module-migration --backup --module my-module
```

### **Multi-Version CLI**
```bash
# List versions
aibos multi-version --list --module my-module

# Check compatibility
aibos multi-version --check-compatibility --module my-module --version 2.0.0

# Enable side-by-side
aibos multi-version --side-by-side --module my-module --version 2.0.0

# Force upgrade
aibos multi-version --force-upgrade --module my-module --version 2.0.0
```

### **Performance Isolation CLI**
```bash
# Check isolation
aibos performance-isolation --check --module my-module

# Set resource limits
aibos performance-isolation --set-limits --module my-module --cpu 0.5 --memory 512

# Monitor performance
aibos performance-isolation --monitor --module my-module
```

### **Concurrent Users CLI**
```bash
# Monitor concurrent users
aibos concurrent-users --monitor

# Get metrics
aibos concurrent-users --metrics --period 24h

# Real-time updates
aibos concurrent-users --realtime

# Health check
aibos concurrent-users --health
```

---

# 🎯 **Common Patterns**

## **Service Pattern**
```typescript
export class MyModuleService {
  private db: DatabaseService;
  private eventSystem: EventSystem;
  private metadataRegistry: MetadataRegistry;

  constructor(
    db: DatabaseService, 
    eventSystem: EventSystem,
    metadataRegistry: MetadataRegistry
  ) {
    this.db = db;
    this.eventSystem = eventSystem;
    this.metadataRegistry = metadataRegistry;
  }

  async create(data: CreateMyModuleData): Promise<MyModule> {
    // Validate input
    const validated = createSchema.parse(data);
    
    // Check permissions
    const hasPermission = await this.checkPermission(
      data.userId, 
      'my_module:create', 
      data.organizationId
    );
    
    if (!hasPermission) {
      throw new Error('Insufficient permissions');
    }
    
    // Create in database
    const result = await this.db.createMyModule(validated);
    
    // Emit event
    await this.eventSystem.emit('my_module.created', {
      id: result.id,
      organizationId: result.organizationId,
      timestamp: new Date()
    });
    
    // Track analytics
    await this.trackAnalytics('my_module.created', {
      userId: data.userId,
      organizationId: data.organizationId
    });
    
    return result;
  }

  async update(id: string, data: UpdateMyModuleData): Promise<MyModule> {
    // Similar pattern for updates
  }

  async delete(id: string): Promise<void> {
    // Similar pattern for deletes
  }
}
```

## **API Route Pattern**
```typescript
export const myModuleRoutes = {
  'GET /api/my-module': async (req: Request, res: Response) => {
    try {
      const { organizationId, userId } = req.auth;
      const { page = 1, limit = 10, search } = req.query;
      
      const service = new MyModuleService(db, eventSystem, metadataRegistry);
      const results = await service.list({
        organizationId,
        userId,
        page: Number(page),
        limit: Number(limit),
        search: String(search || '')
      });
      
      res.json({
        success: true,
        data: results.data,
        pagination: results.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  'POST /api/my-module': async (req: Request, res: Response) => {
    try {
      const { organizationId, userId } = req.auth;
      const data = req.body;
      
      const service = new MyModuleService(db, eventSystem, metadataRegistry);
      const result = await service.create({
        ...data,
        organizationId,
        userId
      });
      
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
};
```

## **React Component Pattern**
```typescript
import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Badge, LoadingSpinner } from '@aibos/ui-components';
import { Plus, Search, Filter } from 'lucide-react';

interface MyModuleDashboardProps {
  organizationId: string;
}

export const MyModuleDashboard: React.FC<MyModuleDashboardProps> = ({ 
  organizationId 
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, [organizationId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/my-module?organizationId=${organizationId}`);
      const result = await response.json();
      setData(result.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Card className="glass-panel p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Module</h2>
        <Button className="btn-neon">
          <Plus className="w-4 h-4 mr-2" />
          Create New
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Button variant="secondary">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
            <div>
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
            <Badge variant={item.status === 'active' ? 'success' : 'warning'}>
              {item.status}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
};
```

---

# 🎉 **You're Ready to Code!**

With this SDK reference, AI coding agents can now:
- **Use all available services** with proper imports and patterns
- **Follow established conventions** for consistency
- **Integrate seamlessly** with the existing system
- **Build enterprise-grade features** with proper security and validation
- **Create luxury user experiences** with the UI component library

**Just reference the SDK and start building!** 🚀 