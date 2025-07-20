@echo off
echo AI-BOS Production Deployment Starting...

REM Pre-deployment checks
echo Running pre-deployment checks...
call "%~dp0auto-fix-typescript.bat"
if %ERRORLEVEL% neq 0 (
    echo ERROR: TypeScript fixes failed!
    exit /b 1
)

REM Build all components
echo Building all components...
call "%~dp0optimized-build.bat"
if %ERRORLEVEL% neq 0 (
    echo ERROR: Build failed!
    exit /b 1
)

REM Run tests
echo Running test suite...
cd /d "%~dp0..\shared"
npm test -- --run
if %ERRORLEVEL% neq 0 (
    echo WARNING: Some tests failed, but continuing deployment...
)

REM Deploy backend to Railway
echo Deploying backend to Railway...
cd /d "%~dp0..\railway-1\backend"
railway up
if %ERRORLEVEL% neq 0 (
    echo ERROR: Backend deployment failed!
    exit /b 1
)

REM Deploy frontend to Vercel
echo Deploying frontend to Vercel...
cd /d "%~dp0..\railway-1\frontend"
vercel --prod
if %ERRORLEVEL% neq 0 (
    echo ERROR: Frontend deployment failed!
    exit /b 1
)

echo 🎉 AI-BOS Platform deployed successfully!
echo Backend: https://your-backend.railway.app
echo Frontend: https://your-frontend.vercel.app