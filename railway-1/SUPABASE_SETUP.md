# Supabase Setup Guide for AI-BOS Platform

This guide will help you set up Supabase for the AI-BOS platform. **Supabase is required** for the platform to function and provides production-ready database functionality.

## 🚀 Quick Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login with your GitHub account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `aibos-platform`
   - **Database Password**: Choose a strong password
   - **Region**: Choose closest to your users
6. Click "Create new project"

### 2. Get Your Credentials

Once your project is created:

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **Service Role Key** (starts with `eyJ...`)
   - **Anon Key** (starts with `eyJ...`)

### 3. Set Up Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the entire content from `supabase-schema.sql`
3. Paste it into the SQL editor
4. Click **Run** to execute the schema

This will create:
- ✅ All required tables
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for performance
- ✅ Demo data
- ✅ Triggers for automatic timestamps

### 4. Configure Environment Variables

#### For Railway Backend:
```bash
railway variables set SUPABASE_URL=https://your-project.supabase.co
railway variables set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
railway variables set SUPABASE_ANON_KEY=your-anon-key
```

#### For Local Development:
Create `.env` file in `backend/`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
```

### 5. Test the Connection

The backend will automatically:
- ✅ Connect to Supabase when credentials are provided
- ✅ Show connection status in logs
- ✅ Throw error if Supabase credentials are missing

## 🔧 Database Schema Overview

### Core Tables

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `tenants` | Multi-tenant isolation | UUID primary key, status tracking |
| `users` | User management | Email unique, role-based permissions |
| `manifests` | App definitions | JSON schema, version control |
| `apps` | Installed applications | Tenant-specific, status tracking |
| `entities` | Data models | Dynamic schema support |
| `events` | Event bus storage | Real-time event logging |
| `event_subscriptions` | Event routing | App-to-app communication |
| `audit_logs` | Security tracking | Complete audit trail |

### Security Features

- **Row Level Security (RLS)**: Data isolation per tenant
- **JWT Authentication**: Secure token-based auth
- **Role-based Access**: Admin, user, viewer roles
- **Audit Logging**: Complete action tracking

## 🎯 Production Features

### 1. Multi-Tenant Isolation
```sql
-- Each tenant only sees their own data
CREATE POLICY "Users can view apps in their tenant" ON apps
  FOR SELECT USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

### 2. Real-time Events
```sql
-- Events are stored and can be queried
SELECT * FROM events 
WHERE tenant_id = 'your-tenant-id' 
ORDER BY created_at DESC;
```

### 3. Audit Trail
```sql
-- Complete audit log of all actions
SELECT * FROM audit_logs 
WHERE tenant_id = 'your-tenant-id' 
ORDER BY created_at DESC;
```

## 🔄 Supabase Integration

The platform is fully integrated with Supabase:

1. **Database Storage**: All data persisted in PostgreSQL
2. **Real-time Updates**: Live data synchronization
3. **Multi-tenant Security**: Row-level security policies
4. **Audit Trail**: Complete action logging

### Benefits of Supabase

- ✅ **Persistence**: Data survives restarts
- ✅ **Scalability**: Handles multiple tenants
- ✅ **Security**: Row-level security
- ✅ **Real-time**: Live data updates
- ✅ **Backup**: Automatic backups
- ✅ **Analytics**: Built-in dashboard

## 🚨 Security Best Practices

### 1. Environment Variables
- Never commit credentials to git
- Use Railway/Vercel secrets
- Rotate keys regularly

### 2. Database Access
- Use service role key only for backend
- Use anon key for frontend (if needed)
- Enable RLS on all tables

### 3. API Security
- Validate all inputs
- Use JWT tokens
- Implement rate limiting

## 🔍 Monitoring & Debugging

### 1. Supabase Dashboard
- **Table Editor**: View/edit data
- **SQL Editor**: Run queries
- **Logs**: Monitor API calls
- **Auth**: User management

### 2. Backend Logs
```bash
# Check connection status
railway logs

# Look for Supabase messages
railway logs | grep -i supabase
```

### 3. Common Issues

**Connection Failed:**
```bash
# Check environment variables
railway variables list

# Verify Supabase URL format
echo $SUPABASE_URL
```

**RLS Policy Issues:**
```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('tenants', 'users', 'apps');
```

## 🎉 Next Steps

After Supabase setup:

1. **Deploy Backend**: `railway up`
2. **Deploy Frontend**: `vercel --prod`
3. **Test Login**: Use demo credentials
4. **Create Real Data**: Add manifests and apps
5. **Monitor**: Check Supabase dashboard

## 📞 Support

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Community**: [github.com/supabase/supabase](https://github.com/supabase/supabase)
- **Discord**: [discord.supabase.com](https://discord.supabase.com)

---

**AI-BOS Platform** - Now with production-ready Supabase integration! 🚀 