# AI-BOS SaaS Platform

This repository contains the prototype for the AI-BOS (AI Business Operating System) multi-tenant SaaS platform.

## Project Structure

```
aibos_SaaS_windows-1/
  railway-1/
    backend/   # Node.js + Express + Supabase backend (deployed to Railway)
    frontend/  # Next.js + React frontend (deployed to Vercel)
  Docs/        # Architecture and design documentation
```

## Key Features
- Multi-tenant SaaS with row-level security (Supabase)
- Event-driven app communication
- Manifest-based app definitions
- Realtime updates (Supabase Realtime)
- Demo apps: Accounting, Tax, Inventory, CRM
- Secure authentication (JWT)
- GDPR-ready, audit logs

## Deployment

### Backend (Railway)
- Deploy `railway-1/backend` to Railway
- Configure environment variables for Supabase and JWT

### Frontend (Vercel)
- Deploy `railway-1/frontend` to Vercel
- Set `NEXT_PUBLIC_API_URL` to your Railway backend URL in Vercel dashboard

### Supabase
- Use `supabase-schema.sql` to set up your database
- Enable Row Level Security and Realtime

## Documentation
- See `Docs/` for architecture, diagrams, and summaries

---

For detailed setup, see `SUPABASE_SETUP.md` and `STARTUP.md`. 