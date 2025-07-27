# Cursor & Dev Process Optimization Script - Optimized Version
Write-Host "`nStarting Cursor & Dev Process Optimization..." -ForegroundColor Green

function Stop-Processes {
  param(
    [string]$Name,
    [string]$Label,
    [switch]$PromptUser = $true
  )

  $procs = Get-Process -Name $Name -ErrorAction SilentlyContinue
  if ($procs) {
    Write-Host "`nFound $($procs.Count) $Label processes:" -ForegroundColor Yellow
    $procs | ForEach-Object {
      Write-Host ("  - {0} (PID: {1}) - Memory: {2}MB" -f $_.ProcessName, $_.Id, [math]::Round($_.WorkingSet / 1MB, 1))
    }

    $shouldStop = $true
    if ($PromptUser) {
      $response = Read-Host "`nStop all $Label processes? (y/N)"
      $shouldStop = $response -match '^[Yy]$'
    }

    if ($shouldStop) {
      foreach ($proc in $procs) {
        try {
          $proc.Kill()
          Write-Host "Stopped $Label process PID $($proc.Id)" -ForegroundColor Green
        }
        catch {
          Write-Host "Failed to stop PID $($proc.Id): $($_.Exception.Message)" -ForegroundColor Red
        }
      }
    }
  }
  else {
    Write-Host "No $Label processes found" -ForegroundColor Blue
  }
}

function Report-Processes {
  param([string]$Name, [string]$Label)

  $procs = Get-Process -Name $Name -ErrorAction SilentlyContinue
  if ($procs) {
    $total = ($procs | Measure-Object WorkingSet -Sum).Sum
    Write-Host ("  {0}: {1} process(es), Total Memory: {2}MB" -f $Label, $procs.Count, [math]::Round($total / 1MB, 1)) -ForegroundColor Cyan
  }
  else {
    Write-Host ("  {0}: 0 process(es)" -f $Label) -ForegroundColor DarkGray
  }
}

# Analyze Cursor Processes
$cursorProcs = Get-Process -Name "Cursor" -ErrorAction SilentlyContinue
if ($cursorProcs) {
  Write-Host "`nAnalyzing Cursor memory usage..." -ForegroundColor Cyan
  $sorted = $cursorProcs | Sort-Object WorkingSet -Descending

  $high = $sorted | Where-Object { $_.WorkingSet -gt 200MB }
  $medium = $sorted | Where-Object { $_.WorkingSet -gt 100MB -and $_.WorkingSet -le 200MB }
  $low = $sorted | Where-Object { $_.WorkingSet -le 100MB }

  Write-Host "  High Memory (>200MB): $($high.Count)" -ForegroundColor Red
  Write-Host "  Medium (100-200MB): $($medium.Count)" -ForegroundColor Yellow
  Write-Host "  Low (<100MB): $($low.Count)" -ForegroundColor Green

  $totalMem = ($cursorProcs | Measure-Object WorkingSet -Sum).Sum
  Write-Host "  Total Cursor Memory: $([math]::Round($totalMem / 1MB, 1))MB" -ForegroundColor Cyan

  # Stop all but highest memory Cursor instance
  if ($high.Count -gt 1) {
    Write-Host "`nStopping excessive high-memory Cursor processes..." -ForegroundColor Magenta
    $high | Select-Object -Skip 1 | ForEach-Object {
      try {
        $_.Kill()
        Write-Host "Killed PID $($_.Id) (Memory: $([math]::Round($_.WorkingSet / 1MB, 1))MB)" -ForegroundColor Green
      }
      catch {
        Write-Host "Failed to kill PID $($_.Id)" -ForegroundColor Red
      }
    }
  }
}
else {
  Write-Host "`nNo Cursor processes found" -ForegroundColor Blue
}

# Stop Other Dev-Related Processes
Stop-Processes -Name "node" -Label "Node.js"
Stop-Processes -Name "tsc" -Label "TypeScript"
Stop-Processes -Name "npm" -Label "npm"

# Final Status Report
Write-Host "`nFinal Status Report:" -ForegroundColor Cyan
Report-Processes -Name "Cursor" -Label "Cursor"
Report-Processes -Name "node" -Label "Node.js"
Report-Processes -Name "tsc" -Label "TypeScript"
Report-Processes -Name "npm" -Label "npm"

Write-Host "`nOptimization Complete. It is recommended to restart Cursor if issues persist." -ForegroundColor Green
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
