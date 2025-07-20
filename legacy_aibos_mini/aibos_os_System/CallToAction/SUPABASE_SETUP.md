# 🗄️ Supabase Database Setup Guide

## **Quick Setup (3 Steps)**

### **1. Create Supabase Project**
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Wait for the project to be ready (2-3 minutes)

### **2. Get Your Credentials**
1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy your **Project URL** and **anon/public key**
3. Create a `.env` file in the project root:

```bash
# Copy from config.env.example
cp config.env.example .env
```

4. Update `.env` with your Supabase credentials:
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
```

### **3. Run Database Schema**
1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the contents of `database/schema.sql`
3. Click **Run** to create all tables and sample data

---

## **What's Included**

✅ **4 Database Tables:**
- `modules` - Store uploaded modules
- `tasks` - Task Master data
- `uploads` - File upload records
- `system_logs` - System activity logs

✅ **Sample Data:**
- Pre-loaded tasks for project tracking
- Database indexes for performance
- Automatic timestamp updates

✅ **Full CRUD Operations:**
- Create, Read, Update, Delete for all entities
- Error handling and logging
- Real-time data persistence

---

## **Testing the Connection**

After setup, restart your server:
```bash
npm start
```

You should see:
```
🚀 AI-BOS OS API Server running on port 3000
📱 Health check: http://localhost:3000/api/health
🗄️ Database: Supabase connected
```

---

## **Benefits of Supabase**

🔒 **Security:** Row Level Security (RLS) ready
⚡ **Performance:** PostgreSQL with automatic indexing
🔄 **Real-time:** Built-in real-time subscriptions
📊 **Analytics:** Built-in dashboard and monitoring
🌐 **Global:** CDN and edge functions
🔧 **API:** Auto-generated REST and GraphQL APIs

---

## **Next Steps**

1. **Test the Task Master** - Add/edit/delete tasks
2. **Upload Modules** - Test file uploads with database storage
3. **Monitor Data** - Check your Supabase dashboard
4. **Enable RLS** - Add authentication and row-level security

---

## **Troubleshooting**

### **Connection Failed**
- Check your `.env` file has correct credentials
- Verify your Supabase project is active
- Check network connectivity

### **Tables Not Found**
- Run the schema.sql in Supabase SQL Editor
- Check for any SQL errors in the editor

### **Permission Errors**
- Ensure you're using the `anon` key (not service_role)
- Check if RLS is enabled (disable for testing)

---

**🎉 Your AI-BOS OS now has a production-ready database!** 