# Vercel Deployment Guide

## ✅ Fixed Configuration Issues

### 1. **Vercel.json** - Simplified Configuration
- Removed unnecessary `builds` section (Next.js auto-detects)
- Removed incorrect environment variable reference
- Removed unnecessary `functions` configuration
- Kept only essential CORS headers

### 2. **Next.config.js** - Updated Configuration
- Removed deprecated `experimental.appDir` flag
- Kept TypeScript and ESLint configurations
- Maintained API rewrites for backend communication

### 3. **TypeScript Configuration**
- Added proper `tsconfig.json`
- Added `next-env.d.ts` declarations
- Fixed path aliases (`@/*`)

## 🚀 Deployment Steps

### Step 1: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository: `https://github.com/pohlai88/aibos_SaaS_windows-1.git`

### Step 2: Configure Project Settings
- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `railway-1/frontend`
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)

### Step 3: Set Environment Variables
In Vercel Dashboard → Settings → Environment Variables:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend.railway.app` | Production, Preview, Development |

### Step 4: Deploy
Click "Deploy" and wait for the build to complete.

## 🔧 Local Testing

Before deploying, test locally:

```bash
cd railway-1/frontend
npm install
npm run build
npm start
```

## 🚨 Troubleshooting

### Build Failures
1. **TypeScript Errors**: Run `npm run build` locally
2. **Missing Dependencies**: Check `package.json`
3. **Environment Variables**: Ensure `NEXT_PUBLIC_API_URL` is set

### Runtime Errors
1. **API Connection**: Verify backend is accessible
2. **CORS Issues**: Check backend CORS configuration
3. **WebSocket Connection**: Verify WebSocket URL construction

### Common Issues
- **404 Errors**: Check API rewrites in `next.config.js`
- **Authentication**: Verify backend auth endpoints
- **Real-time Features**: Check WebSocket connection

## 📁 Project Structure
```
railway-1/frontend/
├── src/
│   ├── app/           # Next.js App Router
│   ├── components/    # React components
│   ├── hooks/         # Custom hooks
│   ├── lib/           # Utilities and API
│   └── providers/     # Context providers
├── package.json       # Dependencies
├── next.config.js     # Next.js configuration
├── tsconfig.json      # TypeScript configuration
├── vercel.json        # Vercel configuration
└── README.md          # Project documentation
```

## 🔗 Important URLs
- **Frontend**: `https://your-project.vercel.app`
- **Backend**: `https://your-backend.railway.app`
- **GitHub**: `https://github.com/pohlai88/aibos_SaaS_windows-1.git` 