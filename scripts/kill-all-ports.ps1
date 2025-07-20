#!/usr/bin/env powershell

<#
.SYNOPSIS
    AI-BOS Port Killer - Kill all processes on ports and prepare for localhost development
.DESCRIPTION
    This script kills all Node.js processes, common development servers, and frees up ports
    for localhost development. It's designed to clean up your development environment.
#>

Write-Host "🔥 AI-BOS Port Killer - Preparing localhost environment" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan

# Function to kill processes by name
function Kill-ProcessByName {
    param([string]$ProcessName)
    
    try {
        $processes = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
        if ($processes) {
            Write-Host "🎯 Killing $($processes.Count) $ProcessName process(es)..." -ForegroundColor Yellow
            $processes | Stop-Process -Force
            Write-Host "✅ $ProcessName processes killed" -ForegroundColor Green
        } else {
            Write-Host "ℹ️  No $ProcessName processes found" -ForegroundColor Gray
        }
    } catch {
        Write-Host "❌ Error killing $ProcessName processes: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Function to kill processes on specific ports
function Kill-ProcessOnPort {
    param([int]$Port)
    
    try {
        $netstat = netstat -ano | findstr ":$Port "
        if ($netstat) {
            $pids = $netstat | ForEach-Object {
                ($_ -split '\s+')[-1]
            } | Where-Object { $_ -match '^\d+$' } | Sort-Object -Unique
            
            foreach ($pid in $pids) {
                if ($pid -and $pid -ne "0") {
                    Write-Host "🎯 Killing process $pid on port $Port..." -ForegroundColor Yellow
                    taskkill /F /PID $pid 2>$null
                }
            }
            Write-Host "✅ Port $Port cleared" -ForegroundColor Green
        } else {
            Write-Host "ℹ️  Port $Port is free" -ForegroundColor Gray
        }
    } catch {
        Write-Host "❌ Error clearing port $Port: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Kill common development processes
Write-Host "\n🔄 Killing common development processes..." -ForegroundColor Cyan

# Node.js and related processes
Kill-ProcessByName "node"
Kill-ProcessByName "npm"
Kill-ProcessByName "yarn"
Kill-ProcessByName "pnpm"
Kill-ProcessByName "bun"

# Development servers
Kill-ProcessByName "next-server"
Kill-ProcessByName "vite"
Kill-ProcessByName "webpack"
Kill-ProcessByName "rollup"
Kill-ProcessByName "parcel"

# Database and cache servers
Kill-ProcessByName "redis-server"
Kill-ProcessByName "mongod"
Kill-ProcessByName "postgres"
Kill-ProcessByName "mysql"

# Docker processes (if needed)
Kill-ProcessByName "docker"
Kill-ProcessByName "dockerd"

# Clear common development ports
Write-Host "\n🔄 Clearing common development ports..." -ForegroundColor Cyan

$commonPorts = @(3000, 3001, 3002, 3003, 4000, 4001, 5000, 5001, 5173, 8000, 8001, 8080, 8081, 9000, 9001)

foreach ($port in $commonPorts) {
    Kill-ProcessOnPort $port
}

# Clear any additional ports that might be in use
Write-Host "\n🔄 Scanning for additional Node.js processes on ports..." -ForegroundColor Cyan

try {
    $nodeProcesses = netstat -ano | findstr "node" | ForEach-Object {
        if ($_ -match ":([0-9]+)\s") {
            $matches[1]
        }
    } | Sort-Object -Unique
    
    foreach ($port in $nodeProcesses) {
        if ($port -and $commonPorts -notcontains [int]$port) {
            Kill-ProcessOnPort ([int]$port)
        }
    }
} catch {
    Write-Host "ℹ️  No additional Node.js processes found" -ForegroundColor Gray
}

# Clean up temporary files and caches
Write-Host "\n🧹 Cleaning up development caches..." -ForegroundColor Cyan

try {
    # Clear npm cache
    if (Get-Command npm -ErrorAction SilentlyContinue) {
        Write-Host "🗑️  Clearing npm cache..." -ForegroundColor Yellow
        npm cache clean --force 2>$null
    }
    
    # Clear yarn cache
    if (Get-Command yarn -ErrorAction SilentlyContinue) {
        Write-Host "🗑️  Clearing yarn cache..." -ForegroundColor Yellow
        yarn cache clean 2>$null
    }
    
    Write-Host "✅ Caches cleared" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Some caches could not be cleared" -ForegroundColor Yellow
}

# Final port check
Write-Host "\n🔍 Final port availability check..." -ForegroundColor Cyan

foreach ($port in $commonPorts) {
    $inUse = netstat -ano | findstr ":$port " | Measure-Object | Select-Object -ExpandProperty Count
    if ($inUse -eq 0) {
        Write-Host "✅ Port $port is available" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Port $port is still in use" -ForegroundColor Yellow
    }
}

Write-Host "\n🎉 Localhost environment prepared!" -ForegroundColor Green
Write-Host "You can now start your development servers." -ForegroundColor Green
Write-Host "\n💡 Common commands to start development:" -ForegroundColor Cyan
Write-Host "   • npm run dev" -ForegroundColor White
Write-Host "   • yarn dev" -ForegroundColor White
Write-Host "   • npm start" -ForegroundColor White
Write-Host "   • yarn start" -ForegroundColor White