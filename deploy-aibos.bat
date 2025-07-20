@echo off
echo ========================================
echo    AI-BOS Platform Deployment
echo ========================================
echo.

echo Choose deployment type:
echo 1. Development (local testing)
echo 2. Staging (preview deployment)
echo 3. Production (live deployment)
echo.
set /p choice="Enter choice (1-3): "

if "%choice%"=="1" (
    echo Starting development deployment...
    call scripts\deploy-development.bat
) else if "%choice%"=="2" (
    echo Starting staging deployment...
    call scripts\deploy-staging.bat
) else if "%choice%"=="3" (
    echo Starting production deployment...
    call scripts\deploy-production.bat
) else (
    echo Invalid choice. Exiting...
    exit /b 1
)

echo.
echo ========================================
echo    Deployment Complete!
echo ========================================