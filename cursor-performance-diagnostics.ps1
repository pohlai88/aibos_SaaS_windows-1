# Cursor Performance Diagnostics
# Comprehensive analysis of factors affecting Cursor's typing performance

param(
    [switch]$Verbose,
    [switch]$FixIssues
)

Write-Host "Cursor Performance Diagnostics" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

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
        "CRITICAL" { Write-Host "CRITICAL: $Message" -ForegroundColor Red -BackgroundColor Yellow }
    }
}

# Test 1: Network Connectivity and Latency
function Test-NetworkPerformance {
    Write-Status "INFO" "Testing network connectivity and latency..."

    # Test basic connectivity
    try {
        $ping8 = Test-Connection -ComputerName "8.8.8.8" -Count 5 -Quiet
        $ping1 = Test-Connection -ComputerName "1.1.1.1" -Count 5 -Quiet

        if ($ping8 -and $ping1) {
            Write-Status "PASS" "Basic internet connectivity working"
        } else {
            Write-Status "FAIL" "Internet connectivity issues detected"
            return $false
        }
    } catch {
        Write-Status "FAIL" "Network test failed: $($_.Exception.Message)"
        return $false
    }

    # Test latency
    $latency8 = (Test-Connection -ComputerName "8.8.8.8" -Count 5 | Measure-Object ResponseTime -Average).Average
    $latency1 = (Test-Connection -ComputerName "1.1.1.1" -Count 5 | Measure-Object ResponseTime -Average).Average

    Write-Status "INFO" "Average latency to 8.8.8.8: ${latency8}ms"
    Write-Status "INFO" "Average latency to 1.1.1.1: ${latency1}ms"

    if ($latency8 -gt 100 -or $latency1 -gt 100) {
        Write-Status "CRITICAL" "High network latency detected - this will severely impact Cursor's AI features"
        return $false
    } elseif ($latency8 -gt 50 -or $latency1 -gt 50) {
        Write-Status "WARN" "Elevated network latency - may cause typing delays"
        return $false
    } else {
        Write-Status "PASS" "Network latency is acceptable"
    }

    # Test Cursor API connectivity
    try {
        $cursorResponse = Invoke-WebRequest -Uri "https://api.cursor.sh" -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        Write-Status "PASS" "Cursor API connectivity: $($cursorResponse.StatusCode)"
    } catch {
        Write-Status "WARN" "Cursor API connectivity issue: $($_.Exception.Message)"
    }

    return $true
}

# Test 2: System Resources
function Test-SystemResources {
    Write-Status "INFO" "Testing system resources..."

    # Memory
    $memory = Get-CimInstance -ClassName Win32_OperatingSystem
    $totalMemoryGB = [math]::Round($memory.TotalVisibleMemorySize / 1MB, 2)
    $freeMemoryGB = [math]::Round($memory.FreePhysicalMemory / 1MB, 2)
    $memoryUsagePercent = [math]::Round((($memory.TotalVisibleMemorySize - $memory.FreePhysicalMemory) / $memory.TotalVisibleMemorySize) * 100, 2)

    Write-Status "INFO" "Total Memory: ${totalMemoryGB}GB, Free: ${freeMemoryGB}GB, Usage: ${memoryUsagePercent}%"

    if ($freeMemoryGB -lt 2) {
        Write-Status "CRITICAL" "Low available memory - this will cause severe typing lag"
        return $false
    } elseif ($freeMemoryGB -lt 4) {
        Write-Status "WARN" "Limited available memory - may cause performance issues"
    } else {
        Write-Status "PASS" "Sufficient memory available"
    }

    # CPU
    $cpuUsage = (Get-Counter "\Processor(_Total)\% Processor Time" -SampleInterval 2 -MaxSamples 3 | Measure-Object -Property CounterSamples -Average).Average
    Write-Status "INFO" "CPU Usage: ${cpuUsage}%"

    if ($cpuUsage -gt 90) {
        Write-Status "CRITICAL" "High CPU usage - will cause typing delays"
        return $false
    } elseif ($cpuUsage -gt 70) {
        Write-Status "WARN" "Elevated CPU usage - may affect performance"
    } else {
        Write-Status "PASS" "CPU usage is normal"
    }

    # Disk
    $systemDrive = Get-WmiObject -Class Win32_LogicalDisk -Filter "DeviceID='C:'"
    $freeSpaceGB = [math]::Round($systemDrive.FreeSpace / 1GB, 2)
    $diskUsagePercent = [math]::Round((($systemDrive.Size - $systemDrive.FreeSpace) / $systemDrive.Size) * 100, 2)

    Write-Status "INFO" "Disk Space: ${freeSpaceGB}GB free, Usage: ${diskUsagePercent}%"

    if ($freeSpaceGB -lt 5) {
        Write-Status "CRITICAL" "Low disk space - will cause system slowdowns"
        return $false
    } elseif ($freeSpaceGB -lt 10) {
        Write-Status "WARN" "Limited disk space - may affect performance"
    } else {
        Write-Status "PASS" "Sufficient disk space"
    }

    return $true
}

# Test 3: Cursor Process Analysis
function Test-CursorProcesses {
    Write-Status "INFO" "Analyzing Cursor processes..."

    $cursorProcesses = Get-Process -Name "cursor" -ErrorAction SilentlyContinue

    if (-not $cursorProcesses) {
        Write-Status "INFO" "No Cursor processes currently running"
        return $true
    }

    Write-Status "INFO" "Found $($cursorProcesses.Count) Cursor processes"

    foreach ($process in $cursorProcesses) {
        $memoryMB = [math]::Round($process.WorkingSet / 1MB, 2)
        $cpuTime = [math]::Round($process.CPU, 2)

        Write-Status "INFO" "Process $($process.Id): ${memoryMB}MB RAM, ${cpuTime}s CPU"

        if ($memoryMB -gt 2048) {
            Write-Status "WARN" "Process $($process.Id) using high memory: ${memoryMB}MB"
        }

        if ($cpuTime -gt 100) {
            Write-Status "WARN" "Process $($process.Id) using high CPU: ${cpuTime}s"
        }
    }

    # Check for memory leaks
    $totalMemoryMB = ($cursorProcesses | Measure-Object -Property WorkingSet -Sum).Sum / 1MB
    if ($totalMemoryMB -gt 4096) {
        Write-Status "CRITICAL" "Cursor using excessive memory: ${totalMemoryMB}MB - this will cause typing lag"
        return $false
    } elseif ($totalMemoryMB -gt 2048) {
        Write-Status "WARN" "Cursor using high memory: ${totalMemoryMB}MB"
    } else {
        Write-Status "PASS" "Cursor memory usage is normal: ${totalMemoryMB}MB"
    }

    return $true
}

# Test 4: Cursor Configuration Analysis
function Test-CursorConfiguration {
    Write-Status "INFO" "Analyzing Cursor configuration..."

    $cursorConfigPath = "$env:APPDATA\Cursor"

    if (-not (Test-Path $cursorConfigPath)) {
        Write-Status "WARN" "Cursor config directory not found"
        return $true
    }

    # Check settings.json
    $settingsPath = "$cursorConfigPath\User\settings.json"
    if (Test-Path $settingsPath) {
        try {
            $settings = Get-Content $settingsPath | ConvertFrom-Json

            # Check for performance-impacting settings
            if ($settings.'editor.suggest.snippetsPreventQuickSuggestions' -eq $true) {
                Write-Status "WARN" "Snippets preventing quick suggestions - may cause typing delays"
            }

            if ($settings.'editor.quickSuggestions' -eq $false) {
                Write-Status "WARN" "Quick suggestions disabled - will cause typing delays"
            }

            if ($settings.'editor.acceptSuggestionOnEnter' -eq $false) {
                Write-Status "WARN" "Enter key suggestion acceptance disabled"
            }

            Write-Status "PASS" "Settings.json analyzed"
        } catch {
            Write-Status "WARN" "Could not parse settings.json: $($_.Exception.Message)"
        }
    }

    # Check extensions
    $extensionsPath = "$cursorConfigPath\User\extensions"
    if (Test-Path $extensionsPath) {
        $extensions = Get-ChildItem $extensionsPath -Directory -ErrorAction SilentlyContinue
        $extCount = $extensions.Count

        Write-Status "INFO" "Found $extCount installed extensions"

        if ($extCount -gt 20) {
            Write-Status "CRITICAL" "Too many extensions ($extCount) - this will severely impact typing performance"
            return $false
        } elseif ($extCount -gt 10) {
            Write-Status "WARN" "Many extensions ($extCount) - may affect performance"
        } else {
            Write-Status "PASS" "Reasonable number of extensions ($extCount)"
        }

        # Check for known problematic extensions
        $problematicExtensions = @("vscode-python", "vscode-java", "ms-vscode.vscode-typescript-next", "ms-vscode.vscode-json")
        foreach ($ext in $extensions) {
            if ($problematicExtensions -contains $ext.Name) {
                Write-Status "WARN" "Potentially problematic extension: $($ext.Name)"
            }
        }
    }

    return $true
}

# Test 5: System Performance Issues
function Test-SystemPerformance {
    Write-Status "INFO" "Testing system performance issues..."

    # Check for high disk I/O
    $diskIO = Get-Counter "\PhysicalDisk(_Total)\% Disk Time" -SampleInterval 2 -MaxSamples 3 |
        Measure-Object -Property CounterSamples -Average | Select-Object -ExpandProperty Average

    Write-Status "INFO" "Disk I/O Usage: ${diskIO}%"

    if ($diskIO -gt 80) {
        Write-Status "CRITICAL" "High disk I/O - will cause typing delays"
        return $false
    } elseif ($diskIO -gt 60) {
        Write-Status "WARN" "Elevated disk I/O - may affect performance"
    } else {
        Write-Status "PASS" "Disk I/O is normal"
    }

    # Check for antivirus interference
    $antivirusProcesses = @("MsMpEng", "avast", "avg", "norton", "mcafee", "kaspersky")
    $foundAV = $false

    foreach ($av in $antivirusProcesses) {
        $process = Get-Process -Name $av -ErrorAction SilentlyContinue
        if ($process) {
            Write-Status "WARN" "Antivirus detected: $av - may be scanning Cursor files"
            $foundAV = $true
        }
    }

    if (-not $foundAV) {
        Write-Status "PASS" "No known antivirus interference detected"
    }

    # Check Windows Defender
    $defenderStatus = Get-MpComputerStatus
    if ($defenderStatus.RealTimeProtectionEnabled) {
        Write-Status "INFO" "Windows Defender real-time protection enabled"
    }

    return $true
}

# Test 6: Network Quality for AI Features
function Test-AINetworkQuality {
    Write-Status "INFO" "Testing network quality for AI features..."

    # Test multiple endpoints that Cursor might use
    $endpoints = @(
        "https://api.cursor.sh",
        "https://api.openai.com",
        "https://api.anthropic.com"
    )

    foreach ($endpoint in $endpoints) {
        try {
            $startTime = Get-Date
            $response = Invoke-WebRequest -Uri $endpoint -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
            $endTime = Get-Date
            $responseTime = ($endTime - $startTime).TotalMilliseconds

            Write-Status "INFO" "$endpoint response time: ${responseTime}ms"

            if ($responseTime -gt 5000) {
                Write-Status "CRITICAL" "Very slow response from $endpoint - AI features will be unusable"
                return $false
            } elseif ($responseTime -gt 2000) {
                Write-Status "WARN" "Slow response from $endpoint - AI features may be delayed"
            } else {
                Write-Status "PASS" "Good response time from $endpoint"
            }
        } catch {
            Write-Status "WARN" "Could not reach $endpoint : $($_.Exception.Message)"
        }
    }

    return $true
}

# Main diagnostic function
function Main {
    Write-Host "Starting comprehensive Cursor performance diagnostics..." -ForegroundColor Green
    Write-Host ""

    $issues = @()
    $criticalIssues = @()

    # Run all tests
    if (-not (Test-NetworkPerformance)) {
        $criticalIssues += "Network connectivity or latency issues"
    }

    if (-not (Test-SystemResources)) {
        $criticalIssues += "System resource constraints"
    }

    if (-not (Test-CursorProcesses)) {
        $issues += "Cursor process performance issues"
    }

    if (-not (Test-CursorConfiguration)) {
        $issues += "Cursor configuration problems"
    }

    if (-not (Test-SystemPerformance)) {
        $issues += "System performance issues"
    }

    if (-not (Test-AINetworkQuality)) {
        $criticalIssues += "AI network quality issues"
    }

    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host "DIAGNOSTIC SUMMARY" -ForegroundColor White
    Write-Host "=========================================" -ForegroundColor Cyan

    if ($criticalIssues.Count -gt 0) {
        Write-Status "CRITICAL" "Critical issues found that will severely impact typing performance:"
        foreach ($issue in $criticalIssues) {
            Write-Host "  - $issue" -ForegroundColor Red
        }
        Write-Host ""
    }

    if ($issues.Count -gt 0) {
        Write-Status "WARN" "Performance issues found:"
        foreach ($issue in $issues) {
            Write-Host "  - $issue" -ForegroundColor Yellow
        }
        Write-Host ""
    }

    if ($criticalIssues.Count -eq 0 -and $issues.Count -eq 0) {
        Write-Status "PASS" "No significant performance issues detected"
    }

    Write-Host ""
    Write-Host "QUICK FIXES FOR TYPING PERFORMANCE:" -ForegroundColor Yellow
    Write-Host "1. Restart Cursor with performance flags:" -ForegroundColor White
    Write-Host "   cursor --disable-gpu --disable-extensions --max-memory=4096" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Clear Cursor cache:" -ForegroundColor White
    Write-Host "   Remove-Item `"$env:APPDATA\Cursor\CachedData\*`" -Force -Recurse" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Disable problematic extensions temporarily" -ForegroundColor White
    Write-Host ""
    Write-Host "4. Check network connection and consider using a wired connection" -ForegroundColor White
    Write-Host ""
    Write-Host "5. Close other resource-intensive applications" -ForegroundColor White
}

# Run diagnostics
Main
