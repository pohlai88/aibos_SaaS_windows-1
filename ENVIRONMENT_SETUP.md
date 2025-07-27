# 🌍 AI-BOS Environment Configuration Guide

## Overview

This guide explains the environment configuration setup for the AI-BOS platform, designed for development standardization and security.

## 📁 Environment File Structure

```
aibos_SaaS_windows-1-1/
├── .env                          # Workspace-wide configuration
├── .cursorignore                 # Cursor IDE configuration
├── railway-1/
│   ├── backend/
│   │   ├── .env                  # Backend standard template
│   │   ├── .env.local            # Backend local overrides
│   │   ├── .cursorignore         # Backend Cursor config
│   │   └── env.example           # Backend documentation
│   └── frontend/
│       ├── .env                  # Frontend standard template
│       ├── .env.local            # Frontend local overrides
│       ├── .cursorignore         # Frontend Cursor config
│       └── env.example           # Frontend documentation
```

## 🔧 Configuration Files

### 1. Root Level (`.env`)

- **Purpose**: Workspace-wide configuration
- **Usage**: Common settings across all projects
- **Security**: Ignored by Git, visible to Cursor

### 2. Backend (`.env`)

- **Purpose**: Backend development template
- **Usage**: Standard backend configuration
- **Security**: Ignored by Git, visible to Cursor

### 3. Frontend (`.env`)

- **Purpose**: Frontend development template
- **Usage**: Standard frontend configuration
- **Security**: Ignored by Git, visible to Cursor

### 4. Local Overrides (`.env.local`)

- **Purpose**: Local development overrides
- **Usage**: Personal configuration and secrets
- **Security**: Ignored by Git, visible to Cursor

## 🛡️ Security Configuration

### Git Ignore Rules

```gitignore
# Root .gitignore
*.env
.env.*
!.env.example
!.env.example.*
```

### Cursor Ignore Rules

```gitignore
# .cursorignore
!.env
!.env.local
!.env.development
!.env.development.local
!.env.test
!.env.test.local
!.env.production
!.env.production.local
```

## 🚀 Development Workflow

### 1. Initial Setup

```bash
# Copy standard templates to local files
cp railway-1/backend/.env railway-1/backend/.env.local
cp railway-1/frontend/.env railway-1/frontend/.env.local

# Edit local files with your actual values
code railway-1/backend/.env.local
code railway-1/frontend/.env.local
```

### 2. Environment Variables Priority

1. `.env.local` (highest priority)
2. `.env.development.local`
3. `.env.development`
4. `.env` (lowest priority)

### 3. Standardization Benefits

- ✅ **Consistent configuration** across team members
- ✅ **IDE IntelliSense** for all environment variables
- ✅ **Security maintained** (secrets not committed)
- ✅ **Easy onboarding** for new developers
- ✅ **Template-based** development

## 📋 Environment Variables Reference

### Backend Variables

```bash
# Core Environment
NODE_ENV=development
PORT=3001
HOST=0.0.0.0

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRES_IN=24h

# CORS Configuration
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Debug Configuration
DEBUG=true
DEBUG_LEVEL=info
```

### Frontend Variables

```bash
# Core Environment
NODE_ENV=development
NEXT_PUBLIC_NODE_ENV=development

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
NEXT_PUBLIC_ENABLE_CONSCIOUSNESS=true
NEXT_PUBLIC_ENABLE_QUANTUM=true
NEXT_PUBLIC_ENABLE_WEBSOCKET=true
```

## 🔍 Cursor IDE Integration

### Benefits

- ✅ **Autocomplete** for environment variable names
- ✅ **Syntax highlighting** for `.env` files
- ✅ **Error detection** for malformed variables
- ✅ **IntelliSense** for variable references in code
- ✅ **Type checking** for environment variables

### Configuration

The `.cursorignore` files allow Cursor to see environment files while keeping them secure from Git:

```gitignore
# Allow .env files for Cursor IntelliSense
!.env
!.env.local
!.env.development
!.env.development.local
!.env.test
!.env.test.local
!.env.production
!.env.production.local
```

## 🛠️ Troubleshooting

### Common Issues

1. **Environment variables not loading**

   - Check file naming (`.env.local` vs `.env`)
   - Verify file location (project root vs subdirectory)
   - Restart development server

2. **Cursor not recognizing variables**

   - Check `.cursorignore` configuration
   - Restart Cursor IDE
   - Verify file permissions

3. **Git committing environment files**
   - Check `.gitignore` configuration
   - Use `git status` to verify files are ignored
   - Remove committed files: `git rm --cached .env.local`

### Best Practices

1. **Never commit secrets** to version control
2. **Use `.env.local`** for personal configuration
3. **Keep `.env` files** as templates
4. **Document required variables** in `env.example`
5. **Use consistent naming** across projects
6. **Validate environment** on startup

## 📚 Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Node.js Environment Variables](https://nodejs.org/api/process.html#processenv)
- [Supabase Environment Setup](https://supabase.com/docs/guides/getting-started/environment-variables)
- [Cursor IDE Documentation](https://cursor.sh/docs)

## 🔄 Updates and Maintenance

### Adding New Variables

1. Update `.env` template files
2. Update `env.example` documentation
3. Update this guide
4. Notify team members

### Security Audits

- Regularly review environment variables
- Rotate secrets periodically
- Monitor for exposed credentials
- Use environment variable validation

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintainer**: AI-BOS Team
