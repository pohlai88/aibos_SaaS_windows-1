# AI-BOS Nuclear Git History Rewrite Script
# Removes all formatting noise from git history for perfect blame

Write-Host "🚀 AI-BOS Nuclear Git History Rewrite" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Create a temporary file with the replacement rules
$replaceRules = @"
s/[ \t]+$//g
s/\r\n/\n/g
"@

$replaceRules | Out-File -FilePath "temp-replace-rules.txt" -Encoding UTF8

try {
    Write-Host "🔧 Executing nuclear git history rewrite..." -ForegroundColor Yellow

    # Execute the rewrite
    git filter-repo --path . --replace-text "temp-replace-rules.txt" --force

    Write-Host "✅ Git history rewrite completed successfully!" -ForegroundColor Green
    Write-Host "🎉 Your git blame is now 100% clean!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Review the changes: git log --oneline"
    Write-Host "   2. Force push to remote: git push --force-with-lease"
    Write-Host "   3. Notify your team about the history rewrite"
    Write-Host ""

} catch {
    Write-Host "❌ Git history rewrite failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 You can restore from backup with:" -ForegroundColor Yellow
    Write-Host "   git reset --hard backup-before-history-rewrite"
} finally {
    # Clean up temporary file
    if (Test-Path "temp-replace-rules.txt") {
        Remove-Item "temp-replace-rules.txt"
    }
}
