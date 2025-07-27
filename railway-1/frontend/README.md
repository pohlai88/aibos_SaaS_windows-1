# AI-BOS Frontend

This is the frontend application for the AI-BOS platform, built with Next.js and TypeScript.

## 🚀 Deployment to Vercel

### Prerequisites
1. Your backend API must be deployed and accessible
2. You need the backend URL for environment variables

### Environment Variables Setup

Before deploying to Vercel, you need to set up the following environment variables in your Vercel project:

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add the following variable:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: Your Railway backend URL (e.g., `https://your-backend.railway.app`)
   - **Environment**: Production, Preview, and Development

### Deployment Steps

1. **Connect your repository to Vercel**
2. **Set environment variables** (see above)
3. **Deploy** - Vercel will automatically detect Next.js and build the project

### Troubleshooting

If deployment fails, check:

1. **TypeScript errors**: Run `npm run build` locally to check for TypeScript issues
2. **Environment variables**: Ensure `NEXT_PUBLIC_API_URL` is set in Vercel
3. **Dependencies**: All required packages are in `package.json`
4. **Build logs**: Check Vercel build logs for specific error messages

## 🛠️ Development

### Local Development

```bash
npm install
npm run dev
```

The application will be available at `http://localhost:3000`

### Build

```bash
npm run build
npm start
```

## 🔧 Debugging & Monitoring

### Debug Scripts

The frontend includes enhanced debugging capabilities:

```bash
# Performance debugging
npm run debug:performance    # Enable performance monitoring
npm run debug:memory         # Enable memory monitoring
npm run debug:api           # Enable API request/response logging
npm run debug:profile       # Enable component profiling
npm run debug:bundle        # Analyze bundle size

# Health checks
npm run health:check        # Check application health

# Production builds
npm run build:prod          # Optimized production build
npm run start:prod          # Start production server
```

### Environment Variables for Debugging

Add these to your `.env.local` for enhanced debugging:

```bash
# Debug Configuration
NEXT_PUBLIC_DEBUG_MEMORY=true
NEXT_PUBLIC_DEBUG_PERFORMANCE=true
NEXT_PUBLIC_DEBUG_API=true
NEXT_PUBLIC_DEBUG_PROFILE=true
NEXT_PUBLIC_DEBUG_LEVEL=debug

# Instance Configuration
NEXT_PUBLIC_INSTANCE_ID=your-instance-id
```

### Debug Utilities

The frontend includes a comprehensive debug utility system:

```typescript
import { debug, logger, performanceMonitor } from '@/lib/debug';

// Performance monitoring
performanceMonitor.startTimer('my-operation');
// ... your code ...
performanceMonitor.endTimer('my-operation');

// Async performance monitoring
const result = await performanceMonitor.measureAsync('api-call', async () => {
  return await api.get('/data');
});

// Logging
logger.debug('Debug message', { context: 'data' });
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message', { error: new Error('Something went wrong') });

// Component performance monitoring
const MyComponent = debug.withPerformanceMonitoring(Component, 'MyComponent');
```

## 🔒 Security

The application implements comprehensive security headers:

- **Content Security Policy (CSP)**: Restricts resource loading
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **Strict-Transport-Security**: Enforces HTTPS
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Restricts browser features

## 📊 Performance Monitoring

Built-in performance monitoring includes:

- **Core Web Vitals tracking**
- **Bundle size monitoring**
- **API response time tracking**
- **Component render performance**
- **Memory usage monitoring**

## Project Structure

- `src/app/` - Next.js App Router pages
- `src/components/` - React components
- `src/lib/` - Utility functions and API client
- `src/hooks/` - Custom React hooks
- `src/providers/` - Context providers

## Technologies Used

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- Axios (HTTP Client)
- WebSocket (Real-time communication) 
