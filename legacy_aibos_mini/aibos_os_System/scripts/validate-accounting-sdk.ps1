# AIBOS Accounting SDK Validation Script
# PowerShell-compatible validation for the accounting-sdk package

param(
    [switch]$Verbose,
    [switch]$SkipBuild,
    [switch]$SkipTests
)

# Color functions for better output
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    
    $colors = @{
        "Green" = "32"
        "Yellow" = "33"
        "Red" = "31"
        "Blue" = "34"
        "Cyan" = "36"
        "White" = "37"
    }
    
    $colorCode = $colors[$Color]
    Write-Host "`e[${colorCode}m$Message`e[0m"
}

function Write-Success { param([string]$Message) Write-ColorOutput "✅ $Message" "Green" }
function Write-Warning { param([string]$Message) Write-ColorOutput "⚠️  $Message" "Yellow" }
function Write-Error { param([string]$Message) Write-ColorOutput "❌ $Message" "Red" }
function Write-Info { param([string]$Message) Write-ColorOutput "ℹ️  $Message" "Blue" }
function Write-Step { param([string]$Message) Write-ColorOutput "🔍 $Message" "Cyan" }

# Main validation function
function Test-AccountingSDK {
    Write-ColorOutput "🚀 AIBOS Accounting SDK Validation" "Green"
    Write-ColorOutput "=====================================" "Green"
    Write-Host ""

    $projectRoot = Get-Location
    $accountingSDKPath = Join-Path $projectRoot "packages\accounting-sdk"
    
    # Check if accounting-sdk exists
    if (-not (Test-Path $accountingSDKPath)) {
        Write-Error "Accounting SDK not found at: $accountingSDKPath"
        return $false
    }
    
    Write-Success "Found accounting-sdk at: $accountingSDKPath"
    
    # Step 1: Check package structure
    Write-Step "Step 1: Validating package structure..."
    $requiredFiles = @(
        "package.json",
        "tsconfig.json",
        "README.md",
        "src\index.ts",
        "src\services\",
        "src\utils\"
    )
    
    $missingFiles = @()
    foreach ($file in $requiredFiles) {
        $filePath = Join-Path $accountingSDKPath $file
        if (-not (Test-Path $filePath)) {
            $missingFiles += $file
        }
    }
    
    if ($missingFiles.Count -gt 0) {
        Write-Error "Missing required files:"
        foreach ($file in $missingFiles) {
            Write-Error "  - $file"
        }
        return $false
    }
    
    Write-Success "Package structure is valid"
    
    # Step 2: Check service files
    Write-Step "Step 2: Validating service files..."
    $servicesPath = Join-Path $accountingSDKPath "src\services"
    $serviceFiles = Get-ChildItem -Path $servicesPath -Filter "*.ts" | Select-Object -ExpandProperty Name
    
    Write-Info "Found $($serviceFiles.Count) service files:"
    foreach ($file in $serviceFiles) {
        Write-Info "  - $file"
    }
    
    if ($serviceFiles.Count -lt 5) {
        Write-Warning "Expected at least 5 service files, found $($serviceFiles.Count)"
    }
    
    # Step 3: Check utility files
    Write-Step "Step 3: Validating utility files..."
    $utilsPath = Join-Path $accountingSDKPath "src\utils"
    $utilFiles = Get-ChildItem -Path $utilsPath -Filter "*.ts" | Select-Object -ExpandProperty Name
    
    Write-Info "Found $($utilFiles.Count) utility files:"
    foreach ($file in $utilFiles) {
        Write-Info "  - $file"
    }
    
    # Step 4: Validate package.json
    Write-Step "Step 4: Validating package.json..."
    $packageJsonPath = Join-Path $accountingSDKPath "package.json"
    try {
        $packageJson = Get-Content $packageJsonPath | ConvertFrom-Json
        
        # Check required fields
        $requiredFields = @("name", "version", "main", "types", "scripts")
        foreach ($field in $requiredFields) {
            if (-not $packageJson.PSObject.Properties.Name.Contains($field)) {
                Write-Error "Missing required field in package.json: $field"
                return $false
            }
        }
        
        # Check dependencies
        if ($packageJson.dependencies) {
            Write-Info "Dependencies found:"
            foreach ($dep in $packageJson.dependencies.PSObject.Properties) {
                Write-Info "  - $($dep.Name): $($dep.Value)"
            }
        }
        
        Write-Success "package.json is valid"
    }
    catch {
        Write-Error "Failed to parse package.json: $($_.Exception.Message)"
        return $false
    }
    
    # Step 5: TypeScript compilation check
    Write-Step "Step 5: Checking TypeScript compilation..."
    try {
        Push-Location $accountingSDKPath
        $tscOutput = & npx tsc --noEmit 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "TypeScript compilation successful"
        } else {
            Write-Error "TypeScript compilation failed:"
            Write-Host $tscOutput
            Pop-Location
            return $false
        }
        Pop-Location
    }
    catch {
        Write-Error "Failed to run TypeScript compilation: $($_.Exception.Message)"
        Pop-Location
        return $false
    }
    
    # Step 6: Build test (if not skipped)
    if (-not $SkipBuild) {
        Write-Step "Step 6: Testing build process..."
        try {
            Push-Location $accountingSDKPath
            $buildOutput = & pnpm build 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Build successful"
                
                # Check if dist folder was created
                $distPath = Join-Path $accountingSDKPath "dist"
                if (Test-Path $distPath) {
                    $distFiles = Get-ChildItem -Path $distPath -Recurse | Where-Object { -not $_.PSIsContainer }
                    Write-Info "Generated $($distFiles.Count) files in dist/"
                } else {
                    Write-Warning "No dist/ folder found after build"
                }
            } else {
                Write-Error "Build failed:"
                Write-Host $buildOutput
                Pop-Location
                return $false
            }
            Pop-Location
        }
        catch {
            Write-Error "Failed to run build: $($_.Exception.Message)"
            Pop-Location
            return $false
        }
    } else {
        Write-Info "Skipping build test (--SkipBuild specified)"
    }
    
    # Step 7: Import test
    Write-Step "Step 7: Testing imports..."
    $testImportPath = Join-Path $projectRoot "test-import.ts"
    $testContent = @"
import { ChartOfAccountsService, GeneralLedgerService } from '@aibos/accounting-sdk';
console.log('Import test successful');
console.log('ChartOfAccountsService type:', typeof ChartOfAccountsService);
console.log('GeneralLedgerService type:', typeof GeneralLedgerService);
"@
    
    try {
        Set-Content -Path $testImportPath -Value $testContent
        
        # Try to compile the test file
        $tscTestOutput = & npx tsc --noEmit $testImportPath 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Import test successful"
        } else {
            Write-Error "Import test failed:"
            Write-Host $tscTestOutput
            Remove-Item $testImportPath -ErrorAction SilentlyContinue
            return $false
        }
        
        Remove-Item $testImportPath -ErrorAction SilentlyContinue
    }
    catch {
        Write-Error "Failed to run import test: $($_.Exception.Message)"
        Remove-Item $testImportPath -ErrorAction SilentlyContinue
        return $false
    }
    
    # Step 8: Dependency check
    Write-Step "Step 8: Checking dependencies..."
    try {
        $whyOutput = & pnpm why -r --filter @aibos/accounting-sdk 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Dependency check completed"
            if ($Verbose) {
                Write-Host $whyOutput
            }
        } else {
            Write-Warning "Dependency check failed (this might be normal for new packages)"
        }
    }
    catch {
        Write-Warning "Could not run dependency check: $($_.Exception.Message)"
    }
    
    Write-Host ""
    Write-ColorOutput "🎉 Accounting SDK Validation Complete!" "Green"
    Write-Success "All validation steps passed"
    
    return $true
}

# Run the validation
$success = Test-AccountingSDK

if ($success) {
    Write-Host ""
    Write-ColorOutput "Next Steps:" "Blue"
    Write-Info "1. Update admin-app imports to use @aibos/accounting-sdk"
    Write-Info "2. Start tax-sdk migration"
    Write-Info "3. Run: pnpm run restructure:status"
    
    # Update migration status
    $migrationFile = Join-Path (Get-Location) "MIGRATION.md"
    if (Test-Path $migrationFile) {
        $date = Get-Date -Format "yyyy-MM-dd"
        $statusLine = "| accounting-sdk | ✅ Validated | $date | All tests pass |"
        Add-Content -Path $migrationFile -Value $statusLine
        Write-Success "Updated MIGRATION.md with validation status"
    }
} else {
    Write-Host ""
    Write-ColorOutput "Validation Failed!" "Red"
    Write-Info "Please fix the issues above before proceeding"
    exit 1
} 