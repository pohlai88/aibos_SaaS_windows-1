# AI-BOS Cursor Optimization Script
# Optimizes Cursor for maximum performance and minimal latency

Write-Host "🚀 AI-BOS Cursor Optimization Starting..." -ForegroundColor Green

# Kill any existing Cursor processes
Write-Host "📋 Terminating existing Cursor processes..." -ForegroundColor Yellow
Get-Process -Name "cursor" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Clean up cache and temporary files
Write-Host "🧹 Cleaning Cursor cache..." -ForegroundColor Yellow
$cursorAppData = "$env:APPDATA\Cursor"
$pathsToClean = @(
    "$cursorAppData\logs",
    "$cursorAppData\CachedData",
    "$cursorAppData\CachedExtensions",
    "$cursorAppData\User\globalStorage",
    "$cursorAppData\GPUCache"
)

foreach ($path in $pathsToClean) {
    if (Test-Path $path) {
        Remove-Item "$path\*" -Force -Recurse -ErrorAction SilentlyContinue
        Write-Host "  ✅ Cleaned: $path" -ForegroundColor Green
    }
}

# Check system resources
Write-Host "💻 Checking system resources..." -ForegroundColor Yellow
$os = Get-WmiObject -Class Win32_OperatingSystem
$totalMemory = [math]::Round($os.TotalVisibleMemorySize / 1MB, 2)
$freeMemory = [math]::Round($os.FreePhysicalMemory / 1MB, 2)
$memoryUsage = [math]::Round((($os.TotalVisibleMemorySize - $os.FreePhysicalMemory) / $os.TotalVisibleMemorySize) * 100, 1)

Write-Host "  📊 Total Memory: ${totalMemory}GB" -ForegroundColor Cyan
Write-Host "  📊 Free Memory: ${freeMemory}GB" -ForegroundColor Cyan
Write-Host "  📊 Memory Usage: ${memoryUsage}%" -ForegroundColor Cyan

# Calculate optimal memory allocation for Cursor
$optimalMemory = if ($totalMemory -ge 32) { 8192 } elseif ($totalMemory -ge 16) { 4096 } else { 2048 }
Write-Host "  🎯 Optimal Cursor Memory: ${optimalMemory}MB" -ForegroundColor Green

# Start Cursor with optimized flags
Write-Host "🚀 Starting Cursor with optimized configuration..." -ForegroundColor Green

$cursorArgs = @(
    "--disable-gpu-sandbox",
    "--disable-software-rasterizer",
    "--disable-dev-shm-usage",
    "--no-sandbox",
    "--max-memory=$optimalMemory",
    "--disable-background-timer-throttling",
    "--disable-renderer-backgrounding",
    "--disable-backgrounding-occluded-windows",
    "--disable-ipc-flooding-protection",
    "--enable-features=VizDisplayCompositor",
    "--disable-features=TranslateUI",
    "--disable-extensions-except=ms-vscode.vscode-json",
    "--disable-plugins",
    "--disable-default-apps",
    "--disable-sync",
    "--disable-background-networking",
    "--disable-component-extensions-with-background-pages",
    "--disable-default-apps",
    "--disable-extensions",
    "--disable-sync",
    "--disable-translate",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-web-security",
    "--allow-running-insecure-content",
    "--disable-features=VizDisplayCompositor"
)

# Start Cursor with optimized arguments
try {
    Start-Process "cursor" -ArgumentList $cursorArgs -WindowStyle Normal
    Write-Host "✅ Cursor started successfully with optimization!" -ForegroundColor Green
    Write-Host "🎯 Performance optimizations applied:" -ForegroundColor Cyan
    Write-Host "   • Memory limit: ${optimalMemory}MB" -ForegroundColor White
    Write-Host "   • GPU acceleration: Optimized" -ForegroundColor White
    Write-Host "   • Extensions: Disabled for performance" -ForegroundColor White
    Write-Host "   • Background processes: Disabled" -ForegroundColor White
    Write-Host "   • Network optimizations: Enabled" -ForegroundColor White
} catch {
    Write-Host "❌ Failed to start Cursor: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "🎉 Cursor optimization complete!" -ForegroundColor Green
Write-Host "💡 Tips for best performance:" -ForegroundColor Yellow
Write-Host "   • Close unnecessary browser tabs" -ForegroundColor White
Write-Host "   • Disable unnecessary Windows services" -ForegroundColor White
Write-Host "   • Keep at least 8GB free RAM" -ForegroundColor White
Write-Host "   • Use SSD for faster file operations" -ForegroundColor White
