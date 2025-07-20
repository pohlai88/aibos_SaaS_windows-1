
# Aibos Accounting SaaS

**Enterprise-grade accounting SaaS with multi-tenant architecture, double-entry bookkeeping, and modern UI**

## 🚀 Overview

Aibos is a comprehensive accounting SaaS platform built with modern technologies, featuring:

- **Multi-tenant architecture** with proper data isolation
- **Double-entry bookkeeping** with real-time validation
- **Multi-currency support** with exchange rate management
- **Advanced reporting** with interactive charts
- **Role-based access control** (RBAC)
- **Real-time collaboration** and audit trails
- **Modern, responsive UI** with beautiful animations

## 🏗️ Architecture

### Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 14 + TypeScript | Modern React framework with App Router |
| **Styling** | Tailwind CSS + Framer Motion | Utility-first CSS with animations |
| **Backend** | Supabase | PostgreSQL + Auth + Real-time |
| **Database** | PostgreSQL | ACID-compliant relational database |
| **State Management** | TanStack Query | Server state management |
| **Forms** | React Hook Form + Zod | Type-safe form handling |
| **Charts** | Recharts | Interactive data visualization |
| **UI Components** | Custom + Lucide Icons | Consistent design system |

### Monorepo Structure

```
aibos-accounting-saas/
├── apps/
│   ├── admin-app/          # Admin dashboard (Next.js)
│   ├── user-app/           # Client-facing app (Next.js)
│   └── middleware-app/     # API gateway (Express)
├── packages/
│   ├── database/           # Database schema & types
│   ├── ledger-sdk/         # Core accounting logic
│   ├── auth-sdk/           # Authentication & authorization
│   ├── ui-components/      # Shared UI components
│   └── data-hooks/         # API integration hooks
├── infra/
│   ├── supabase/           # Database migrations
│   └── configs/            # Build configurations
└── scripts/                # Development utilities
```

## 🎯 Key Features

### Core Accounting
- ✅ **Chart of Accounts** - Hierarchical account structure
- ✅ **Journal Entries** - Double-entry with validation
- ✅ **General Ledger** - Real-time aggregated view
- ✅ **Trial Balance** - Multi-period comparison
- ✅ **Financial Reports** - Balance Sheet, Income Statement, Cash Flow

### Business Operations
- ✅ **Customer Management** - CRM with credit limits
- ✅ **Vendor Management** - Supplier tracking
- ✅ **Invoice Management** - AR with payment tracking
- ✅ **Bill Management** - AP with due date tracking
- ✅ **Payment Processing** - Multi-currency payments
- ✅ **Bank Reconciliation** - Automated matching

### Advanced Features
- ✅ **Multi-currency** - Real-time exchange rates
- ✅ **Multi-location** - Branch/office tracking
- ✅ **Project Accounting** - Job costing
- ✅ **Audit Trails** - Complete change history
- ✅ **Workflow Automation** - Approval processes
- ✅ **API Integration** - Third-party connectors

### Security & Compliance
- ✅ **Row Level Security** - Data isolation
- ✅ **Role-based Access** - Granular permissions
- ✅ **Audit Logging** - Compliance reporting
- ✅ **Data Encryption** - At rest and in transit
- ✅ **Backup & Recovery** - Automated backups

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+
- Supabase account
- PostgreSQL (via Supabase)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-org/aibos-accounting-saas.git
cd aibos-accounting-saas
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

4. **Set up database**
```bash
# Push database schema
npm run db:push

# Generate TypeScript types
npm run db:generate

# Seed initial data
npm run db:seed
```

5. **Start development servers**
```bash
# Start all applications
npm run dev

# Or start specific apps
npm run dev --workspace=admin-app
npm run dev --workspace=user-app
```

### Development Workflow

```bash
# Install dependencies
npm install

# Type checking
npm run type-check

# Linting
npm run lint

# Testing
npm run test

# Build all packages
npm run build

# Clean build artifacts
npm run clean
```

## 📊 Database Schema

### Core Tables

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `organizations` | Multi-tenant isolation | Parent-child relationships |
| `users` | User management | Email verification, profiles |
| `organization_users` | User-org relationships | Role-based permissions |
| `chart_of_accounts` | Account structure | Hierarchical, multi-currency |
| `journal_entries` | Double-entry transactions | Status tracking, validation |
| `journal_entry_lines` | Transaction lines | Debit/credit validation |
| `general_ledger` | Aggregated balances | Real-time calculations |
| `customers` | Customer management | Credit limits, payment terms |
| `vendors` | Supplier management | Payment terms, tax info |
| `invoices` | Accounts receivable | Multi-currency, status tracking |
| `bills` | Accounts payable | Due dates, approval workflow |
| `payments` | Payment processing | Multi-currency, allocations |

### Advanced Features

- **Row Level Security** - Automatic data isolation
- **Audit Logging** - Complete change history
- **Multi-currency** - Exchange rate management
- **Workflow Engine** - Approval processes
- **KPI Tracking** - Real-time metrics

## 🎨 UI Components

### Design System

- **Color Palette** - Primary, secondary, success, warning, danger
- **Typography** - Inter font family with consistent sizing
- **Spacing** - Tailwind-based spacing system
- **Animations** - Framer Motion for smooth interactions
- **Responsive** - Mobile-first design approach

### Component Library

```typescript
// Metric Cards
<MetricCard 
  title="Total Revenue"
  value="$124,563.00"
  change="+12.5%"
  changeType="positive"
  icon={DollarSign}
/>

// Data Tables
<DataTable 
  columns={columns}
  data={data}
  pagination
  sorting
  filtering
/>

// Charts
<ChartCard 
  title="Revenue vs Expenses"
  data={chartData}
  type="bar"
/>

// Forms
<FormField 
  name="email"
  label="Email Address"
  validation={emailSchema}
/>
```

## 🔐 Authentication & Authorization

### Multi-tenant Security

```typescript
// Row Level Security Policies
CREATE POLICY "Users can view their organizations" ON organizations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM organization_users 
    WHERE organization_id = organizations.id 
    AND user_id = auth.uid()
  )
);
```

### Role-based Access Control

| Role | Permissions | Description |
|------|-------------|-------------|
| **Owner** | Full access | Organization owner |
| **Admin** | Management | User and system management |
| **Accountant** | Accounting | Full accounting access |
| **User** | Limited | Basic data access |
| **Viewer** | Read-only | Report viewing only |

### Permission System

```typescript
interface Permission {
  resource: ResourceType;
  action: PermissionType;
  conditions?: Record<string, any>;
}

// Check permissions
const canEdit = checkPermission(user, 'journal_entries', 'write');
const canViewReports = checkPermission(user, 'reports', 'read');
```

## 📈 Business Intelligence

### Real-time Dashboards

- **Financial Overview** - Revenue, expenses, profit
- **Cash Flow** - Operating, investing, financing
- **Customer Analytics** - Top customers, payment trends
- **Vendor Analysis** - Spending patterns, payment history

### Advanced Reporting

- **Balance Sheet** - Assets, liabilities, equity
- **Income Statement** - Revenue, expenses, net income
- **Cash Flow Statement** - Operating, investing, financing
- **Custom Reports** - Drag-and-drop report builder

### KPI Tracking

```typescript
interface FinancialMetrics {
  totalAssets: number;
  totalLiabilities: number;
  currentRatio: number;
  quickRatio: number;
  debtToEquityRatio: number;
  returnOnAssets: number;
  returnOnEquity: number;
  grossProfitMargin: number;
  netProfitMargin: number;
}
```

## 🔄 API Integration

### RESTful Endpoints

```typescript
// Journal Entries
POST /api/journal-entries
GET /api/journal-entries
PUT /api/journal-entries/:id
DELETE /api/journal-entries/:id

// Chart of Accounts
GET /api/chart-of-accounts
POST /api/chart-of-accounts
PUT /api/chart-of-accounts/:id

// Financial Reports
GET /api/reports/balance-sheet
GET /api/reports/income-statement
GET /api/reports/cash-flow
```

### Real-time Subscriptions

```typescript
// Subscribe to journal entry changes
supabase
  .channel('journal_entries')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'journal_entries'
  }, (payload) => {
    console.log('Journal entry changed:', payload);
  })
  .subscribe();
```

## 🧪 Testing

### Test Coverage

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Testing Strategy

- **Unit Tests** - Individual functions and components
- **Integration Tests** - API endpoints and database operations
- **E2E Tests** - Complete user workflows
- **Performance Tests** - Load testing and optimization

## 🚀 Deployment

### Production Setup

1. **Supabase Production**
```bash
# Create production project
supabase projects create aibos-prod

# Deploy schema
supabase db push --project-ref your-project-ref
```

2. **Vercel Deployment**
```bash
# Deploy admin app
vercel --prod

# Deploy user app
vercel --prod
```

3. **Environment Configuration**
```env
# Production environment
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://app.aibos.com
SUPABASE_URL=https://your-project.supabase.co
```

### CI/CD Pipeline

```yaml
# GitHub Actions
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - run: npm run deploy
```

## 📚 Documentation

### API Documentation

- [REST API Reference](./docs/api.md)
- [Database Schema](./docs/schema.md)
- [Authentication Guide](./docs/auth.md)
- [Deployment Guide](./docs/deployment.md)

### User Guides

- [Getting Started](./docs/getting-started.md)
- [User Manual](./docs/user-manual.md)
- [Admin Guide](./docs/admin-guide.md)
- [Troubleshooting](./docs/troubleshooting.md)

## 🤝 Contributing

### Development Guidelines

1. **Code Style** - ESLint + Prettier configuration
2. **Type Safety** - Strict TypeScript configuration
3. **Testing** - Minimum 80% test coverage
4. **Documentation** - JSDoc comments for all functions
5. **Git Workflow** - Feature branches with PR reviews

### Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests and documentation
5. Submit a pull request
6. Code review and approval
7. Merge to main branch

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help

- **Documentation** - [docs.aibos.com](https://docs.aibos.com)
- **Community** - [community.aibos.com](https://community.aibos.com)
- **Support** - [support@aibos.com](mailto:support@aibos.com)
- **Issues** - [GitHub Issues](https://github.com/your-org/aibos-accounting-saas/issues)

### Roadmap

- [ ] **AI-powered categorization** - Smart transaction categorization
- [ ] **Advanced analytics** - Predictive insights and forecasting
- [ ] **Mobile app** - Native iOS and Android applications
- [ ] **Multi-language** - Internationalization support
- [ ] **Advanced workflows** - Custom approval processes
- [ ] **API marketplace** - Third-party integrations

---

**Built with ❤️ by the Aibos Team**

*Enterprise-grade accounting made simple* 