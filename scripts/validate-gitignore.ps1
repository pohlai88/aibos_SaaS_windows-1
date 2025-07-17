# ====================== #
#  AI-BOS Enterprise     #
#  .gitignore Validator  #
#  PowerShell Version    #
# ====================== #

param(
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

Write-Host "Validating .gitignore compliance..." -ForegroundColor Cyan

# Check for committed secrets
Write-Host "  Checking for secrets..." -ForegroundColor Yellow
$secretFiles = git grep -l -E '\.(key|pem|cert|env|secret|p12|pfx|vault|kubeconfig)$' -- ':!*.gitignore' ':!scripts/validate-gitignore.sh' ':!scripts/validate-gitignore.ps1' 2>$null
if ($secretFiles) {
    Write-Host "ERROR: Secrets detected in committed files" -ForegroundColor Red
    Write-Host "   Please remove any .key, .pem, .cert, .env, .secret files" -ForegroundColor Red
    exit 1
}

# Verify no build artifacts
Write-Host "  Checking for build artifacts..." -ForegroundColor Yellow
$buildArtifacts = git ls-files | Select-String -Pattern '(dist|build|node_modules|\.next|\.output|\.cache|\.turbo|\.vite)/'
if ($buildArtifacts) {
    Write-Host "ERROR: Build artifacts detected" -ForegroundColor Red
    Write-Host "   Please remove any dist/, build/, node_modules/, .next/, .output/, .cache/, .turbo/, .vite/ directories" -ForegroundColor Red
    exit 1
}

# Check for large files that shouldn't be committed
Write-Host "  Checking for large files..." -ForegroundColor Yellow
$largeFiles = git ls-files | ForEach-Object {
    $file = $_
    $size = (Get-Item $file -ErrorAction SilentlyContinue).Length
    if ($size -gt 10MB) { $file }
} | Select-Object -First 5

if ($largeFiles) {
    Write-Host "WARNING: Large files detected (>10MB):" -ForegroundColor Yellow
    $largeFiles | ForEach-Object { Write-Host "   $_" -ForegroundColor Yellow }
    Write-Host "   Consider using Git LFS for large files" -ForegroundColor Yellow
}

# Check for common sensitive patterns
Write-Host "  Checking for sensitive patterns..." -ForegroundColor Yellow
$sensitivePatterns = git grep -l -E '(password|secret|token|api_key|private_key)' -- ':!*.gitignore' ':!scripts/validate-gitignore.sh' ':!scripts/validate-gitignore.ps1' ':!CONTRIBUTING.md' ':!README.md' 2>$null
if ($sensitivePatterns) {
    Write-Host "WARNING: Potential sensitive patterns detected" -ForegroundColor Yellow
    Write-Host "   Please review files for hardcoded secrets" -ForegroundColor Yellow
    if ($Verbose) {
        $sensitivePatterns | ForEach-Object { Write-Host "   $_" -ForegroundColor Yellow }
    }
}

Write-Host "SUCCESS: .gitignore validation passed!" -ForegroundColor Green
Write-Host "Your repository is clean and secure." -ForegroundColor Green 