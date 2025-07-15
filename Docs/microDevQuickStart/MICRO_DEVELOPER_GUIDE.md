# 🚀 **AI-BOS: Micro-Developer Success Guide**

**Your dream: Publish apps without errors. This guide makes it happen.**

---

## 🎯 **What You'll Get**

✅ **Working backend** (Railway)  
✅ **Working frontend** (Vercel)  
✅ **Working database** (Supabase)  
✅ **Real apps** you can actually use  
✅ **No errors** - guaranteed  

---

## 📋 **Step 1: Set Up Database (5 minutes)**

### 1.1 Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub
4. Create new project

### 1.2 Set Up Database
1. Copy this SQL and run it in Supabase SQL Editor:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create tenants table
CREATE TABLE tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create manifests table
CREATE TABLE manifests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  manifest_json JSONB NOT NULL,
  version TEXT DEFAULT '1.0.0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create apps table
CREATE TABLE apps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  manifest_id UUID REFERENCES manifests(id),
  tenant_id UUID REFERENCES tenants(id),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  app_id UUID REFERENCES apps(id),
  event_name TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE manifests ENABLE ROW LEVEL SECURITY;
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
```

### 1.3 Get Your Keys
1. Go to Settings → API
2. Copy:
   - **Project URL** (looks like: `https://abc123.supabase.co`)
   - **Anon Key** (starts with `eyJ...`)

---

## 📋 **Step 2: Deploy Backend (10 minutes)**

### 2.1 Install Railway CLI
```bash
npm install -g @railway/cli
```

### 2.2 Deploy Backend
```bash
cd railway-1/backend
railway login
railway init
railway up
```

### 2.3 Set Environment Variables
```bash
railway variables set SUPABASE_URL=YOUR_SUPABASE_URL
railway variables set SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
railway variables set JWT_SECRET=your-super-secret-key-123
railway variables set NODE_ENV=production
```

### 2.4 Get Your Backend URL
```bash
railway status
```
Copy the URL (looks like: `https://your-app.railway.app`)

---

## 📋 **Step 3: Deploy Frontend (10 minutes)**

### 3.1 Install Vercel CLI
```bash
npm install -g vercel
```

### 3.2 Deploy Frontend
```bash
cd railway-1/frontend
vercel
```

### 3.3 Set Environment Variables
```bash
vercel env add NEXT_PUBLIC_API_URL
# Enter your Railway backend URL

vercel env add NEXT_PUBLIC_SUPABASE_URL
# Enter your Supabase URL

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Enter your Supabase anon key
```

### 3.4 Get Your Frontend URL
```bash
vercel ls
```
Copy the URL (looks like: `https://your-app.vercel.app`)

---

## 🎉 **Step 4: Test Your Deployment**

### 4.1 Open Your App
1. Go to your Vercel URL
2. You should see the AI-BOS shell
3. Click "Login" → "Demo Login"

### 4.2 Test Features
✅ **Window Manager** - Drag windows around  
✅ **Dock** - Click apps to open  
✅ **Demo Apps** - Try Accounting, Tax Calculator  
✅ **Real-time** - See live updates  

---

## 🚀 **Step 5: Create Your First App**

### 5.1 Simple App Example
Create a file called `my-first-app.json`:

```json
{
  "name": "My First App",
  "version": "1.0.0",
  "description": "A simple app for micro-developers",
  "entities": [
    {
      "name": "Task",
      "fields": [
        {"name": "id", "type": "uuid", "primary": true},
        {"name": "title", "type": "string", "required": true},
        {"name": "completed", "type": "boolean", "default": false},
        {"name": "created_at", "type": "timestamp", "default": "now()"}
      ]
    }
  ],
  "ui": {
    "components": [
      {
        "name": "TaskList",
        "type": "data-grid",
        "entity": "Task",
        "columns": ["title", "completed", "created_at"]
      },
      {
        "name": "AddTask",
        "type": "form",
        "entity": "Task",
        "fields": ["title"]
      }
    ]
  }
}
```

### 5.2 Install Your App
1. Go to your AI-BOS admin panel
2. Click "Install App"
3. Upload your JSON file
4. Your app appears in the dock!

---

## 🔧 **Troubleshooting**

### ❌ **"Backend not responding"**
```bash
# Check Railway logs
railway logs

# Restart backend
railway up
```

### ❌ **"Database connection failed"**
1. Check Supabase URL and key
2. Make sure you ran the SQL setup
3. Check Railway environment variables

### ❌ **"Frontend not loading"**
```bash
# Check Vercel logs
vercel logs

# Redeploy
vercel --prod
```

### ❌ **"Authentication failed"**
1. Check JWT_SECRET in Railway
2. Make sure Supabase auth is enabled
3. Try demo login: `admin@demo.com` / any password

---

## 📚 **Next Steps**

### Create More Apps
- **CRM App** - Manage customers
- **Inventory App** - Track products
- **Invoice App** - Generate bills
- **Dashboard App** - Show analytics

### Connect Apps
- Apps automatically talk to each other
- Events flow between apps
- Data is shared securely

### Customize UI
- Change colors and themes
- Add your logo
- Customize window layouts

---

## 🎯 **Success Checklist**

✅ **Database working** - Supabase connected  
✅ **Backend working** - Railway deployed  
✅ **Frontend working** - Vercel deployed  
✅ **Apps loading** - Demo apps work  
✅ **Your app created** - Custom app installed  
✅ **No errors** - Everything smooth  

---

## 🚀 **You Did It!**

**Congratulations!** You've successfully:
- Deployed a full-stack SaaS platform
- Created your first micro-app
- Published without errors
- Have a working foundation

**Your dream is now reality.** 🎉

---

## 📞 **Need Help?**

**Common Issues:**
1. **Environment variables** - Double-check all URLs and keys
2. **Database setup** - Make sure SQL ran successfully
3. **Deployment** - Check logs for specific errors

**Quick Fixes:**
- Restart deployments: `railway up` and `vercel --prod`
- Check logs: `railway logs` and `vercel logs`
- Verify URLs: Test API endpoints directly

**You're not alone** - This guide gets you from zero to published in 30 minutes! 🚀 