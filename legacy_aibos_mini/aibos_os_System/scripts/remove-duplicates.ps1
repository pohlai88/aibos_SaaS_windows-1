# Remove Duplicate Types Script
[CmdletBinding()]
param(
    [switch]$WhatIf,
    [switch]$ConfirmEach,
    [string]$Package = "accounting-sdk"
)

# Logging functions
function Write-Step { 
    param([string]$Message) 
    Write-Host "`n[>>>] $Message" -ForegroundColor Cyan 
    Write-Verbose "Starting step: $Message"
}

function Write-Success { 
    param([string]$Message) 
    Write-Host "[OK] $Message" -ForegroundColor Green 
    Write-Verbose "Success: $Message"
}

function Write-Warning { 
    param([string]$Message) 
    Write-Host "[!!] $Message" -ForegroundColor Yellow 
    Write-Verbose "Warning: $Message"
}

function Write-Error { 
    param([string]$Message) 
    Write-Host "[XX] $Message" -ForegroundColor Red 
    Write-Verbose "Error: $Message"
}

function Write-Info { 
    param([string]$Message) 
    Write-Host "[>>] $Message" -ForegroundColor Blue 
    Write-Verbose $Message
}

function Write-Debug { 
    param([string]$Message) 
    if ($VerbosePreference -eq 'Continue') {
        Write-Host "[DEBUG] $Message" -ForegroundColor Gray 
    }
}

# Show content preview
function Show-ContentPreview {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Content,
        [Parameter(Mandatory=$true)]
        [string]$Pattern,
        [Parameter(Mandatory=$true)]
        [string]$Type
    )
    
    if ($VerbosePreference -eq 'Continue') {
        Write-Debug "Analyzing pattern for $Type..."
        
        if ($Content -match $Pattern) {
            $contentLines = $Content -split "`n"
            $matchInfo = Select-String -InputObject $Content -Pattern $Pattern -AllMatches
            
            foreach ($match in $matchInfo.Matches) {
                $currentLine = ($Content.Substring(0, $match.Index) -split "`n").Count
                $contextStart = [Math]::Max(1, $currentLine - 3)
                $contextEnd = [Math]::Min($contentLines.Count, $currentLine + 3)
                
                Write-Debug ("`nFound ${Type} at line ${currentLine}")
                Write-Debug "Context (lines $contextStart-$contextEnd):"
                Write-Debug "----------------------------------------"
                
                $contentLines[$contextStart..$contextEnd] | ForEach-Object {
                    if ($_ -match $Pattern) {
                        Write-Debug ">>> $_"
                    } else {
                        Write-Debug "    $_"
                    }
                }
                
                Write-Debug "----------------------------------------"
            }
        }
    }
}

# Step 1: Validate environment
function Test-Environment {
    param($Package)
    
    Write-Step "Step 1: Validating environment"
    
    $packagePath = "packages/$Package"
    if (-not (Test-Path $packagePath)) {
        Write-Error "Package not found: $packagePath"
        return $null
    }
    
    $srcPath = "$packagePath/src"
    if (-not (Test-Path $srcPath)) {
        Write-Error "Source directory not found: $srcPath"
        return $null
    }
    
    Write-Success "Environment validation passed"
    return @{
        PackagePath = $packagePath
        SrcPath = $srcPath
    }
}

# Step 2: Find TypeScript files
function Find-TypeScriptFiles {
    param($SrcPath)
    
    Write-Step "Step 2: Finding TypeScript files"
    
    $tsFiles = Get-ChildItem -Path $SrcPath -Recurse -Filter "*.ts" -File
    if (-not $tsFiles) {
        Write-Warning "No TypeScript files found in $SrcPath"
        return $null
    }
    
    Write-Success "Found $($tsFiles.Count) TypeScript files"
    return $tsFiles
}

# Process TypeScript files
function Update-TypeScriptFile {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [System.IO.FileInfo]$File,
        [Parameter(Mandatory=$true)]
        [string[]]$TypesToRemove,
        [switch]$WhatIf,
        [switch]$ConfirmEach
    )
    
    Write-Info "Processing: $($File.Name)"
    Write-Verbose "Full path: $($File.FullName)"
    
    try {
        $content = Get-Content $File.FullName -Raw
        if ($null -eq $content) {
            Write-Warning "Empty file: $($File.Name)"
            return $null
        }
        
        $originalContent = $content
        $changes = @()
        $removedTypes = @()
        
        # Process types one by one
        foreach ($type in $TypesToRemove) {
            Write-Verbose "Checking for type: $type"
            
            # Check interface/enum blocks with proper scope handling
            $blockPattern = ('(?ms)export\s+(interface|enum)\s+' + [regex]::Escape($type) + '\s*\{[^}]*\}')
            if ($content -match $blockPattern) {
                Show-ContentPreview -Content $content -Pattern $blockPattern -Type $type
                $changes += "Found $type declaration"
                $removedTypes += $type
            }
            
            # Check type aliases with optional type parameters
            $typePattern = ('export\s+type\s+' + [regex]::Escape($type) + '(?:<[^>]+>)?\s*=\s*[^;]+;')
            if ($content -match $typePattern) {
                Show-ContentPreview -Content $content -Pattern $typePattern -Type "$type (type alias)"
                $changes += "Found $type type alias"
                $removedTypes += $type
            }
            
            # Check for union/intersection type declarations
            $unionPattern = ('export\s+type\s+' + [regex]::Escape($type) + '\s*=\s*[^;]*(\||&)[^;]*;')
            if ($content -match $unionPattern) {
                Show-ContentPreview -Content $content -Pattern $unionPattern -Type "$type (union/intersection type)"
                $changes += "Found $type union/intersection type"
                $removedTypes += $type
            }
        }
        
        if ($changes.Count -eq 0) {
            Write-Info "No types to remove in $($File.Name)"
            return $null
        }
        
        Write-Info "Found types in $($File.Name):"
        $changes | ForEach-Object { Write-Info "  - $_" }
        
        return @{
            File = $File
            Types = $removedTypes
            Content = $content
            Changes = $changes
        }
    }
    catch {
        Write-Error "Error processing $($File.Name): $($_.Exception.Message)"
        Write-Verbose $_.Exception.StackTrace
        return $null
    }
}

# Apply changes to TypeScript file
function Set-TypeScriptContent {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [PSCustomObject]$FileInfo,
        [Parameter(Mandatory=$true)]
        [string[]]$TypesToRemove,
        [switch]$WhatIf,
        [switch]$ConfirmEach
    )
    
    if (-not $FileInfo) { return $false }
    
    try {
        $content = $FileInfo.Content
        $originalContent = $content
        $changes = @()
        
        Write-Verbose "Applying changes to $($FileInfo.File.Name)"
        
        # Remove type declarations
        foreach ($type in $TypesToRemove) {
            Write-Verbose "Removing type: $type"
            
            # Remove interface/enum blocks
            $blockPattern = ('(?ms)export\s+(interface|enum)\s+' + [regex]::Escape($type) + '\s*\{[^}]*\}')
            if ($content -match $blockPattern) {
                $content = $content -replace $blockPattern, ''
                $changes += "Removed $type declaration"
            }
            
            # Remove type aliases
            $typePattern = ('export\s+type\s+' + [regex]::Escape($type) + '(?:<[^>]+>)?\s*=\s*[^;]+;')
            if ($content -match $typePattern) {
                $content = $content -replace $typePattern, ''
                $changes += "Removed $type type alias"
            }
            
            # Remove union/intersection types
            $unionPattern = ('export\s+type\s+' + [regex]::Escape($type) + '\s*=\s*[^;]*(\||&)[^;]*;')
            if ($content -match $unionPattern) {
                $content = $content -replace $unionPattern, ''
                $changes += "Removed $type union/intersection type"
            }
        }
        
        # Update imports
        if ($content -match 'from\s+[''"`"]\.\./types[''"`"]') {
            $content = $content -replace 'from\s+[''"`"]\.\./types[''"`"]', "from '@aibos/core-types'"
            $changes += "Updated import paths"
        }
        
        # Add new import if needed
        if ($FileInfo.Types.Count -gt 0 -and $content -notmatch "from '@aibos/core-types'") {
            $importTypes = ($FileInfo.Types | Select-Object -Unique) -join ', '
            $importLine = "import { $importTypes } from '@aibos/core-types';"
            $content = $importLine + [Environment]::NewLine + [Environment]::NewLine + $content
            $changes += "Added core-types import"
        }
        
        # Clean up empty lines
        $content = $content -replace '(\r?\n\s*){3,}', "`n`n"
        
        if ($content -ne $originalContent) {
            if ($WhatIf) {
                Write-Warning "DRY RUN: Would modify $($FileInfo.File.Name)"
                Write-Info "Changes:"
                $changes | ForEach-Object { Write-Info "  - $_" }
                return $true
            }
            
            if ($ConfirmEach) {
                Write-Info "Proposed changes for $($FileInfo.File.Name):"
                $changes | ForEach-Object { Write-Info "  - $_" }
                
                Write-Debug "Preview of changes:"
                Show-ContentPreview -Content $content -Pattern '(export|import).*@aibos/core-types' -Type 'Modified Content'
                
                $response = Read-Host "Apply these changes? (y/n)"
                if ($response -ne 'y') {
                    Write-Warning "Skipped $($FileInfo.File.Name)"
                    return $true
                }
            }
            
            Set-Content -Path $FileInfo.File.FullName -Value $content -NoNewline
            Write-Success "Updated $($FileInfo.File.Name)"
            Write-Verbose "Applied changes: $($changes -join ', ')"
        }
        return $true
    }
    catch {
        Write-Error "Error updating $($FileInfo.File.Name): $($_.Exception.Message)"
        Write-Verbose $_.Exception.StackTrace
        return $false
    }
}

# Main execution
try {
    # Step 1: Validate environment
    $env = Test-Environment -Package $Package
    if (-not $env) { 
        Write-Error "Environment validation failed"
        exit 1 
    }
    
    # Step 2: Find files
    $files = Find-TypeScriptFiles -SrcPath $env.SrcPath
    if (-not $files) { 
        Write-Warning "No TypeScript files found"
        exit 0 
    }
    
    # Types to process
    $typesToRemove = @(
        "UserContext",
        "ValidationResult", 
        "ValidationError",
        "ValidationWarning",
        "PerformanceMetrics",
        "AuditAction",
        "ApprovalStatus",
        "AccountingError",
        "CacheEntry"
    )
    
    # Process each file
    $success = $true
    foreach ($file in $files) {
        Write-Verbose "`nProcessing file: $($file.Name)"
        
        $fileInfo = Update-TypeScriptFile -File $file -TypesToRemove $typesToRemove -WhatIf:$WhatIf -ConfirmEach:$ConfirmEach
        if ($fileInfo) {
            $result = Set-TypeScriptContent -FileInfo $fileInfo -TypesToRemove $typesToRemove -WhatIf:$WhatIf -ConfirmEach:$ConfirmEach
            if (-not $result) {
                $success = $false
                break
            }
        }
    }
    
    if ($success) {
        Write-Success "Script completed successfully"
        exit 0
    }
    else {
        Write-Error "Script completed with errors"
        exit 1
    }
}
catch {
    Write-Error "Script failed: $($_.Exception.Message)"
    Write-Verbose $_.Exception.StackTrace
    exit 1
}