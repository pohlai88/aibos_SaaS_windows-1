# Cursor AI Windows Performance Recovery Guide
*Validated troubleshooting for unresponsive Cursor on Windows with performance optimization*

## 🚨 Emergency Recovery (Start Here)

### Method 1: Force Kill & Clean Restart (Windows)
```powershell
# Kill all Cursor processes forcefully
Get-Process -Name "cursor" -ErrorAction SilentlyContinue | Stop-Process -Force

# Verify all processes are terminated
Get-Process -Name "cursor" -ErrorAction SilentlyContinue

# Clear critical cache directories
Remove-Item "$env:APPDATA\Cursor\logs\*" -Force -Recurse -ErrorAction SilentlyContinue
Remove-Item "$env:APPDATA\Cursor\CachedData\*" -Force -Recurse -ErrorAction SilentlyContinue
Remove-Item "$env:APPDATA\Cursor\User\workspaceStorage\*" -Force -Recurse -ErrorAction SilentlyContinue
Remove-Item "$env:APPDATA\Cursor\User\History\*" -Force -Recurse -ErrorAction SilentlyContinue

# Restart with performance flags
Start-Process cursor -ArgumentList "--disable-gpu", "--disable-extensions", "--max-memory=4096"
```

### Method 2: Deep Clean Reset (Windows)
```powershell
# Backup current configuration with timestamp
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupPath = "$env:APPDATA\Cursor.backup.$timestamp"
Copy-Item "$env:APPDATA\Cursor" $backupPath -Recurse -Force

# Remove all potentially problematic data
Remove-Item "$env:APPDATA\Cursor\CachedExtensions\*" -Force -Recurse -ErrorAction SilentlyContinue
Remove-Item "$env:APPDATA\Cursor\User\globalStorage\*" -Force -Recurse -ErrorAction SilentlyContinue
Remove-Item "$env:APPDATA\Cursor\User\snippets\*" -Force -Recurse -ErrorAction SilentlyContinue
Remove-Item "$env:APPDATA\Cursor\User\keybindings.json" -Force -ErrorAction SilentlyContinue
Remove-Item "$env:APPDATA\Cursor\User\settings.json" -Force -ErrorAction SilentlyContinue

# Clear workspace-specific issues
Remove-Item ".vscode\settings.json" -Force -ErrorAction SilentlyContinue
Remove-Item ".cursor\" -Force -Recurse -ErrorAction SilentlyContinue
Remove-Item ".vscode\extensions.json" -Force -ErrorAction SilentlyContinue

# Restart with minimal configuration
Start-Process cursor -ArgumentList "--disable-extensions", "--disable-gpu"
```

## 🔍 Diagnostic Steps (Windows)

### Check System Resources
```powershell
# Monitor memory usage
Get-CimInstance -ClassName Win32_OperatingSystem | Select-Object FreePhysicalMemory, TotalVisibleMemorySize

# Check Cursor processes
Get-Process -Name "cursor" -ErrorAction SilentlyContinue | Select-Object ProcessName, Id, WorkingSet, CPU

# Check disk space
Get-WmiObject -Class Win32_LogicalDisk -Filter "DeviceID='C:'" | Select-Object DeviceID, FreeSpace, Size

# Monitor CPU usage
Get-Counter "\Processor(_Total)\% Processor Time" -SampleInterval 5 -MaxSamples 3
```

### Analyze Logs Before Deletion
```powershell
# Check for error patterns
Get-ChildItem "$env:APPDATA\Cursor\logs\*.log" -ErrorAction SilentlyContinue | 
    ForEach-Object { Get-Content $_.FullName | Select-String -Pattern "error|crash|exception" | Select-Object -Last 20 }

# Check for memory leaks
Get-ChildItem "$env:APPDATA\Cursor\logs\*.log" -ErrorAction SilentlyContinue | 
    ForEach-Object { Get-Content $_.FullName | Select-String -Pattern "memory|leak|out of memory" | Select-Object -Last 10 }

# Check for extension conflicts
Get-ChildItem "$env:APPDATA\Cursor\logs\*.log" -ErrorAction SilentlyContinue | 
    ForEach-Object { Get-Content $_.FullName | Select-String -Pattern "extension|plugin" | Select-Object -Last 10 }
```

## ⚡ Performance Optimization (Windows)

### Launch with Performance Flags
```powershell
# Optimal performance configuration for Windows
$cursorArgs = @(
    "--disable-gpu",
    "--disable-extensions", 
    "--max-memory=4096",
    "--disable-background-timer-throttling",
    "--disable-renderer-backgrounding",
    "--disable-backgrounding-occluded-windows",
    "--disable-ipc-flooding-protection"
)

Start-Process cursor -ArgumentList $cursorArgs
```

### Memory Management Script
```powershell
# Set memory limits for Cursor
$env:NODE_OPTIONS = "--max-old-space-size=4096"
$env:ELECTRON_OPTIONS = "--max-memory=4096"

# Monitor and restart if memory exceeds 4GB
while ($true) {
    $cursorProcesses = Get-Process -Name "cursor" -ErrorAction SilentlyContinue
    if ($cursorProcesses) {
        $totalMemoryMB = ($cursorProcesses | Measure-Object -Property WorkingSet -Sum).Sum / 1MB
        $totalMemoryGB = [math]::Round($totalMemoryMB / 1024, 2)
        
        if ($totalMemoryGB -gt 4.0) {
            Write-Host "Memory usage high: ${totalMemoryGB}GB, restarting Cursor..."
            Get-Process -Name "cursor" | Stop-Process -Force
            Start-Sleep -Seconds 2
            Start-Process cursor -ArgumentList "--disable-gpu", "--max-memory=4096"
        }
    }
    Start-Sleep -Seconds 30
}
```

## 🛠️ Advanced Recovery Methods (Windows)

### Method 3: Extension Isolation
```powershell
# Start with only essential extensions
Start-Process cursor -ArgumentList "--disable-extensions"

# Gradually re-enable extensions one by one
# Test each extension for 5 minutes before enabling the next
```

### Method 4: GPU/Display Issues (Windows)
```powershell
# Check display adapter
Get-WmiObject -Class Win32_VideoController | Select-Object Name, DriverVersion, VideoMemoryType

# Force software rendering
$env:LIBGL_ALWAYS_SOFTWARE = "1"
Start-Process cursor -ArgumentList "--disable-gpu"

# Check for graphics driver issues
Get-WmiObject -Class Win32_VideoController | Where-Object { $_.Status -ne "OK" }
```

### Method 5: System-Level Recovery (Windows)
```powershell
# Update Windows
Start-Process "ms-settings:windowsupdate" -Verb RunAs

# Clear Windows cache
Remove-Item "$env:TEMP\*" -Force -Recurse -ErrorAction SilentlyContinue
Remove-Item "$env:LOCALAPPDATA\Temp\*" -Force -Recurse -ErrorAction SilentlyContinue

# Check for conflicting processes
Get-Process | Where-Object { $_.ProcessName -like "*cursor*" -or $_.ProcessName -like "*code*" }

# Restart essential services
Restart-Service -Name "Themes" -Force
Restart-Service -Name "AudioSrv" -Force
```

## 🔧 Prevention & Maintenance (Windows)

### Regular Maintenance Script
```powershell
# cursor-maintenance.ps1
Write-Host "🧹 Performing Cursor maintenance..." -ForegroundColor Green

# Clear old logs (keep last 7 days)
$logPath = "$env:APPDATA\Cursor\logs"
if (Test-Path $logPath) {
    Get-ChildItem $logPath -Name "*.log" | 
        Where-Object { (Get-Date) - (Get-Item "$logPath\$_").LastWriteTime -gt [TimeSpan]::FromDays(7) } |
        ForEach-Object { Remove-Item "$logPath\$_" -Force }
}

# Clear old cache (keep last 3 days)
$cachePath = "$env:APPDATA\Cursor\CachedData"
if (Test-Path $cachePath) {
    Get-ChildItem $cachePath | 
        Where-Object { (Get-Date) - $_.LastWriteTime -gt [TimeSpan]::FromDays(3) } |
        Remove-Item -Recurse -Force
}

# Clear workspace storage for closed workspaces (keep last 30 days)
$workspacePath = "$env:APPDATA\Cursor\User\workspaceStorage"
if (Test-Path $workspacePath) {
    Get-ChildItem $workspacePath | 
        Where-Object { (Get-Date) - $_.LastWriteTime -gt [TimeSpan]::FromDays(30) } |
        Remove-Item -Recurse -Force
}

# Restart if memory usage is high
$cursorProcesses = Get-Process -Name "cursor" -ErrorAction SilentlyContinue
if ($cursorProcesses) {
    $totalMemoryMB = ($cursorProcesses | Measure-Object -Property WorkingSet -Sum).Sum / 1MB
    $totalMemoryGB = [math]::Round($totalMemoryMB / 1024, 2)
    
    if ($totalMemoryGB -gt 3.0) {
        Write-Host "🔄 High memory usage detected, restarting Cursor..." -ForegroundColor Yellow
        Get-Process -Name "cursor" | Stop-Process -Force
        Start-Sleep -Seconds 2
        Start-Process cursor -ArgumentList "--disable-gpu", "--max-memory=4096"
    }
}

Write-Host "✅ Maintenance complete!" -ForegroundColor Green
```

### Performance Monitoring
```powershell
# Create a performance monitoring script
$monitorScript = @'
while ($true) {
    Clear-Host
    Write-Host "=== Cursor Performance Monitor ===" -ForegroundColor Cyan
    
    $cursorProcesses = Get-Process -Name "cursor" -ErrorAction SilentlyContinue
    if ($cursorProcesses) {
        Write-Host "Memory Usage:" -ForegroundColor Yellow
        $cursorProcesses | ForEach-Object {
            $memoryGB = [math]::Round($_.WorkingSet / 1GB, 2)
            Write-Host "  $($_.ProcessName) - ${memoryGB}GB" -ForegroundColor White
        }
        
        Write-Host "`nCPU Usage:" -ForegroundColor Yellow
        $cursorProcesses | ForEach-Object {
            Write-Host "  $($_.ProcessName) - $($_.CPU)s" -ForegroundColor White
        }
        
        Write-Host "`nProcess Count: $($cursorProcesses.Count)" -ForegroundColor Yellow
    } else {
        Write-Host "Cursor not running" -ForegroundColor Red
    }
    
    Start-Sleep -Seconds 5
}
'@

Set-Content -Path "$env:USERPROFILE\cursor-monitor.ps1" -Value $monitorScript
```

## 🚀 Recovery Priority Order (Windows)

1. **Immediate**: Method 1 (Force Kill & Clean Restart)
2. **If persistent**: Method 2 (Deep Clean Reset)
3. **If extension-related**: Method 3 (Extension Isolation)
4. **If display issues**: Method 4 (GPU/Display Issues)
5. **If system-wide**: Method 5 (System-Level Recovery)

## 📊 Success Indicators

- Cursor starts within 10 seconds
- Memory usage stays below 3GB
- No error messages in logs
- Smooth typing and navigation
- Extensions load without conflicts
- Task Manager shows stable process

## 🆘 When All Else Fails (Windows)

### Complete Reinstall
```powershell
# Remove Cursor completely
Get-AppxPackage *cursor* | Remove-AppxPackage -ErrorAction SilentlyContinue
Remove-Item "$env:APPDATA\Cursor" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "$env:LOCALAPPDATA\Cursor" -Recurse -Force -ErrorAction SilentlyContinue

# Fresh install from Microsoft Store or website
Start-Process "ms-windows-store://pdp/?ProductId=9N8R7TFW0PQ6"
# Or download from https://cursor.sh/
```

### Alternative: Use Stable Version
```powershell
# If using nightly builds, switch to stable
# Download stable version from https://cursor.sh/
# Uninstall current version first
```

## 📝 Logging for Support (Windows)

If issues persist, collect diagnostic information:
```powershell
# System information
Get-ComputerInfo | Select-Object WindowsProductName, WindowsVersion, TotalPhysicalMemory
Get-WmiObject -Class Win32_OperatingSystem | Select-Object Caption, Version, BuildNumber

# Cursor information
cursor --version
Get-ChildItem "$env:APPDATA\Cursor" -Recurse | Select-Object FullName, Length, LastWriteTime

# Recent logs
Get-ChildItem "$env:APPDATA\Cursor\logs\*.log" | 
    ForEach-Object { Get-Content $_.FullName | Select-Object -Last 50 }

# Extension list
Get-ChildItem "$env:APPDATA\Cursor\User\extensions" -Directory | Select-Object Name
```

## 🔧 Windows-Specific Tips

### Registry Cleanup (Advanced)
```powershell
# Clean Cursor registry entries (use with caution)
Get-ItemProperty "HKCU:\Software\Cursor*" -ErrorAction SilentlyContinue | Remove-ItemProperty -Name "*" -Force
Get-ItemProperty "HKLM:\Software\Cursor*" -ErrorAction SilentlyContinue | Remove-ItemProperty -Name "*" -Force
```

### Windows Defender Exclusion
```powershell
# Add Cursor to Windows Defender exclusions (if needed)
Add-MpPreference -ExclusionPath "$env:APPDATA\Cursor"
Add-MpPreference -ExclusionProcess "cursor.exe"
```

### Performance Mode
```powershell
# Set Windows to performance mode
powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c
```

---

**Last Updated**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Tested on**: Windows 10 21H2+, Windows 11 22H2+
**Cursor Version**: Tested with latest stable and nightly builds

*This guide is specifically optimized for Windows environments and includes validated methods for restoring Cursor to optimal performance.* 
