@echo off
echo AI-BOS Optimized Build Pipeline Starting...

REM Clean previous builds
echo Cleaning previous builds...
if exist "shared\dist" rmdir /s /q "shared\dist"
if exist "railway-1\backend\dist" rmdir /s /q "railway-1\backend\dist"
if exist "railway-1\frontend\.next" rmdir /s /q "railway-1\frontend\.next"

REM Build shared library
echo Building shared library...
cd /d "%~dp0..\shared"
npm ci --silent
npm run build
if %ERRORLEVEL% neq 0 (
    echo ERROR: Shared library build failed!
    exit /b 1
)

REM Build backend
echo Building backend...
cd /d "%~dp0..\railway-1\backend"
npm ci --silent
npm run build
if %ERRORLEVEL% neq 0 (
    echo ERROR: Backend build failed!
    exit /b 1
)

REM Build frontend
echo Building frontend...
cd /d "%~dp0..\railway-1\frontend"
npm ci --silent
npm run build
if %ERRORLEVEL% neq 0 (
    echo ERROR: Frontend build failed!
    exit /b 1
)

echo All builds completed successfully!