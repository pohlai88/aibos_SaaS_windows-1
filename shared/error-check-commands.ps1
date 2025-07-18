Write-Host "================================================" -ForegroundColor Cyan
Write-Host "AI-BOS Shared Directory Error Checking Commands" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

Write-Host "`n1. TypeScript Compilation Errors:" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow
npx tsc --noEmit > typescript-errors.log 2>&1
Write-Host "TypeScript errors saved to typescript-errors.log" -ForegroundColor Green
$tsErrors = (Select-String -Pattern "error TS" -Path "typescript-errors.log" | Measure-Object).Count
Write-Host "Total TypeScript errors: $tsErrors" -ForegroundColor $(if($tsErrors -eq 0){"Green"}else{"Red"})

Write-Host "`n2. ESLint Errors:" -ForegroundColor Yellow
Write-Host "=================" -ForegroundColor Yellow
npx eslint . --max-warnings=0 > eslint-errors.log 2>&1
Write-Host "ESLint errors saved to eslint-errors.log" -ForegroundColor Green
$eslintErrors = (Select-String -Pattern "error" -Path "eslint-errors.log" | Measure-Object).Count
Write-Host "Total ESLint errors: $eslintErrors" -ForegroundColor $(if($eslintErrors -eq 0){"Green"}else{"Red"})

Write-Host "`n3. Console Log Statements in Production:" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
$consoleStatements = (Get-ChildItem -Recurse -Include "*.ts","*.tsx" | Select-String -Pattern "console\.(log|error|warn)" | Measure-Object).Count
Write-Host "Total console statements: $consoleStatements" -ForegroundColor $(if($consoleStatements -eq 0){"Green"}else{"Red"})
Get-ChildItem -Recurse -Include "*.ts","*.tsx" | Select-String -Pattern "console\.(log|error|warn)" > console-statements.log

Write-Host "`n4. TODO Comments:" -ForegroundColor Yellow
Write-Host "=================" -ForegroundColor Yellow
$todoComments = (Get-ChildItem -Recurse -Include "*.ts","*.tsx","*.md" | Select-String -Pattern "TODO|FIXME|HACK" | Measure-Object).Count
Write-Host "Total TODO comments: $todoComments" -ForegroundColor $(if($todoComments -eq 0){"Green"}else{"Red"})
Get-ChildItem -Recurse -Include "*.ts","*.tsx","*.md" | Select-String -Pattern "TODO|FIXME|HACK" > todo-comments.log

Write-Host "`n5. Deprecated Code References:" -ForegroundColor Yellow
Write-Host "==============================" -ForegroundColor Yellow
$deprecatedRefs = (Get-ChildItem -Recurse -Include "*.ts","*.tsx" | Select-String -Pattern "deprecated|DEPRECATED" | Measure-Object).Count
Write-Host "Total deprecated references: $deprecatedRefs" -ForegroundColor $(if($deprecatedRefs -eq 0){"Green"}else{"Red"})
Get-ChildItem -Recurse -Include "*.ts","*.tsx" | Select-String -Pattern "deprecated|DEPRECATED" > deprecated-refs.log

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "SUMMARY OF ERRORS IN SHARED/ DIRECTORY:" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "TypeScript errors: $tsErrors" -ForegroundColor $(if($tsErrors -eq 0){"Green"}else{"Red"})
Write-Host "ESLint errors: $eslintErrors" -ForegroundColor $(if($eslintErrors -eq 0){"Green"}else{"Red"})
Write-Host "Console statements: $consoleStatements" -ForegroundColor $(if($consoleStatements -eq 0){"Green"}else{"Red"})
Write-Host "TODO comments: $todoComments" -ForegroundColor $(if($todoComments -eq 0){"Green"}else{"Red"})
Write-Host "Deprecated references: $deprecatedRefs" -ForegroundColor $(if($deprecatedRefs -eq 0){"Green"}else{"Red"})
Write-Host "================================================" -ForegroundColor Cyan

$totalIssues = $tsErrors + $eslintErrors + $consoleStatements + $todoComments + $deprecatedRefs
Write-Host "`nTOTAL ISSUES FOUND: $totalIssues" -ForegroundColor $(if($totalIssues -eq 0){"Green"}else{"Red"})

Write-Host "`nLog files created:" -ForegroundColor Green
Write-Host "- typescript-errors.log"
Write-Host "- eslint-errors.log"
Write-Host "- console-statements.log"
Write-Host "- todo-comments.log"
Write-Host "- deprecated-refs.log"

Read-Host "`nPress Enter to continue..."
