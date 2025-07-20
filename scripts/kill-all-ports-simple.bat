@echo off
echo [FIRE] AI-BOS Port Killer - Quick Execution
echo =====================================
echo.

echo [PROCESS] Killing Node.js processes...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM npm.exe 2>nul
taskkill /F /IM yarn.exe 2>nul
taskkill /F /IM pnpm.exe 2>nul
taskkill /F /IM bun.exe 2>nul

echo [PROCESS] Killing development servers...
taskkill /F /IM next-server.exe 2>nul
taskkill /F /IM vite.exe 2>nul
taskkill /F /IM webpack.exe 2>nul

echo [PROCESS] Clearing common development ports...
for %%p in (3000 3001 3002 3003 4000 4001 5000 5001 5173 8000 8001 8080 8081 9000 9001) do (
    echo Checking port %%p...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%%p "') do (
        if not "%%a"=="" (
            echo Killing process %%a on port %%p
            taskkill /F /PID %%a 2>nul
        )
    )
)

echo.
echo [SUCCESS] Port cleanup completed!
echo [INFO] Your localhost environment is ready for development.
echo.
echo [INFO] You can now run:
echo   npm run dev
echo   yarn dev
echo   npm start
echo   yarn start
echo.
pause