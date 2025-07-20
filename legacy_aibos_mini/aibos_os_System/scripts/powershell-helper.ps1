# AIBOS Monorepo PowerShell Helper
# Common functions for the restructure process

param(
    [string]$Command,
    [string]$Package,
    [switch]$Verbose
)

# Color functions
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

# Common functions
function Invoke-SafeCommand {
    param(
        [string]$Command,
        [string]$WorkingDirectory = (Get-Location),
        [string]$Description = ""
    )
    
    if ($Description) {
        Write-Step $Description
    }
    
    try {
        Push-Location $WorkingDirectory
        $output = Invoke-Expression $Command 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Command completed successfully"
            if ($Verbose -and $output) {
                Write-Host $output
            }
            return $true
        } else {
            Write-Error "Command failed with exit code $LASTEXITCODE"
            if ($output) {
                Write-Host $output
            }
            return $false
        }
    }
    catch {
        Write-Error "Command failed: $($_.Exception.Message)"
        return $false
    }
    finally {
        Pop-Location
    }
}

function Test-PackageExists {
    param([string]$PackageName)
    
    $packagePath = Join-Path (Get-Location) "packages\$PackageName"
    return Test-Path $packagePath
}

function Get-PackageFiles {
    param([string]$PackageName)
    
    $packagePath = Join-Path (Get-Location) "packages\$PackageName"
    if (Test-Path $packagePath) {
        return Get-ChildItem -Path $packagePath -Recurse -File | Select-Object -ExpandProperty Name
    }
    return @()
}

# Command handlers
function Invoke-BuildPackage {
    param([string]$PackageName)
    
    if (-not (Test-PackageExists $PackageName)) {
        Write-Error "Package '$PackageName' not found"
        return $false
    }
    
    $packagePath = Join-Path (Get-Location) "packages\$PackageName"
    return Invoke-SafeCommand -Command "pnpm build" -WorkingDirectory $packagePath -Description "Building $PackageName"
}

function Invoke-TestPackage {
    param([string]$PackageName)
    
    if (-not (Test-PackageExists $PackageName)) {
        Write-Error "Package '$PackageName' not found"
        return $false
    }
    
    $packagePath = Join-Path (Get-Location) "packages\$PackageName"
    return Invoke-SafeCommand -Command "pnpm test" -WorkingDirectory $packagePath -Description "Testing $PackageName"
}

function Invoke-TypeCheckPackage {
    param([string]$PackageName)
    
    if (-not (Test-PackageExists $PackageName)) {
        Write-Error "Package '$PackageName' not found"
        return $false
    }
    
    $packagePath = Join-Path (Get-Location) "packages\$PackageName"
    return Invoke-SafeCommand -Command "npx tsc --noEmit" -WorkingDirectory $packagePath -Description "Type checking $PackageName"
}

function Invoke-InstallDependencies {
    Write-Step "Installing dependencies..."
    return Invoke-SafeCommand -Command "pnpm install" -Description "Installing dependencies"
}

function Invoke-BuildAllPackages {
    Write-Step "Building all packages..."
    return Invoke-SafeCommand -Command "pnpm run build:deps" -Description "Building all packages"
}

function Invoke-BuildAllApps {
    Write-Step "Building all apps..."
    return Invoke-SafeCommand -Command "pnpm run build:apps" -Description "Building all apps"
}

function Invoke-FullBuild {
    Write-Step "Running full build..."
    return Invoke-SafeCommand -Command "pnpm run build" -Description "Full monorepo build"
}

function Show-PackageStatus {
    param([string]$PackageName)
    
    if (-not $PackageName) {
        Write-Error "Package name is required"
        return
    }
    
    if (-not (Test-PackageExists $PackageName)) {
        Write-Error "Package '$PackageName' not found"
        return
    }
    
    Write-ColorOutput "📦 Package Status: $PackageName" "Blue"
    Write-Host "====================================="
    
    $packagePath = Join-Path (Get-Location) "packages\$PackageName"
    $files = Get-ChildItem -Path $packagePath -Recurse -File
    
    Write-Info "Total files: $($files.Count)"
    Write-Info "Package path: $packagePath"
    
    # Check for key files
    $keyFiles = @("package.json", "tsconfig.json", "README.md", "src\index.ts")
    foreach ($file in $keyFiles) {
        $filePath = Join-Path $packagePath $file
        if (Test-Path $filePath) {
            Write-Success "✓ $file"
        } else {
            Write-Error "✗ $file (missing)"
        }
    }
    
    # Show file structure
    Write-Host ""
    Write-Info "File structure:"
    $srcPath = Join-Path $packagePath "src"
    if (Test-Path $srcPath) {
        $srcFiles = Get-ChildItem -Path $srcPath -Recurse -File
        foreach ($file in $srcFiles) {
            $relativePath = $file.FullName.Replace($packagePath, "").TrimStart("\")
            Write-Info "  $relativePath"
        }
    }
}

function Show-Help {
    Write-ColorOutput "🚀 AIBOS PowerShell Helper" "Green"
    Write-Host "================================"
    Write-Host ""
    Write-Info "Available commands:"
    Write-Host ""
    Write-Host "  build <package>     - Build a specific package"
    Write-Host "  test <package>      - Test a specific package"
    Write-Host "  typecheck <package> - Type check a specific package"
    Write-Host "  install             - Install all dependencies"
    Write-Host "  build:deps          - Build all packages"
    Write-Host "  build:apps          - Build all apps"
    Write-Host "  build:full          - Full monorepo build"
    Write-Host "  status <package>    - Show package status"
    Write-Host "  help                - Show this help"
    Write-Host ""
    Write-Info "Examples:"
    Write-Host "  .\scripts\powershell-helper.ps1 build accounting-sdk"
    Write-Host "  .\scripts\powershell-helper.ps1 status accounting-sdk"
    Write-Host "  .\scripts\powershell-helper.ps1 build:deps"
    Write-Host ""
}

# Main command handler
switch ($Command.ToLower()) {
    "build" {
        if ($Package) {
            Invoke-BuildPackage $Package
        } else {
            Write-Error "Package name required for build command"
        }
    }
    "test" {
        if ($Package) {
            Invoke-TestPackage $Package
        } else {
            Write-Error "Package name required for test command"
        }
    }
    "typecheck" {
        if ($Package) {
            Invoke-TypeCheckPackage $Package
        } else {
            Write-Error "Package name required for typecheck command"
        }
    }
    "install" {
        Invoke-InstallDependencies
    }
    "build:deps" {
        Invoke-BuildAllPackages
    }
    "build:apps" {
        Invoke-BuildAllApps
    }
    "build:full" {
        Invoke-FullBuild
    }
    "status" {
        if ($Package) {
            Show-PackageStatus $Package
        } else {
            Write-Error "Package name required for status command"
        }
    }
    "help" {
        Show-Help
    }
    default {
        Write-Error "Unknown command: $Command"
        Write-Host ""
        Show-Help
    }
} 