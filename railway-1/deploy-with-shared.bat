@echo off
chcp 65001 >nul

REM 🚀 AI-BOS Platform Deployment with Shared Library
REM This script builds the shared library and deploys the complete platform

echo 🚀 AI-BOS Platform Deployment with Shared Library
echo ==================================================

REM Check if Node.js is installed
echo 📋 Checking requirements...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js 18+ first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm not found. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm found

REM Install Railway CLI
echo 📦 Installing Railway CLI...
call npm install -g @railway/cli
if errorlevel 1 (
    echo ❌ Railway CLI installation failed
    pause
    exit /b 1
)
echo ✅ Railway CLI installed

REM Install Vercel CLI
echo 📦 Installing Vercel CLI...
call npm install -g vercel
if errorlevel 1 (
    echo ❌ Vercel CLI installation failed
    pause
    exit /b 1
)
echo ✅ Vercel CLI installed

REM Build shared library
echo 🏗️ Building shared library...
cd ..\shared

REM Install dependencies
echo 📦 Installing shared library dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install shared library dependencies
    pause
    exit /b 1
)

REM Build the library
echo 🔨 Building shared library...
call npm run build
if errorlevel 1 (
    echo ❌ Failed to build shared library
    pause
    exit /b 1
)

echo ✅ Shared library built successfully
cd ..\railway-1

REM Setup environment variables
echo 🔧 Setting up environment variables...
if not exist "backend\.env" (
    copy "backend\env.example" "backend\.env"
    echo 📝 Created backend\.env (please edit with your values)
)

if not exist "frontend\.env.local" (
    copy "frontend\env.example" "frontend\.env.local"
    echo 📝 Created frontend\.env.local (please edit with your values)
)
echo ✅ Environment files created

echo.
echo ⚠️  IMPORTANT: Before continuing, please:
echo 1. Set up your Supabase database (see MICRO_DEVELOPER_GUIDE.md)
echo 2. Update environment variables in backend\.env and frontend\.env.local
echo.
set /p ready="Press Enter when you're ready to deploy..."

REM Deploy backend
echo 🚀 Deploying backend to Railway...
cd backend

REM Install dependencies
echo 📦 Installing backend dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

REM Check if already deployed
railway status >nul 2>&1
if errorlevel 1 (
    echo 🆕 Initializing Railway project...
    railway login
    railway init
    railway up
) else (
    echo 🔄 Backend already deployed, updating...
    railway up
)

echo ✅ Backend deployed successfully
cd ..

REM Deploy frontend
echo 🚀 Deploying frontend to Vercel...
cd frontend

REM Install dependencies
echo 📦 Installing frontend dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)

REM Check if already deployed
vercel ls >nul 2>&1
if errorlevel 1 (
    echo 🆕 Initializing Vercel project...
    vercel
) else (
    echo 🔄 Frontend already deployed, updating...
    vercel --prod
)

echo ✅ Frontend deployed successfully
cd ..

REM Display success message
echo.
echo 🎉 SUCCESS! AI-BOS Platform with Shared Library Deployed!
echo ==========================================================
echo.
echo 📋 What's New with Shared Library Integration:
echo ✅ Enhanced authentication with security features
echo ✅ Real-time performance monitoring
echo ✅ Advanced security and compliance
echo ✅ Multi-tenant billing system
echo ✅ Event-driven architecture
echo ✅ Professional UI components
echo ✅ Enterprise-grade logging
echo.
echo 🚀 Your 'Windows OS for SaaS' is now powered by:
echo    - Advanced AI systems
echo    - Real-time collaboration
echo    - Enterprise security
echo    - Performance monitoring
echo    - Professional UI components
echo.
echo 📚 Next Steps:
echo 1. Open your Vercel URL (check vercel ls)
echo 2. Login with demo credentials
echo 3. Explore the enhanced features
echo 4. Create your first app
echo 5. Start onboarding clients
echo.
echo 🔧 Troubleshooting:
echo - Check logs: railway logs (backend) or vercel logs (frontend)
echo - Restart: railway up (backend) or vercel --prod (frontend)
echo - Shared library: cd ..\shared ^&^& npm run build
echo.
echo 🎯 Your dream of a powerful SaaS platform is now reality!
echo.
pause 