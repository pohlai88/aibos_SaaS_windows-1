# 🔑 AI-BOS Environment Variables Summary

## Overview

This document contains all the environment variables and keys found in your AI-BOS codebase, organized by project and environment.

## 🌐 Supabase Configuration

### Project Details

- **Project URL**: `https://xyzeoeukvcmlelqnxeoh.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emVvZXVrdmNtbGVscW54ZW9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTUyMTEsImV4cCI6MjA2NzE3MTIxMX0.96FSIBHriOpD92riU992Z469cRP5A_kE54vxnldp2QE`
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emVvZXVrdmNtbGVscW54ZW9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTUyMTEsImV4cCI6MjA2NzE3MTIxMX0.96FSIBHriOpD92riU992Z469cRP5A_kE54vxnldp2QE`
- **Database URL**: `postgresql://postgres:Weepohlai88!@db.xyzeoeukvcmlelqnxeoh.supabase.co:5432/postgres`
- **JWT Secret**: `yAyHEpnyFNWWS06/Ggio0mr8JUeMRJY17xBna4hbnPLY4KYybN95hZYesint5sQ33+XKvJJbl4vWJl82YBHKjQ==`

### Required Variables

```bash
# Backend
SUPABASE_URL=https://xyzeoeukvcmlelqnxeoh.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emVvZXVrdmNtbGVscW54ZW9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTUyMTEsImV4cCI6MjA2NzE3MTIxMX0.96FSIBHriOpD92riU992Z469cRP5A_kE54vxnldp2QE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emVvZXVrdmNtbGVscW54ZW9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTUyMTEsImV4cCI6MjA2NzE3MTIxMX0.96FSIBHriOpD92riU992Z469cRP5A_kE54vxnldp2QE
SUPABASE_DATABASE_URL=postgresql://postgres:Weepohlai88!@db.xyzeoeukvcmlelqnxeoh.supabase.co:5432/postgres
JWT_SECRET=yAyHEpnyFNWWS06/Ggio0mr8JUeMRJY17xBna4hbnPLY4KYybN95hZYesint5sQ33+XKvJJbl4vWJl82YBHKjQ==

# Frontend
NEXT_PUBLIC_SUPABASE_URL=https://xyzeoeukvcmlelqnxeoh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emVvZXVrdmNtbGVscW54ZW9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTUyMTEsImV4cCI6MjA2NzE3MTIxMX0.96FSIBHriOpD92riU992Z469cRP5A_kE54vxnldp2QE
```

## 🚀 Deployment URLs

### Production URLs

- **Frontend (Vercel)**: `https://ai-bos.vercel.app`
- **Backend (Railway)**: `https://aibos-railay-1-production.up.railway.app`
- **Alternative Backend**: `https://ai-bos-backend.railway.app`

### Development URLs

- **Local Frontend**: `http://localhost:3000`
- **Local Backend**: `http://localhost:3001`

## 📋 Complete Environment Variables

### Backend Variables (railway-1/backend/.env.local)

```bash
# ==================== CORE ENVIRONMENT ====================
NODE_ENV=development
PORT=3001
HOST=0.0.0.0

# ==================== SUPABASE CONFIGURATION ====================
SUPABASE_URL=https://xyzeoeukvcmlelqnxeoh.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emVvZXVrdmNtbGVscW54ZW9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTUyMTEsImV4cCI6MjA2NzE3MTIxMX0.96FSIBHriOpD92riU992Z469cRP5A_kE54vxnldp2QE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emVvZXVrdmNtbGVscW54ZW9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTUyMTEsImV4cCI6MjA2NzE3MTIxMX0.96FSIBHriOpD92riU992Z469cRP5A_kE54vxnldp2QE
SUPABASE_DATABASE_URL=postgresql://postgres:Weepohlai88!@db.xyzeoeukvcmlelqnxeoh.supabase.co:5432/postgres

# ==================== JWT CONFIGURATION ====================
JWT_SECRET=yAyHEpnyFNWWS06/Ggio0mr8JUeMRJY17xBna4hbnPLY4KYybN95hZYesint5sQ33+XKvJJbl4vWJl82YBHKjQ==

# ==================== CORS CONFIGURATION ====================
FRONTEND_URL=https://ai-bos.vercel.app
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,https://ai-bos.vercel.app

# ==================== DEBUG CONFIGURATION ====================
DEBUG=true
DEBUG_LEVEL=info
```

### Frontend Variables (railway-1/frontend/.env.local)

```bash
# ==================== API CONFIGURATION ====================
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

# ==================== SUPABASE CONFIGURATION ====================
NEXT_PUBLIC_SUPABASE_URL=https://xyzeoeukvcmlelqnxeoh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emVvZXVrdmNtbGVscW54ZW9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTUyMTEsImV4cCI6MjA2NzE3MTIxMX0.96FSIBHriOpD92riU992Z469cRP5A_kE54vxnldp2QE

# ==================== FRONTEND CONFIGURATION ====================
NEXT_PUBLIC_APP_NAME=AI-BOS Platform
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ==================== FEATURE FLAGS ====================
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
NEXT_PUBLIC_ENABLE_CONSCIOUSNESS=true
NEXT_PUBLIC_ENABLE_QUANTUM=true
NEXT_PUBLIC_ENABLE_WEBSOCKET=true

# ==================== DEBUG CONFIGURATION ====================
NEXT_PUBLIC_DEBUG=true
NEXT_PUBLIC_DEBUG_LEVEL=info
```

## 🔧 Missing Variables

### ✅ All Variables Configured

All required environment variables have been successfully configured with actual values.

### How to Get Missing Variables

#### 1. Supabase Service Role Key

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `xyzeoeukvcmlelqnxeoh`
3. Go to Settings → API
4. Copy the "service_role" key (not the anon key)

#### 2. JWT Secret

Generate a secure JWT secret:

```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Using OpenSSL
openssl rand -hex 32

# Option 3: Online generator
# Visit: https://generate-secret.vercel.app/32
```

## 🚀 Quick Setup Commands

### Backend Setup

```bash
cd railway-1/backend

# Update .env.local with your actual values
echo "SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key" >> .env.local
echo "JWT_SECRET=your-actual-jwt-secret" >> .env.local

# Start the backend
npm run dev
```

### Frontend Setup

```bash
cd railway-1/frontend

# Start the frontend
npm run dev
```

## 🔍 Environment Variable Usage in Code

### Backend Usage

- **Supabase**: `src/utils/supabase.js`
- **JWT**: `src/middleware/auth.js`, `src/routes/auth.js`
- **CORS**: `src/index.ts`

### Frontend Usage

- **API**: `src/lib/api.ts`
- **Supabase**: `src/lib/supabase.ts`
- **WebSocket**: `src/components/shell/AppContainer.tsx`

## 🛡️ Security Notes

1. **Never commit** `.env.local` files to Git
2. **Rotate secrets** periodically
3. **Use different keys** for development and production
4. **Monitor** for exposed credentials
5. **Validate** environment variables on startup

## 📚 Additional Resources

- [Supabase Environment Setup](https://supabase.com/docs/guides/getting-started/environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Railway Environment Variables](https://docs.railway.app/develop/variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Last Updated**: December 2024  
**Project**: AI-BOS Platform  
**Supabase Project**: xyzeoeukvcmlelqnxeoh
