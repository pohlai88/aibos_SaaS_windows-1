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