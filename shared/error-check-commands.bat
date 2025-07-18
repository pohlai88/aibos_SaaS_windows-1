@echo off
echo ================================================
echo AI-BOS Shared Directory Error Checking Commands
echo ================================================

echo.
echo 1. TypeScript Compilation Errors:
echo ================================
npx tsc --noEmit > typescript-errors.log 2>&1
echo TypeScript errors saved to typescript-errors.log
findstr /c:"error TS" typescript-errors.log | find /c "error TS" > typescript-error-count.txt
set /p TS_ERRORS=<typescript-error-count.txt
echo Total TypeScript errors: %TS_ERRORS%

echo.
echo 2. ESLint Errors:
echo =================
npx eslint . --max-warnings=0 > eslint-errors.log 2>&1
echo ESLint errors saved to eslint-errors.log
findstr /c:"error" eslint-errors.log | find /c "error" > eslint-error-count.txt
set /p ESLINT_ERRORS=<eslint-error-count.txt
echo Total ESLint errors: %ESLINT_ERRORS%

echo.
echo 3. Console Log Statements in Production:
echo ========================================
findstr /s /i /c:"console.log" /c:"console.error" /c:"console.warn" *.ts *.tsx > console-statements.log 2>nul
findstr /s /i /c:"console.log" /c:"console.error" /c:"console.warn" *.ts *.tsx | find /c "console" > console-count.txt
set /p CONSOLE_COUNT=<console-count.txt
echo Total console statements: %CONSOLE_COUNT%
echo Details saved to console-statements.log

echo.
echo 4. TODO Comments:
echo =================
findstr /s /i /c:"TODO" /c:"FIXME" /c:"HACK" *.ts *.tsx *.md > todo-comments.log 2>nul
findstr /s /i /c:"TODO" /c:"FIXME" /c:"HACK" *.ts *.tsx *.md | find /c "TODO" > todo-count.txt
set /p TODO_COUNT=<todo-count.txt
echo Total TODO comments: %TODO_COUNT%
echo Details saved to todo-comments.log

echo.
echo 5. Deprecated Code References:
echo ==============================
findstr /s /i /c:"deprecated" /c:"DEPRECATED" *.ts *.tsx > deprecated-refs.log 2>nul
findstr /s /i /c:"deprecated" /c:"DEPRECATED" *.ts *.tsx | find /c "deprecated" > deprecated-count.txt
set /p DEPRECATED_COUNT=<deprecated-count.txt
echo Total deprecated references: %DEPRECATED_COUNT%
echo Details saved to deprecated-refs.log

echo.
echo ================================================
echo SUMMARY OF ERRORS IN SHARED/ DIRECTORY:
echo ================================================
echo TypeScript errors: %TS_ERRORS%
echo ESLint errors: %ESLINT_ERRORS%
echo Console statements: %CONSOLE_COUNT%
echo TODO comments: %TODO_COUNT%
echo Deprecated references: %DEPRECATED_COUNT%
echo ================================================

echo.
echo Log files created:
echo - typescript-errors.log
echo - eslint-errors.log
echo - console-statements.log
echo - todo-comments.log
echo - deprecated-refs.log

pause
