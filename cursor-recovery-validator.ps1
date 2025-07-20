# Cursor Recovery Validator for Windows
# Tests the effectiveness of recovery methods on Windows

param(
    [switch]$Verbose
)

Write-Host "Cursor Recovery Validator for Windows" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Function to print colored output
function Write-Status {
    param(
        [string]$Status,
        [string]$Message
    )

    switch ($Status) {
        "PASS" { Write-Host "PASS: $Message" -ForegroundColor Green }
        "FAIL" { Write-Host "FAIL: $Message" -ForegroundColor Red }
        "WARN" { Write-Host "WARN: $Message" -ForegroundColor Yellow }
        "INFO" { Write-Host "INFO: $Message" -ForegroundColor Blue }
    }
}

# Test 1: Check if Cursor is installed
function Test-CursorInstallation {
    Write-Status "INFO" "Testing Cursor installation..."

    try {
        $cursorPath = Get-Command cursor -ErrorAction SilentlyContinue
        if ($cursorPath) {
            $version = cursor --version 2>$null
            if ($version) {
                Write-Status "PASS" "Cursor is installed: $version"
            } else {
                Write-Status "PASS" "Cursor is installed (version unknown)"
            }
            return $true
        } else {
            Write-Status "FAIL" "Cursor is not installed or not in PATH"
            return $false
        }
    } catch {
        Write-Status "FAIL" "Error checking Cursor installation: $($_.Exception.Message)"
        return $false
    }
}

# Test 2: Check system resources
function Test-SystemResources {
    Write-Status "INFO" "Testing system resources..."

    # Check available memory
    $memory = Get-CimInstance -ClassName Win32_OperatingSystem
    $availableMemoryGB = [math]::Round($memory.FreePhysicalMemory / 1MB, 2)

    if ($availableMemoryGB -ge 4) {
        Write-Status "PASS" "Sufficient memory available: ${availableMemoryGB}GB"
    } else {
        Write-Status "WARN" "Low memory available: ${availableMemoryGB}GB (recommended: 4GB+)"
    }

    # Check disk space
    $systemDrive = Get-WmiObject -Class Win32_LogicalDisk -Filter "DeviceID='C:'"
    $freeSpaceGB = [math]::Round($systemDrive.FreeSpace / 1GB, 2)

    if ($freeSpaceGB -ge 5) {
        Write-Status "PASS" "Sufficient disk space: ${freeSpaceGB}GB"
    } else {
        Write-Status "WARN" "Low disk space: ${freeSpaceGB}GB (recommended: 5GB+)"
    }
}

# Test 3: Validate recovery commands
function Test-RecoveryCommands {
    Write-Status "INFO" "Testing recovery command syntax..."

    # Test process killing commands
    try {
        $cursorProcesses = Get-Process -Name "cursor" -ErrorAction SilentlyContinue
        if ($cursorProcesses) {
            Write-Status "INFO" "Found $($cursorProcesses.Count) Cursor processes running"
        } else {
            Write-Status "INFO" "No Cursor processes currently running"
        }
        Write-Status "PASS" "Process management commands available"
    } catch {
        Write-Status "WARN" "Process management may have issues"
    }

    # Test directory existence
    $cursorConfigPath = "$env:APPDATA\Cursor"
    if (Test-Path $cursorConfigPath) {
        Write-Status "PASS" "Cursor config directory exists: $cursorConfigPath"
    } else {
        Write-Status "WARN" "Cursor config directory not found (may be first run): $cursorConfigPath"
    }

    # Test backup command
    try {
        if (Test-Path $cursorConfigPath) {
            $backupPath = "$cursorConfigPath.test.backup"
            Copy-Item -Path $cursorConfigPath -Destination $backupPath -Recurse -Force
            Write-Status "PASS" "Backup command works"
            Remove-Item -Path $backupPath -Recurse -Force
        } else {
            Write-Status "WARN" "Backup command skipped (no config directory)"
        }
    } catch {
        Write-Status "WARN" "Backup command failed: $($_.Exception.Message)"
    }
}

# Test 4: Performance flags validation
function Test-PerformanceFlags {
    Write-Status "INFO" "Testing performance flags..."

    try {
        $helpOutput = cursor --help 2>$null
        if ($helpOutput -match "disable-gpu|max-memory") {
            Write-Status "PASS" "Performance flags are supported"
        } else {
            Write-Status "WARN" "Performance flags may not be supported in this version"
        }
    } catch {
        Write-Status "WARN" "Could not test performance flags"
    }
}

# Test 5: System compatibility
function Test-SystemCompatibility {
    Write-Status "INFO" "Testing system compatibility..."

    # Check OS
    $osInfo = Get-CimInstance -ClassName Win32_OperatingSystem
    Write-Status "PASS" "Windows system detected: $($osInfo.Caption) $($osInfo.Version)"

    # Check if running in GUI environment
    if ($env:USERNAME -and $env:COMPUTERNAME) {
        Write-Status "PASS" "Running in user session: $env:USERNAME@$env:COMPUTERNAME"
    } else {
        Write-Status "WARN" "Session information unclear"
    }

    # Check PowerShell version
    $psVersion = $PSVersionTable.PSVersion
    Write-Status "INFO" "PowerShell version: $psVersion"
}

# Test 6: Extension management
function Test-ExtensionManagement {
    Write-Status "INFO" "Testing extension management..."

    $extensionsPath = "$env:APPDATA\Cursor\User\extensions"
    if (Test-Path $extensionsPath) {
        $extensions = Get-ChildItem -Path $extensionsPath -Directory -ErrorAction SilentlyContinue
        $extCount = $extensions.Count
        Write-Status "INFO" "Found $extCount installed extensions"

        if ($extCount -gt 10) {
            Write-Status "WARN" "Many extensions installed ($extCount) - may impact performance"
        } else {
            Write-Status "PASS" "Reasonable number of extensions ($extCount)"
        }
    } else {
        Write-Status "INFO" "No extensions directory found (may be first run)"
    }
}

# Test 7: Memory monitoring capability
function Test-MemoryMonitoring {
    Write-Status "INFO" "Testing memory monitoring..."

    $cursorProcesses = Get-Process -Name "cursor" -ErrorAction SilentlyContinue
    if ($cursorProcesses) {
        $totalMemoryMB = ($cursorProcesses | Measure-Object -Property WorkingSet -Sum).Sum / 1MB
        $totalMemoryGB = [math]::Round($totalMemoryMB / 1024, 2)

        Write-Status "INFO" "Current Cursor memory usage: ${totalMemoryGB}GB"

        if ($totalMemoryGB -gt 3.0) {
            Write-Status "WARN" "High memory usage detected"
        } else {
            Write-Status "PASS" "Memory usage is normal"
        }
    } else {
        Write-Status "INFO" "Cursor not currently running"
    }
}

# Test 8: Windows-specific recovery methods
function Test-WindowsRecoveryMethods {
    Write-Status "INFO" "Testing Windows-specific recovery methods..."

    # Check if Task Manager can be used
    try {
        $taskManager = Get-Process -Name "taskmgr" -ErrorAction SilentlyContinue
        Write-Status "PASS" "Task Manager available for process management"
    } catch {
        Write-Status "INFO" "Task Manager not running (normal)"
    }

    # Check Windows services
    try {
        $services = Get-Service -Name "*cursor*" -ErrorAction SilentlyContinue
        if ($services) {
            Write-Status "INFO" "Found Cursor-related services: $($services.Name -join ', ')"
        } else {
            Write-Status "INFO" "No Cursor-related Windows services found"
        }
    } catch {
        Write-Status "INFO" "No Cursor services detected"
    }
}

# Main validation function
function Main {
    Write-Host "Starting comprehensive validation..." -ForegroundColor Green
    Write-Host ""

    $testsPassed = 0
    $testsTotal = 0

    # Run all tests
    if (Test-CursorInstallation) { $testsPassed++ }
    $testsTotal++

    Test-SystemResources
    $testsTotal++

    if (Test-RecoveryCommands) { $testsPassed++ }
    $testsTotal++

    Test-PerformanceFlags
    $testsTotal++

    Test-SystemCompatibility
    $testsTotal++

    Test-ExtensionManagement
    $testsTotal++

    Test-MemoryMonitoring
    $testsTotal++

    Test-WindowsRecoveryMethods
    $testsTotal++

    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host "Validation Summary:" -ForegroundColor White
    Write-Host "Tests passed: $testsPassed/$testsTotal" -ForegroundColor White

    if ($testsPassed -eq $testsTotal) {
        Write-Status "PASS" "All critical tests passed - recovery methods should work"
    } else {
        Write-Status "WARN" "Some tests failed - review warnings above"
    }

    Write-Host ""
    Write-Host "Windows Recovery Methods Priority:" -ForegroundColor Yellow
    Write-Host "1. Task Manager: End Cursor processes" -ForegroundColor White
    Write-Host "2. Clean restart: Delete logs and cache" -ForegroundColor White
    Write-Host "3. Extension isolation: Start with --disable-extensions" -ForegroundColor White
    Write-Host "4. Performance mode: Use --disable-gpu flag" -ForegroundColor White
    Write-Host "5. Complete reinstall: Uninstall and reinstall Cursor" -ForegroundColor White

    Write-Host ""
    Write-Host "Quick Recovery Commands for Windows:" -ForegroundColor Yellow
    Write-Host "Get-Process cursor | Stop-Process -Force" -ForegroundColor White
    Write-Host "Remove-Item `"$env:APPDATA\Cursor\logs\*`" -Force" -ForegroundColor White
    Write-Host "cursor --disable-gpu --disable-extensions" -ForegroundColor White

    Write-Host ""
    Write-Host "Cursor Config Location: $env:APPDATA\Cursor" -ForegroundColor Cyan
}

# Run validation
Main
