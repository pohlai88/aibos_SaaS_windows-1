# AI-BOS Platform Startup Guide

This guide will help you get the AI-BOS platform running with Supabase integration.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Railway account (for backend deployment)
- Vercel account (for frontend deployment)

### 1. Supabase Setup (Required)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project: `aibos-platform`
   - Note your project URL and service role key

2. **Run Database Schema**
   - Copy content from `supabase-schema.sql`
   - Paste in Supabase SQL Editor
   - Click "Run" to create tables and policies

3. **Get Credentials**
   - Project URL: `https://your-project.supabase.co`
   - Service Role Key: `eyJ...` (from Settings → API)

### 2. Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your Supabase credentials:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   ```

3. **Validate Environment**
   ```bash
   npm run validate
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

### 3. Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

### 4. Test the Platform

1. **Open Frontend**: http://localhost:3000
2. **Register Account**: Use any email/password
3. **Login**: Access the AI-BOS shell
4. **Test Apps**: Try the demo apps in the dock
5. **Test Realtime**: Open the Realtime Demo app

## 🚀 Production Deployment

### Backend to Railway

1. **Deploy Backend**
   ```bash
   cd backend
   railway login
   railway init
   railway up
   ```

2. **Set Environment Variables**
   ```bash
   railway variables set SUPABASE_URL=https://your-project.supabase.co
   railway variables set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   railway variables set JWT_SECRET=your-super-secret-jwt-key
   ```

### Frontend to Vercel

1. **Deploy Frontend**
   ```bash
   cd frontend
   vercel
   ```

2. **Set Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_API_URL
   # Enter your Railway backend URL
   ```

## 🔧 Troubleshooting

### Common Issues

**"Missing required environment variables"**
- Check that all required variables are set
- Run `npm run validate` to verify

**"Invalid SUPABASE_URL format"**
- Ensure URL starts with `https://`
- Must contain `.supabase.co`

**"JWT_SECRET too short"**
- Use at least 32 characters
- Generate a secure random string

**Database connection failed**
- Verify Supabase credentials
- Check if schema was applied
- Ensure RLS policies are active

### Validation Commands

```bash
# Validate environment
npm run validate

# Check Supabase connection
curl -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  "$SUPABASE_URL/rest/v1/tenants?select=count"

# Test backend health
curl http://localhost:3001/health
```

## 📊 Platform Features

Once running, you'll have access to:

- ✅ **Multi-tenant Authentication**: Secure user management
- ✅ **Window Manager**: Draggable app windows
- ✅ **Event Bus**: App-to-app communication
- ✅ **Realtime Updates**: Live data synchronization
- ✅ **Demo Apps**: Accounting, Tax, Inventory, CRM, Realtime Demo
- ✅ **Supabase Integration**: Persistent storage with RLS

## 🎯 Next Steps

1. **Create Real Apps**: Build custom applications
2. **Add Users**: Invite team members
3. **Configure Security**: Set up additional RLS policies
4. **Monitor Usage**: Check Supabase dashboard
5. **Scale**: Add more tenants and apps

---

**AI-BOS Platform** - The Windows OS for SaaS 🚀 