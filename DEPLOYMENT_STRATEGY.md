# AI-BOS Deployment Strategy

## 🏗️ **Shared Library Deployment Strategy**

### **Problem Statement**
- **Backend**: Deployed on Railway (Node.js)
- **Frontend**: Deployed on Vercel (Next.js)
- **Shared Library**: Contains common utilities, types, and business logic
- **Challenge**: How to share code between Railway and Vercel deployments?

---

## 🎯 **Recommended Solution: NPM Package Approach**

### **Option 1: Private NPM Package (Production)**

#### **Step 1: Publish Shared Library to NPM**
```bash
# In shared/ directory
cd shared
npm login
npm publish --access public
```

#### **Step 2: Update Dependencies**
```json
// railway-1/backend/package.json
{
  "dependencies": {
    "@aibos/shared": "^1.0.0"
  }
}

// railway-1/frontend/package.json
{
  "dependencies": {
    "@aibos/shared": "^1.0.0"
  }
}
```

#### **Step 3: Deploy**
```bash
# Backend (Railway)
cd railway-1/backend
npm install
railway up

# Frontend (Vercel)
cd railway-1/frontend
npm install
vercel --prod
```

---

## 🔧 **Alternative Solutions**

### **Option 2: Git Submodules (Development)**

#### **Setup Git Submodules**
```bash
# In root directory
git submodule add https://github.com/pohlai88/aibos_SaaS_windows-1.git shared
git submodule update --init --recursive
```

#### **Update Package.json**
```json
// railway-1/backend/package.json
{
  "dependencies": {
    "@aibos/shared": "file:../shared"
  }
}
```

### **Option 3: Monorepo with Workspaces**

#### **Root Package.json**
```json
{
  "name": "aibos-platform",
  "private": true,
  "workspaces": [
    "shared",
    "railway-1/backend",
    "railway-1/frontend"
  ]
}
```

---

## 🚀 **Production Deployment Workflow**

### **1. Shared Library Development**
```bash
cd shared
npm run build
npm run test
npm version patch
npm publish
```

### **2. Backend Deployment (Railway)**
```bash
cd railway-1/backend
npm install @aibos/shared@latest
npm run test
railway up
```

### **3. Frontend Deployment (Vercel)**
```bash
cd railway-1/frontend
npm install @aibos/shared@latest
npm run build
vercel --prod
```

---

## 📦 **Package Structure**

### **Shared Library Exports**
```typescript
// shared/index.ts
export * from './lib/cache';
export * from './lib/database';
export * from './lib/queue';
export * from './lib/logger';
export * from './lib/security';
export * from './lib/monitoring';
export * from './types';
export * from './utils';
export * from './validation';
```

### **Usage in Backend**
```typescript
// railway-1/backend/src/index.js
import { 
  logger, 
  security, 
  monitoring, 
  databaseManager,
  queueManager 
} from '@aibos/shared';

// Initialize shared services
logger.info('Backend starting...');
security.initialize();
monitoring.start();
```

### **Usage in Frontend**
```typescript
// railway-1/frontend/src/lib/api.ts
import { 
  apiFetcher, 
  ApiError,
  billingTypes,
  subscriptionUtils 
} from '@aibos/shared';

// Use shared utilities
export const fetchUserData = async (userId: string) => {
  return apiFetcher(`/api/users/${userId}`);
};
```

---

## 🔄 **CI/CD Pipeline Integration**

### **GitHub Actions Workflow**
```yaml
# .github/workflows/deploy.yml
name: Deploy AI-BOS Platform

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test-shared:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Test Shared Library
        run: |
          cd shared
          npm install
          npm run test
          npm run build

  publish-shared:
    needs: test-shared
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Publish Shared Library
        run: |
          cd shared
          npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

  deploy-backend:
    needs: publish-shared
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          cd railway-1/backend
          npm install
          railway up

  deploy-frontend:
    needs: publish-shared
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: |
          cd railway-1/frontend
          npm install
          vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

---

## 🛠️ **Development Workflow**

### **Local Development Setup**
```bash
# Clone repository
git clone https://github.com/pohlai88/aibos_SaaS_windows-1.git
cd aibos_SaaS_windows-1

# Install shared library dependencies
cd shared
npm install
npm run build

# Install backend dependencies
cd ../railway-1/backend
npm install

# Install frontend dependencies
cd ../railway-1/frontend
npm install

# Start development servers
# Terminal 1: Backend
cd railway-1/backend
npm run dev

# Terminal 2: Frontend
cd railway-1/frontend
npm run dev
```

### **Shared Library Development**
```bash
cd shared
npm run dev  # Watch mode for TypeScript compilation
npm run test # Run tests
npm run lint # Lint code
```

---

## 📋 **Environment Variables**

### **Backend (Railway)**
```env
# Database
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Shared Library
NODE_ENV=production
LOG_LEVEL=info
ENABLE_METRICS=true
```

### **Frontend (Vercel)**
```env
# API
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Shared Library (Client-side only)
NEXT_PUBLIC_ENABLE_LOGGING=true
```

---

## 🔍 **Monitoring & Debugging**

### **Shared Library Version Tracking**
```typescript
// Check shared library version
import { version } from '@aibos/shared/package.json';
console.log('Shared Library Version:', version);
```

### **Health Checks**
```typescript
// Backend health check
app.get('/health', (req, res) => {
  const sharedVersion = require('@aibos/shared/package.json').version;
  res.json({
    status: 'healthy',
    sharedLibrary: sharedVersion,
    timestamp: new Date().toISOString()
  });
});
```

---

## 🎯 **Recommendation**

**Use Option 1 (NPM Package)** for production because:

✅ **Version Control**: Proper semantic versioning
✅ **Dependency Management**: Clear dependency tracking
✅ **CI/CD Integration**: Automated deployment pipeline
✅ **Rollback Capability**: Easy version rollback
✅ **Team Collaboration**: Standard npm workflow
✅ **Security**: Private packages available
✅ **Performance**: Optimized builds and caching

This approach ensures **consistency**, **maintainability**, and **scalability** across your Railway and Vercel deployments. 