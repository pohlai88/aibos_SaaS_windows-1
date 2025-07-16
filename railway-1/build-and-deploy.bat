@echo off
setlocal enabledelayedexpansion

REM AI-BOS Platform Build and Deploy Script for Windows
REM This script performs a complete build and deployment of the AI-BOS platform

echo 🚀 Starting AI-BOS Platform Build and Deploy Process...

REM Check prerequisites
echo [INFO] Checking prerequisites...

node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18 or higher.
    exit /b 1
)

npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not installed. Please install npm.
    exit /b 1
)

for /f "tokens=2 delims=." %%i in ('node --version') do set NODE_MAJOR=%%i
if %NODE_MAJOR% LSS 18 (
    echo [ERROR] Node.js version 18 or higher is required. Current version: 
    node --version
    exit /b 1
)

echo [SUCCESS] Prerequisites check passed

REM Clean previous builds
echo [INFO] Cleaning previous builds...

if exist "shared\dist" (
    rmdir /s /q "shared\dist"
    echo [INFO] Cleaned shared library dist
)

if exist "backend\dist" (
    rmdir /s /q "backend\dist"
    echo [INFO] Cleaned backend dist
)

if exist "frontend\.next" (
    rmdir /s /q "frontend\.next"
    echo [INFO] Cleaned frontend .next
)

if exist "frontend\node_modules\.cache" (
    rmdir /s /q "frontend\node_modules\.cache"
    echo [INFO] Cleaned frontend cache
)

if exist "shared\ui-components\dist" (
    rmdir /s /q "shared\ui-components\dist"
    echo [INFO] Cleaned UI components dist
)

echo [SUCCESS] Cleanup completed

REM Install dependencies
echo [INFO] Installing dependencies...

REM Install shared library dependencies
echo [INFO] Installing shared library dependencies...
cd shared
call npm ci --silent
if errorlevel 1 (
    echo [ERROR] Failed to install shared library dependencies
    exit /b 1
)
echo [SUCCESS] Shared library dependencies installed

REM Install UI components dependencies
echo [INFO] Installing UI components dependencies...
cd ui-components
call npm ci --silent
if errorlevel 1 (
    echo [ERROR] Failed to install UI components dependencies
    exit /b 1
)
echo [SUCCESS] UI components dependencies installed
cd ..\..

REM Install backend dependencies
echo [INFO] Installing backend dependencies...
cd backend
call npm ci --silent
if errorlevel 1 (
    echo [ERROR] Failed to install backend dependencies
    exit /b 1
)
echo [SUCCESS] Backend dependencies installed
cd ..

REM Install frontend dependencies
echo [INFO] Installing frontend dependencies...
cd frontend
call npm ci --silent
if errorlevel 1 (
    echo [ERROR] Failed to install frontend dependencies
    exit /b 1
)
echo [SUCCESS] Frontend dependencies installed
cd ..

echo [SUCCESS] All dependencies installed

REM Build shared library
echo [INFO] Building shared library...
cd shared
call npm run build
if errorlevel 1 (
    echo [ERROR] Failed to build shared library
    exit /b 1
)
echo [SUCCESS] Shared library built

REM Build UI components
echo [INFO] Building UI components...
cd ui-components
call npm run build
if errorlevel 1 (
    echo [ERROR] Failed to build UI components
    exit /b 1
)
echo [SUCCESS] UI components built
cd ..\..

REM Build backend
echo [INFO] Building backend...
cd backend
call npm run build
if errorlevel 1 (
    echo [ERROR] Failed to build backend
    exit /b 1
)
echo [SUCCESS] Backend built
cd ..

REM Build frontend
echo [INFO] Building frontend...
cd frontend
call npm run build
if errorlevel 1 (
    echo [ERROR] Failed to build frontend
    exit /b 1
)
echo [SUCCESS] Frontend built
cd ..

echo [SUCCESS] All builds completed

REM Run tests
echo [INFO] Running tests...

REM Test shared library
echo [INFO] Testing shared library...
cd shared
call npm test --silent
if errorlevel 1 (
    echo [ERROR] Shared library tests failed
    exit /b 1
)
echo [SUCCESS] Shared library tests passed

REM Test UI components
echo [INFO] Testing UI components...
cd ui-components
call npm test --silent
if errorlevel 1 (
    echo [ERROR] UI components tests failed
    exit /b 1
)
echo [SUCCESS] UI components tests passed
cd ..\..

REM Test backend
echo [INFO] Testing backend...
cd backend
call npm test --silent
if errorlevel 1 (
    echo [ERROR] Backend tests failed
    exit /b 1
)
echo [SUCCESS] Backend tests passed
cd ..

REM Test frontend
echo [INFO] Testing frontend...
cd frontend
call npm test --silent
if errorlevel 1 (
    echo [ERROR] Frontend tests failed
    exit /b 1
)
echo [SUCCESS] Frontend tests passed
cd ..

echo [SUCCESS] All tests passed

REM Type checking
echo [INFO] Running type checks...

REM Check shared library types
echo [INFO] Checking shared library types...
cd shared
call npm run typecheck
if errorlevel 1 (
    echo [ERROR] Shared library type check failed
    exit /b 1
)
echo [SUCCESS] Shared library types OK

REM Check UI components types
echo [INFO] Checking UI components types...
cd ui-components
call npm run typecheck
if errorlevel 1 (
    echo [ERROR] UI components type check failed
    exit /b 1
)
echo [SUCCESS] UI components types OK
cd ..\..

REM Check backend types
echo [INFO] Checking backend types...
cd backend
call npm run type-check
if errorlevel 1 (
    echo [ERROR] Backend type check failed
    exit /b 1
)
echo [SUCCESS] Backend types OK
cd ..

REM Check frontend types
echo [INFO] Checking frontend types...
cd frontend
call npm run type-check
if errorlevel 1 (
    echo [ERROR] Frontend type check failed
    exit /b 1
)
echo [SUCCESS] Frontend types OK
cd ..

echo [SUCCESS] All type checks passed

REM Linting
echo [INFO] Running linters...

REM Lint shared library
echo [INFO] Linting shared library...
cd shared
call npm run lint
if errorlevel 1 (
    echo [ERROR] Shared library linting failed
    exit /b 1
)
echo [SUCCESS] Shared library linting passed

REM Lint UI components
echo [INFO] Linting UI components...
cd ui-components
call npm run lint
if errorlevel 1 (
    echo [ERROR] UI components linting failed
    exit /b 1
)
echo [SUCCESS] UI components linting passed
cd ..\..

REM Lint backend
echo [INFO] Linting backend...
cd backend
call npm run lint
if errorlevel 1 (
    echo [ERROR] Backend linting failed
    exit /b 1
)
echo [SUCCESS] Backend linting passed
cd ..

REM Lint frontend
echo [INFO] Linting frontend...
cd frontend
call npm run lint
if errorlevel 1 (
    echo [ERROR] Frontend linting failed
    exit /b 1
)
echo [SUCCESS] Frontend linting passed
cd ..

echo [SUCCESS] All linting passed

REM Database migration check
echo [INFO] Checking database schema...
if exist "railway-1\supabase-schema.sql" (
    echo [SUCCESS] Database schema file found
) else (
    echo [WARNING] Database schema file not found
)

REM Environment variables check
echo [INFO] Checking environment variables...

REM Check backend environment
if exist "railway-1\backend\.env" (
    echo [SUCCESS] Backend environment file found
) else (
    echo [WARNING] Backend environment file not found - using .env.example
    if exist "railway-1\backend\env.example" (
        copy "railway-1\backend\env.example" "railway-1\backend\.env" >nul
        echo [INFO] Created .env from example
    )
)

REM Check frontend environment
if exist "railway-1\frontend\.env" (
    echo [SUCCESS] Frontend environment file found
) else (
    echo [WARNING] Frontend environment file not found - using .env.example
    if exist "railway-1\frontend\env.example" (
        copy "railway-1\frontend\env.example" "railway-1\frontend\.env" >nul
        echo [INFO] Created .env from example
    )
)

REM Final status
echo [SUCCESS] 🎉 AI-BOS Platform Build and Deploy Process Completed Successfully!

echo.
echo 📋 Build Summary:
echo   ✅ Shared Library: Built and tested
echo   ✅ UI Components: Built and tested
echo   ✅ Backend: Built and tested
echo   ✅ Frontend: Built and tested
echo   ✅ Type Checks: All passed
echo   ✅ Linting: All passed
echo   ✅ Tests: All passed
echo.

echo 🚀 Ready for deployment!
echo.
echo Next steps:
echo   1. Review environment variables in .env files
echo   2. Deploy to Railway: cd railway-1 ^&^& railway up
echo   3. Or deploy manually to your preferred platform
echo.

echo [SUCCESS] Build process completed successfully!
pause 