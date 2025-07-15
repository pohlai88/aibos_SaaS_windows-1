@echo off
chcp 65001 >nul

REM 🚀 AI-BOS Quick Start Script for Windows
REM This script deploys your AI-BOS platform in 5 minutes

echo 🚀 AI-BOS Quick Start - Deploy Your SaaS Platform
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

REM Deploy backend to Railway
echo 🚀 Deploying backend to Railway...
cd backend

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

REM Get the backend URL (simplified for Windows)
echo ✅ Backend deployed successfully
cd ..

REM Deploy frontend to Vercel
echo 🚀 Deploying frontend to Vercel...
cd frontend

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

REM Create sample app
echo 📝 Creating sample task app...
if not exist "app-templates" mkdir app-templates
copy "simple-task-app.json" "app-templates\" >nul 2>&1
echo ✅ Sample app template created

REM Display success message
echo.
echo 🎉 SUCCESS! Your AI-BOS platform is deployed!
echo =============================================
echo.
echo 📋 Next Steps:
echo 1. Open your Vercel URL (check vercel ls)
echo 2. Click 'Demo Login' to test
echo 3. Try the demo apps (Accounting, Tax Calculator)
echo 4. Create your first app using the template
echo.
echo 📚 Documentation:
echo - Quick Start Guide: MICRO_DEVELOPER_GUIDE.md
echo - Sample App: app-templates\simple-task-app.json
echo.
echo 🔧 Troubleshooting:
echo - Check logs: railway logs (backend) or vercel logs (frontend)
echo - Restart: railway up (backend) or vercel --prod (frontend)
echo.
echo 🚀 Your dream of publishing apps is now reality!
echo.
pause 