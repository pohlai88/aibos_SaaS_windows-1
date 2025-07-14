# AI-BOS Technical Architecture

## Overview
AI-BOS is a meta-platform that acts as the "Windows OS for SaaS" - providing a unified shell, runtime environment, and data model where micro-apps can plug in seamlessly and communicate automatically.

## Tech Stack
- **Frontend**: Next.js + React + TypeScript → Vercel
- **Backend**: Node.js + TypeScript → Railway
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Event Bus**: Custom implementation
- **AI Integration**: OpenAI API for app generation

## 1. Frontend Architecture (SaaS Shell)

### Directory Structure
```
src/
├── components/
│   ├── shell/
│   │   ├── Dock.tsx              # App launcher
│   │   ├── WindowManager.tsx     # Draggable windows
│   │   ├── TopBar.tsx            # Global controls
│   │   ├── Spotlight.tsx         # Universal search
│   │   └── NotificationCenter.tsx
│   ├── windows/
│   │   ├── AppWindow.tsx         # Base window component
│   │   ├── WindowControls.tsx    # Minimize/maximize/close
│   │   └── WindowResizer.tsx     # Resize handles
│   └── shared/
│       ├── Button.tsx
│       ├── Modal.tsx
│       └── LoadingSpinner.tsx
├── hooks/
│   ├── useAibosSDK.ts            # Main SDK hook
│   ├── useEventBus.ts            # Event subscription
│   ├── useWindowManager.ts       # Window state
│   └── useAuth.ts                # Authentication
├── store/
│   ├── appStore.ts               # Installed apps
│   ├── windowStore.ts            # Window positions/states
│   └── userStore.ts              # User/tenant context
├── pages/
│   ├── _app.tsx                  # Shell wrapper
│   ├── index.tsx                 # Dashboard
│   ├── apps/
│   │   ├── [appId]/
│   │   │   └── index.tsx         # Dynamic app loading
│   │   └── marketplace.tsx       # App discovery
│   └── admin/
│       ├── manifests.tsx         # Manifest management
│       └── users.tsx             # User management
└── utils/
    ├── sdk.ts                    # AI-BOS SDK
    ├── eventBus.ts               # Event handling
    └── windowUtils.ts            # Window positioning
```

### Key Components

#### 1. AI-BOS SDK (Client-side)
```typescript
// utils/sdk.ts
class AibosSDK {
  // Event handling
  emitEvent(eventName: string, payload: any): Promise<void>
  listenEvent(eventName: string, handler: Function): void
  removeListener(eventName: string, handler: Function): void
  
  // Data access
  db: {
    insert(entity: string, data: any): Promise<any>
    update(entity: string, id: string, data: any): Promise<any>
    delete(entity: string, id: string): Promise<void>
    query(entity: string, filters?: any): Promise<any[]>
  }
  
  // App management
  getInstalledApps(): Promise<App[]>
  installApp(manifestId: string): Promise<void>
  uninstallApp(appId: string): Promise<void>
  
  // UI controls
  openWindow(appId: string, params?: any): void
  closeWindow(windowId: string): void
  showNotification(message: string, type: 'info' | 'success' | 'error'): void
}
```

#### 2. Window Manager
```typescript
// components/shell/WindowManager.tsx
interface WindowState {
  id: string
  appId: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  isMinimized: boolean
  isMaximized: boolean
  zIndex: number
}

const WindowManager: React.FC = () => {
  const { windows, activeWindow, openWindow, closeWindow } = useWindowManager()
  
  return (
    <div className="window-manager">
      {windows.map(window => (
        <AppWindow
          key={window.id}
          window={window}
          onClose={() => closeWindow(window.id)}
          onFocus={() => setActiveWindow(window.id)}
        />
      ))}
    </div>
  )
}
```

#### 3. Dynamic App Loading
```typescript
// pages/apps/[appId]/index.tsx
const AppPage: React.FC = () => {
  const { appId } = useRouter()
  const { getAppManifest, loadAppComponent } = useAibosSDK()
  const [AppComponent, setAppComponent] = useState<React.ComponentType | null>(null)
  
  useEffect(() => {
    const loadApp = async () => {
      const manifest = await getAppManifest(appId)
      const Component = await loadAppComponent(manifest)
      setAppComponent(Component)
    }
    loadApp()
  }, [appId])
  
  if (!AppComponent) return <LoadingSpinner />
  
  return <AppComponent />
}
```

## 2. Backend Architecture (Platform Runtime)

### Directory Structure
```
backend/
├── src/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── manifests.ts      # Manifest CRUD
│   │   │   ├── apps.ts           # App installation
│   │   │   ├── events.ts         # Event bus
│   │   │   ├── entities.ts       # Data access
│   │   │   └── auth.ts           # Authentication
│   │   ├── middleware/
│   │   │   ├── auth.ts           # JWT validation
│   │   │   ├── tenant.ts         # Tenant isolation
│   │   │   └── rateLimit.ts      # Rate limiting
│   │   └── validators/
│   │       ├── manifest.ts       # Manifest validation
│   │       └── events.ts         # Event schema validation
│   ├── services/
│   │   ├── manifestEngine.ts     # Manifest processing
│   │   ├── eventBus.ts           # Event routing
│   │   ├── appDeployer.ts        # App deployment
│   │   ├── aiGenerator.ts        # AI app generation
│   │   └── compliance.ts         # Compliance checking
│   ├── models/
│   │   ├── Manifest.ts           # Manifest model
│   │   ├── App.ts                # App model
│   │   ├── Event.ts              # Event model
│   │   └── Entity.ts             # Entity model
│   ├── utils/
│   │   ├── supabase.ts           # Database client
│   │   ├── openai.ts             # AI client
│   │   └── security.ts           # Security utilities
│   └── types/
│       ├── manifest.ts           # Manifest types
│       ├── events.ts             # Event types
│       └── entities.ts           # Entity types
├── tests/
└── package.json
```

### Key Services

#### 1. Manifest Engine
```typescript
// services/manifestEngine.ts
class ManifestEngine {
  async validateManifest(manifest: Manifest): Promise<ValidationResult> {
    // Check entity definitions
    // Validate event schemas
    // Verify permissions
    // Check compliance rules
  }
  
  async installApp(manifest: Manifest, tenantId: string): Promise<App> {
    // Validate manifest
    // Create app record
    // Set up event subscriptions
    // Initialize app data
  }
  
  async generateManifest(prompt: string): Promise<Manifest> {
    // Use AI to generate manifest from natural language
    // Validate generated manifest
    // Return structured manifest
  }
}
```

#### 2. Event Bus
```typescript
// services/eventBus.ts
class EventBus {
  private subscriptions: Map<string, Subscription[]> = new Map()
  
  async emitEvent(tenantId: string, eventName: string, payload: any): Promise<void> {
    // Log event
    // Find subscribers
    // Route to listening apps
    // Handle errors
  }
  
  async subscribe(tenantId: string, appId: string, eventName: string): Promise<void> {
    // Register subscription
    // Validate event exists
    // Set up routing
  }
  
  async unsubscribe(tenantId: string, appId: string, eventName: string): Promise<void> {
    // Remove subscription
    // Clean up routing
  }
}
```

#### 3. AI Generator
```typescript
// services/aiGenerator.ts
class AIGenerator {
  async generateApp(prompt: string, tenantId: string): Promise<Manifest> {
    // Parse user requirements
    // Generate manifest structure
    // Create entity definitions
    // Define events
    // Validate compliance
    // Return complete manifest
  }
  
  async generateUI(manifest: Manifest): Promise<UIComponents> {
    // Generate React components
    // Create forms
    // Build navigation
    // Style components
  }
}
```

### API Endpoints

#### Manifest Management
```typescript
// POST /api/manifests
{
  "manifest_name": "Receipt Emailer",
  "description": "Add email receipt button to POS",
  "entities": [
    {
      "name": "Receipt",
      "fields": [
        { "name": "id", "type": "uuid", "primary": true },
        { "name": "amount", "type": "decimal" },
        { "name": "customer_email", "type": "string", "pii": true }
      ]
    }
  ],
  "events": [
    {
      "name": "ReceiptCreated",
      "payload_schema": {
        "receiptId": "string",
        "amount": "number",
        "customerEmail": "string"
      }
    }
  ],
  "ui_components": [
    {
      "name": "EmailButton",
      "type": "button",
      "triggers": ["ReceiptCreated"]
    }
  ]
}
```

#### Event Management
```typescript
// POST /api/events/emit
{
  "tenant_id": "uuid",
  "event_name": "JournalPosted",
  "payload": {
    "journalId": "abc123",
    "amount": 5000,
    "currency": "MYR"
  }
}

// POST /api/events/subscribe
{
  "tenant_id": "uuid",
  "app_id": "tax-app",
  "event_name": "JournalPosted",
  "handler_url": "/api/tax/calculate"
}
```

## 3. Database Schema (Supabase)

### Core Tables

#### 1. Tenants
```sql
CREATE TABLE tenants (
  tenant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  settings JSONB DEFAULT '{}'
);
```

#### 2. Users
```sql
CREATE TABLE users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  tenant_id UUID REFERENCES tenants(tenant_id),
  email TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user',
  permissions JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. Manifests
```sql
CREATE TABLE manifests (
  manifest_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manifest_name TEXT NOT NULL,
  description TEXT,
  manifest_json JSONB NOT NULL,
  version TEXT DEFAULT '1.0.0',
  status TEXT DEFAULT 'draft',
  created_by UUID REFERENCES users(user_id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 4. Apps
```sql
CREATE TABLE apps (
  app_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manifest_id UUID REFERENCES manifests(manifest_id),
  tenant_id UUID REFERENCES tenants(tenant_id),
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  status TEXT DEFAULT 'installed',
  settings JSONB DEFAULT '{}',
  installed_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 5. Entities
```sql
CREATE TABLE entities (
  entity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  manifest_id UUID REFERENCES manifests(manifest_id),
  tenant_id UUID REFERENCES tenants(tenant_id),
  schema_json JSONB NOT NULL,
  tags JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, name)
);
```

#### 6. Events
```sql
CREATE TABLE events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(tenant_id),
  app_id UUID REFERENCES apps(app_id),
  event_name TEXT NOT NULL,
  payload JSONB,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 7. Event Subscriptions
```sql
CREATE TABLE event_subscriptions (
  subscription_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(tenant_id),
  app_id UUID REFERENCES apps(app_id),
  event_name TEXT NOT NULL,
  handler_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 8. Audit Logs
```sql
CREATE TABLE audit_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(tenant_id),
  user_id UUID REFERENCES users(user_id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Row Level Security (RLS)
```sql
-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE manifests ENABLE ROW LEVEL SECURITY;
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Example RLS policy for apps
CREATE POLICY "Users can view their tenant's apps" ON apps
  FOR SELECT USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

## 4. Example: Accounting + Tax Integration

### Accounting App Manifest
```json
{
  "app_name": "Accounting",
  "version": "1.0.0",
  "entities": [
    {
      "name": "ChartOfAccounts",
      "fields": [
        {"name": "id", "type": "uuid", "primary": true},
        {"name": "code", "type": "string"},
        {"name": "name", "type": "string"},
        {"name": "type", "type": "string"},
        {"name": "tax_code", "type": "string"}
      ]
    },
    {
      "name": "JournalEntry",
      "fields": [
        {"name": "id", "type": "uuid", "primary": true},
        {"name": "date", "type": "date"},
        {"name": "description", "type": "string"},
        {"name": "lines", "type": "jsonb"}
      ]
    }
  ],
  "events": [
    {
      "name": "JournalPosted",
      "payload_schema": {
        "journalId": "string",
        "amount": "number",
        "currency": "string",
        "accountCodes": "string[]"
      }
    }
  ],
  "ui_routes": [
    "/accounting/chart-of-accounts",
    "/accounting/journals",
    "/accounting/reports"
  ]
}
```

### Tax App Manifest
```json
{
  "app_name": "Tax",
  "version": "1.0.0",
  "entities": [
    {
      "name": "TaxCalculation",
      "fields": [
        {"name": "id", "type": "uuid", "primary": true},
        {"name": "journal_id", "type": "uuid"},
        {"name": "tax_amount", "type": "decimal"},
        {"name": "tax_type", "type": "string"}
      ]
    }
  ],
  "event_subscriptions": [
    {
      "event_name": "JournalPosted",
      "handler": "calculateTax"
    }
  ],
  "ui_routes": [
    "/tax/calculations",
    "/tax/reports"
  ]
}
```

### How They Talk Automatically

1. **User posts journal entry in Accounting app**
2. **Accounting emits event:**
   ```typescript
   sdk.emitEvent("JournalPosted", {
     journalId: "abc123",
     amount: 5000,
     currency: "MYR",
     accountCodes: ["4000", "5000"]
   });
   ```

3. **AI-BOS Event Bus routes to Tax app**
4. **Tax app automatically calculates:**
   ```typescript
   sdk.listenEvent("JournalPosted", async (payload) => {
     const taxAmount = calculateTax(payload.amount, payload.accountCodes);
     await sdk.db.insert("TaxCalculation", {
       journal_id: payload.journalId,
       tax_amount: taxAmount,
       tax_type: "GST"
     });
   });
   ```

5. **Tax app writes back to shared entities**
6. **Both apps see unified data automatically**

## 5. Micro-Developer Flow

### Maria's Receipt Emailer Request
1. **Maria types:** "Add email receipt button to my POS"
2. **AI generates manifest:**
   ```json
   {
     "app_name": "ReceiptEmailer",
     "entities": [
       {
         "name": "Receipt",
         "fields": [
           {"name": "id", "type": "uuid"},
           {"name": "amount", "type": "decimal"},
           {"name": "customer_email", "type": "string", "pii": true}
         ]
       }
     ],
     "events": [
       {
         "name": "ReceiptCreated",
         "payload_schema": {
           "receiptId": "string",
           "amount": "number",
           "customerEmail": "string"
         }
       }
     ],
     "ui_components": [
       {
         "name": "EmailButton",
         "type": "button",
         "triggers": ["ReceiptCreated"],
         "action": "sendEmail"
       }
     ]
   }
   ```

3. **Platform validates and installs**
4. **Button appears in Maria's POS automatically**

## 6. Deployment Architecture

### Production Setup
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Vercel)      │◄──►│   (Railway)     │◄──►│  (Supabase)     │
│                 │    │                 │    │                 │
│ • Next.js App   │    │ • Node.js API   │    │ • PostgreSQL    │
│ • Static Assets │    │ • Event Bus     │    │ • Auth          │
│ • CDN           │    │ • Manifest Eng. │    │ • Storage       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Environment Variables
```bash
# Frontend (Vercel)
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Backend (Railway)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-key
JWT_SECRET=your-jwt-secret
```

## 7. Security & Compliance

### Multi-Tenant Isolation
- Row Level Security (RLS) on all tables
- Tenant ID in every request
- Separate API keys per tenant

### Data Protection
- PII tagging in entity schemas
- Automatic encryption for sensitive fields
- GDPR/PDPA compliance built-in

### App Security
- Immutable runtime environment
- Manifest validation
- No direct database access
- Rate limiting per tenant

## 8. Scaling Considerations

### Horizontal Scaling
- Stateless backend services
- Database connection pooling
- CDN for static assets
- Event bus can scale independently

### Performance
- Database indexing on tenant_id
- Caching for manifests
- Lazy loading of app components
- Background processing for heavy tasks

This architecture provides the foundation for AI-BOS as a scalable, secure, and user-friendly meta-platform where micro-developers can safely build and deploy apps that communicate seamlessly. 