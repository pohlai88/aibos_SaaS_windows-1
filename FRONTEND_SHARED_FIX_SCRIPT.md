# Frontend & Shared Package Fix Script

## 🚀 **Quick Copy-Paste for New Chat**

Copy this entire section and paste it in your new chat:

---

**Hi! I need help fixing TypeScript compilation and module system issues in my frontend and shared npm packages. Here's what was fixed in the backend and I need similar fixes applied:**

## **Backend Issues That Were Fixed:**

1. **Compression import type errors** - Created type declarations
2. **ESM vs CommonJS conflicts** - Set `"type": "module"` in package.json
3. **Missing .js extensions** - Added .js extensions to ESM imports
4. **TypeScript configuration mismatch** - Updated tsconfig.json for ESM

## **Key Fixes Applied to Backend:**

```json
// package.json
{
  "type": "module",
  "ts-node": {
    "esm": true,
    "experimentalSpecifierResolution": "node"
  }
}
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
  }
}
```

```typescript
// Fixed imports
import authRouter from './routes/auth.js'; // Added .js extension
```

## **What I Need Help With:**

### **Frontend (railway-1/frontend):**

- Check for similar TypeScript compilation errors
- Fix any module system conflicts
- Ensure proper Next.js configuration
- Fix import/export issues
- Configure environment variables

### **Shared Package (shared/):**

- Update package.json exports for proper ESM/CommonJS compatibility
- Configure TypeScript for library build
- Test import/export functionality
- Ensure compatibility with both frontend and backend

## **Environment Variables to Use:**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xyzeoeukvcmlelqnxeoh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emVvZXVrdmNtbGVscW54ZW9oIiwicm9sZSI6ImFubm4iLCJpYXQiOjE3NTE1OTUyMTEsImV4cCI6MjA2NzE3MTIxMX0.96FSIBHriOpD92riU992Z469cRP5A_kE54vxnldp2QE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emVvZXVrdmNtbGVscW54ZW9oIiwicm9sZSI6ImFubm4iLCJpYXQiOjE3NTE1OTUyMTEsImV4cCI6MjA2NzE3MTIxMX0.96FSIBHriOpD92riU992Z469cRP5A_kE54vxnldp2QE
DATABASE_URL=postgresql://postgres:Weepohlai88!@db.xyzeoeukvcmlelqnxeoh.supabase.co:5432/postgres
JWT_SECRET=yAyHEpnyFNWWS06/Ggio0mr8JUeMRJY17xBna4hbnPLY4KYybN95hZYesint5sQ33+XKvJJbl4vWJl82YBHKjQ==
```

## **Common Error Patterns to Look For:**

- `Could not find a declaration file for module`
- `Unknown file extension ".ts"`
- `require() cannot be used on ESM graph`
- `Import/Export mismatches`

**Please help me apply similar fixes to the frontend and shared packages!**

---

## 📋 **Additional Context for the Assistant:**

**Project Structure:**

```
aibos_SaaS_windows-1-1/
├── railway-1/
│   ├── backend/     (✅ Fixed)
│   └── frontend/    (🔧 Needs fixing)
└── shared/          (🔧 Needs fixing)
```

**Key Files to Check:**

- `package.json` - Module type and scripts
- `tsconfig.json` - TypeScript configuration
- `src/**/*.ts` - Import/export statements
- `.env*` files - Environment configuration

**Expected Outcome:**

- TypeScript compilation without errors
- Proper module resolution
- Environment variables working
- Build process successful

---

**This script provides all the context needed for the assistant to help fix the frontend and shared package issues efficiently!**
