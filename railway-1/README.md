# AI-BOS Platform Prototype

**The Windows OS for SaaS** - A unified platform where micro-apps can plug in seamlessly and communicate automatically.

## 🚀 Quick Start

This prototype demonstrates the core AI-BOS platform with:
- **Frontend**: Next.js shell with window manager and dock
- **Backend**: Node.js API with event bus and manifest engine
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: JWT-based multi-tenant system
- **Realtime**: WebSocket-based live updates
- **Demo Apps**: Accounting, Tax Calculator, Inventory, CRM, Realtime Demo

**📖 See [STARTUP.md](./STARTUP.md) for detailed setup instructions.**

### 🗄️ Database Setup

**Supabase (Required)**
- ✅ Persistent data storage
- ✅ Multi-tenant isolation
- ✅ Real-time capabilities
- ✅ Automatic backups
- ✅ Production-ready security
- ✅ Row-level security policies

## 📁 Project Structure

```
railway-1/
├── backend/                 # Node.js API (Railway deployment)
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   └── index.js        # Main server
│   ├── package.json
│   └── railway.json
├── frontend/               # Next.js shell (Vercel deployment)
│   ├── src/
│   │   ├── app/           # Next.js app router
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilities
│   ├── package.json
│   └── vercel.json
└── README.md
```

## 🛠️ Local Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Database Setup (Required)

**Supabase Setup:**
1. Follow the [Supabase Setup Guide](./SUPABASE_SETUP.md)
2. Set environment variables in `backend/.env`
3. Run the SQL schema in Supabase

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

The backend will run on `http://localhost:3001`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:3000`

### Demo Credentials
- **Email**: admin@demo.com
- **Password**: any password

## 🚀 Deployment

### Backend to Railway

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Deploy Backend**
   ```bash
   cd backend
   railway init
   railway up
   ```

4. **Set Environment Variables**
   ```bash
   railway variables set JWT_SECRET=your-super-secret-key
   railway variables set NODE_ENV=production
   ```

### Frontend to Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy Frontend**
   ```bash
   cd frontend
   vercel
   ```

3. **Set Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_API_URL
   # Enter your Railway backend URL
   ```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Manifests
- `GET /api/manifests` - List manifests
- `POST /api/manifests` - Create manifest
- `GET /api/manifests/:id` - Get manifest
- `PUT /api/manifests/:id` - Update manifest
- `DELETE /api/manifests/:id` - Delete manifest

### Apps
- `GET /api/apps` - List apps
- `POST /api/apps/install` - Install app
- `GET /api/apps/:id` - Get app
- `PUT /api/apps/:id` - Update app
- `DELETE /api/apps/:id` - Uninstall app

### Events
- `POST /api/events/emit` - Emit event
- `POST /api/events/subscribe` - Subscribe to events
- `GET /api/events` - List events
- `GET /api/events/subscriptions` - List subscriptions

### Entities
- `GET /api/entities` - List entities
- `POST /api/entities` - Create entity
- `GET /api/entities/:name` - Get entity data
- `POST /api/entities/:name` - Create entity record
- `PUT /api/entities/:name/:id` - Update entity record
- `DELETE /api/entities/:name/:id` - Delete entity record

## 🎯 Key Features

### 1. Window Manager
- Draggable, resizable app windows
- Minimize, maximize, close controls
- Z-index management
- Active window highlighting

### 2. Dock System
- App launcher with hover effects
- Running app indicators
- Quick access to installed apps

### 3. Event Bus
- Apps communicate via events
- Automatic event routing
- Subscription management
- Real-time app integration

### 4. Multi-Tenant Architecture
- Tenant isolation
- User management per tenant
- Secure data separation

### 5. Manifest System
- App definitions via JSON manifests
- Entity and event schemas
- UI component specifications
- Version management

### 6. Realtime Communication
- WebSocket-based realtime messaging
- Tenant-isolated channels
- Database change notifications
- Live app updates
- Connection status monitoring

## 🔌 Realtime Features

### WebSocket Communication
- **Real-time messaging** between apps and users
- **Tenant isolation** - messages only sent to users in the same tenant
- **Automatic reconnection** with exponential backoff
- **Connection status monitoring**

### Database Change Notifications
- **Supabase realtime integration** - automatic notifications when data changes
- **Table-level subscriptions** for events, apps, entities, and audit logs
- **Tenant-scoped updates** - only relevant changes are sent to each tenant

### Realtime Demo App
The platform includes a **Realtime Demo** app that showcases:
- Live message broadcasting
- Database change monitoring
- App event publishing
- Connection status display
- Test message functionality

### Usage Examples

**Subscribe to database changes:**
```javascript
import { useDatabaseChanges } from '@/hooks/useRealtime';

function MyComponent() {
  useDatabaseChanges('events', (data) => {
    console.log('New event created:', data);
  });
}
```

**Publish a message:**
```javascript
import { useRealtimeSubscription } from '@/hooks/useRealtime';

function MyComponent() {
  const { publish } = useRealtimeSubscription('app', 'myapp');
  
  const sendMessage = () => {
    publish({ message: 'Hello from my app!' });
  };
}
```

**Monitor connection status:**
```javascript
import { useRealtimeConnection } from '@/hooks/useRealtime';

function MyComponent() {
  const { isConnected, status } = useRealtimeConnection();
  
  return (
    <div>
      Status: {isConnected ? 'Connected' : 'Disconnected'}
      Client ID: {status.clientId}
    </div>
  );
}
```

## 🔄 How Apps Talk Automatically

### Example: Accounting → Tax Integration

1. **User posts journal entry in Accounting app**
2. **Accounting emits event**:
   ```typescript
   sdk.emitEvent("JournalPosted", {
     journalId: "abc123",
     amount: 5000,
     currency: "MYR"
   });
   ```

3. **AI-BOS Event Bus routes to Tax app**
4. **Tax app automatically calculates**:
   ```typescript
   sdk.listenEvent("JournalPosted", async (payload) => {
     const taxAmount = calculateTax(payload.amount);
     await sdk.db.insert("TaxCalculation", {
       journal_id: payload.journalId,
       tax_amount: taxAmount
     });
   });
   ```

5. **Tax app writes back to shared entities**
6. **Both apps see unified data automatically**

## 🎨 Demo Apps

### Accounting Dashboard
- Revenue and expense tracking
- Financial metrics display
- Event emission for business actions

### Tax Calculator
- Income tax calculation
- Event listening for journal posts
- Automatic tax adjustments

### Inventory Management
- Product quantity tracking
- Stock level monitoring
- Inventory alerts

### CRM System
- Customer relationship management
- Contact information
- Customer data integration

### Realtime Demo
- Live WebSocket messaging
- Database change monitoring
- App event publishing
- Connection status display
- Test message functionality

## 🔐 Security Features

- **JWT Authentication**: Secure token-based auth
- **Multi-Tenant Isolation**: Data separation per tenant
- **CORS Protection**: Cross-origin request security
- **Input Validation**: Request sanitization
- **Error Handling**: Graceful error responses

## 📈 Next Steps

### Phase 1: Core Platform ✅
- [x] Window manager and dock
- [x] Event bus system
- [x] Multi-tenant authentication
- [x] Basic app loading

### Phase 2: Advanced Features
- [ ] AI app generator
- [ ] Manifest editor
- [ ] App marketplace
- [ ] Real-time collaboration

### Phase 3: Enterprise Features
- [ ] Supabase integration
- [ ] Advanced security
- [ ] Analytics dashboard
- [ ] Admin panel

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For questions or issues:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

---

**AI-BOS Platform** - Building the future of SaaS integration 🚀 