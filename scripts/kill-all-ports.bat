@echo off
echo 🔥 AI-BOS Port Killer - Quick Execution
echo =====================================

REM Check if PowerShell is available
powershell -Command "Get-Host" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PowerShell not found. Using basic commands...
    goto :basic_kill
)

REM Run the PowerShell script
echo 🚀 Running comprehensive port killer...
powershell -ExecutionPolicy Bypass -File "%~dp0kill-all-ports.ps1"
goto :end

:basic_kill
echo 🔄 Using basic port killing commands...

REM Kill Node.js processes
taskkill /F /IM node.exe 2>nul
taskkill /F /IM npm.exe 2>nul
taskkill /F /IM yarn.exe 2>nul

REM Kill processes on common ports
for %%p in (3000 3001 3002 4000 5000 8000 8080) do (
    echo Checking port %%p...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%%p "') do (
        taskkill /F /PID %%a 2>nul
    )
)

echo ✅ Basic port cleanup completed

:end
echo.
echo 🎉 Ready for localhost development!
pause