# Cursor Optimization Script
# This script will optimize Cursor performance by stopping unnecessary processes

Write-Host "🔧 Cursor Optimization Script Starting..." -ForegroundColor Green

# Function to safely stop processes
function Stop-ProcessSafely {
    param(
        [string]$ProcessName,
        [string]$Description
    )

    try {
        $processes = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
        if ($processes) {
            Write-Host "🛑 Stopping $Description processes..." -ForegroundColor Yellow
            $processes | ForEach-Object {
                Write-Host "  - Stopping $($_.ProcessName) (PID: $($_.Id)) - Memory: $([math]::Round($_.WorkingSet / 1MB, 2))MB" -ForegroundColor Gray
                $_.Kill()
            }
            Start-Sleep -Seconds 2
            Write-Host "✅ $Description processes stopped successfully" -ForegroundColor Green
        }
        else {
            Write-Host "ℹ️  No $Description processes found" -ForegroundColor Blue
        }
    }
    catch {
        Write-Host "❌ Error stopping $Description processes: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Function to check and stop high-memory Cursor processes
function Optimize-CursorProcesses {
    Write-Host "`n🔍 Analyzing Cursor processes..." -ForegroundColor Cyan

    $cursorProcesses = Get-Process -Name "Cursor" -ErrorAction SilentlyContinue
    if (-not $cursorProcesses) {
        Write-Host "ℹ️  No Cursor processes found" -ForegroundColor Blue
        return
    }

    Write-Host "📊 Found $($cursorProcesses.Count) Cursor processes:" -ForegroundColor Yellow

    # Group processes by memory usage
    $highMemory = $cursorProcesses | Where-Object { $_.WorkingSet -gt 200MB }
    $mediumMemory = $cursorProcesses | Where-Object { $_.WorkingSet -gt 100MB -and $_.WorkingSet -le 200MB }
    $lowMemory = $cursorProcesses | Where-Object { $_.WorkingSet -le 100MB }

    Write-Host "  🔴 High Memory (>200MB): $($highMemory.Count) processes" -ForegroundColor Red
    Write-Host "  🟡 Medium Memory (100-200MB): $($mediumMemory.Count) processes" -ForegroundColor Yellow
    Write-Host "  🟢 Low Memory (<100MB): $($lowMemory.Count) processes" -ForegroundColor Green

    # Show memory usage details
    $totalMemory = ($cursorProcesses | Measure-Object WorkingSet -Sum).Sum
    Write-Host "  📈 Total Memory Usage: $([math]::Round($totalMemory / 1MB, 2))MB" -ForegroundColor Cyan

    # Stop high memory processes (keep the main one)
    if ($highMemory.Count -gt 1) {
        Write-Host "`n🛑 Stopping excessive high-memory Cursor processes..." -ForegroundColor Yellow
        $processesToStop = $highMemory | Sort-Object WorkingSet -Descending | Select-Object -Skip 1
        foreach ($process in $processesToStop) {
            Write-Host "  - Stopping Cursor (PID: $($process.Id)) - Memory: $([math]::Round($process.WorkingSet / 1MB, 2))MB" -ForegroundColor Gray
            try {
                $process.Kill()
            }
            catch {
                Write-Host "    ❌ Failed to stop process $($process.Id)" -ForegroundColor Red
            }
        }
    }
}

# Function to clean up Node.js processes
function Cleanup-NodeProcesses {
    Write-Host "`n🔍 Checking for Node.js processes..." -ForegroundColor Cyan

    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        Write-Host "📊 Found $($nodeProcesses.Count) Node.js processes:" -ForegroundColor Yellow
        foreach ($process in $nodeProcesses) {
            Write-Host "  - Node.js (PID: $($process.Id)) - Memory: $([math]::Round($process.WorkingSet / 1MB, 2))MB" -ForegroundColor Gray
        }

        $response = Read-Host "`n❓ Do you want to stop all Node.js processes? (y/N)"
        if ($response -eq 'y' -or $response -eq 'Y') {
            Stop-ProcessSafely -ProcessName "node" -Description "Node.js"
        }
    }
    else {
        Write-Host "ℹ️  No Node.js processes found" -ForegroundColor Blue
    }
}

# Function to clean up TypeScript processes
function Cleanup-TypeScriptProcesses {
    Write-Host "`n🔍 Checking for TypeScript processes..." -ForegroundColor Cyan

    $tscProcesses = Get-Process -Name "tsc" -ErrorAction SilentlyContinue
    if ($tscProcesses) {
        Write-Host "📊 Found $($tscProcesses.Count) TypeScript processes:" -ForegroundColor Yellow
        foreach ($process in $tscProcesses) {
            Write-Host "  - TypeScript (PID: $($process.Id)) - Memory: $([math]::Round($process.WorkingSet / 1MB, 2))MB" -ForegroundColor Gray
        }

        $response = Read-Host "`n❓ Do you want to stop all TypeScript processes? (y/N)"
        if ($response -eq 'y' -or $response -eq 'Y') {
            Stop-ProcessSafely -ProcessName "tsc" -Description "TypeScript"
        }
    }
    else {
        Write-Host "ℹ️  No TypeScript processes found" -ForegroundColor Blue
    }
}

# Function to clean up npm processes
function Cleanup-NpmProcesses {
    Write-Host "`n🔍 Checking for npm processes..." -ForegroundColor Cyan

    $npmProcesses = Get-Process -Name "npm" -ErrorAction SilentlyContinue
    if ($npmProcesses) {
        Write-Host "📊 Found $($npmProcesses.Count) npm processes:" -ForegroundColor Yellow
        foreach ($process in $npmProcesses) {
            Write-Host "  - npm (PID: $($process.Id)) - Memory: $([math]::Round($process.WorkingSet / 1MB, 2))MB" -ForegroundColor Gray
        }

        $response = Read-Host "`n❓ Do you want to stop all npm processes? (y/N)"
        if ($response -eq 'y' -or $response -eq 'Y') {
            Stop-ProcessSafely -ProcessName "npm" -Description "npm"
        }
    }
    else {
        Write-Host "ℹ️  No npm processes found" -ForegroundColor Blue
    }
}

# Function to clean up temporary files
function Cleanup-TempFiles {
    Write-Host "`n🧹 Cleaning up temporary files..." -ForegroundColor Cyan

    $tempPaths = @(
        "$env:TEMP\*cursor*",
        "$env:TEMP\*node*",
        "$env:TEMP\*npm*",
        "$env:TEMP\*tsc*",
        "$env:LOCALAPPDATA\Temp\*cursor*",
        "$env:LOCALAPPDATA\Temp\*node*"
    )

    foreach ($path in $tempPaths) {
        try {
            $files = Get-ChildItem -Path $path -ErrorAction SilentlyContinue
            if ($files) {
                Write-Host "  - Cleaning $($files.Count) files from $path" -ForegroundColor Gray
                Remove-Item -Path $path -Recurse -Force -ErrorAction SilentlyContinue
            }
        }
        catch {
            # Ignore errors for temp file cleanup
        }
    }

    Write-Host "✅ Temporary files cleaned" -ForegroundColor Green
}

# Function to show final status
function Show-FinalStatus {
    Write-Host "`n📊 Final Status Report:" -ForegroundColor Cyan

    $remainingCursor = Get-Process -Name "Cursor" -ErrorAction SilentlyContinue
    if ($remainingCursor) {
        $totalMemory = ($remainingCursor | Measure-Object WorkingSet -Sum).Sum
        Write-Host "  🖥️  Cursor Processes: $($remainingCursor.Count)" -ForegroundColor Green
        Write-Host "  💾 Total Memory: $([math]::Round($totalMemory / 1MB, 2))MB" -ForegroundColor Green
    }
    else {
        Write-Host "  🖥️  Cursor Processes: 0" -ForegroundColor Red
    }

    $remainingNode = Get-Process -Name "node" -ErrorAction SilentlyContinue
    Write-Host "  📦 Node.js Processes: $($remainingNode.Count)" -ForegroundColor Green

    $remainingNpm = Get-Process -Name "npm" -ErrorAction SilentlyContinue
    Write-Host "  📦 npm Processes: $($remainingNpm.Count)" -ForegroundColor Green

    $remainingTsc = Get-Process -Name "tsc" -ErrorAction SilentlyContinue
    Write-Host "  📝 TypeScript Processes: $($remainingTsc.Count)" -ForegroundColor Green
}

# Main execution
try {
    Write-Host "🚀 Starting Cursor optimization..." -ForegroundColor Green

    # Optimize Cursor processes
    Optimize-CursorProcesses

    # Clean up development processes
    Cleanup-NodeProcesses
    Cleanup-TypeScriptProcesses
    Cleanup-NpmProcesses

    # Clean up temporary files
    Cleanup-TempFiles

    # Show final status
    Show-FinalStatus

    Write-Host "`n✅ Cursor optimization completed!" -ForegroundColor Green
    Write-Host "💡 Recommendation: Restart Cursor for best performance" -ForegroundColor Yellow

}
catch {
    Write-Host "❌ Error during optimization: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
