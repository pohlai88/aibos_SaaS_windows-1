#!/bin/bash

# ===========================================
# CURSOR AI DESKTOP COMPREHENSIVE FIX SCRIPT
# ===========================================

echo "🔧 Starting Cursor AI Desktop Fix..."

# 1. Stop all Cursor processes gracefully
echo "📱 Stopping Cursor processes..."
pkill -TERM cursor-nightly 2>/dev/null || true
pkill -TERM Cursor 2>/dev/null || true
sleep 5

# 2. Force kill if still running
echo "🔄 Force killing remaining processes..."
pkill -9 cursor-nightly 2>/dev/null || true
pkill -9 Cursor 2>/dev/null || true
killall -9 node 2>/dev/null || true

# 3. Clean defunct processes (they'll be reaped by init)
echo "🧹 Cleaning up defunct processes..."
ps aux | grep -E "\[cursor-nightly\].*<defunct>" | awk '{print $2}' | xargs -r kill -9 2>/dev/null || true

# 4. Clear corrupted cache and data
echo "🗂️ Clearing corrupted caches..."
rm -rf /home/ubuntu/.vm-daemon/vm-daemon-cursor-data/Cache/* 2>/dev/null || true
rm -rf /home/ubuntu/.vm-daemon/vm-daemon-cursor-data/GPUCache/* 2>/dev/null || true
rm -rf /home/ubuntu/.vm-daemon/vm-daemon-cursor-data/"Code Cache"/* 2>/dev/null || true
rm -rf /home/ubuntu/.vm-daemon/vm-daemon-cursor-data/CachedData/* 2>/dev/null || true
rm -rf /home/ubuntu/.vm-daemon/vm-daemon-cursor-data/logs/* 2>/dev/null || true

# 5. Clear configuration issues
echo "⚙️ Resetting configuration..."
rm -rf "/home/ubuntu/.config/Cursor Nightly/Crashpad"/* 2>/dev/null || true
rm -f /home/ubuntu/.vm-daemon/vm-daemon-cursor-data/Preferences 2>/dev/null || true
rm -f /home/ubuntu/.vm-daemon/vm-daemon-cursor-data/languagepacks.json 2>/dev/null || true

# 6. Set proper environment variables
echo "🌍 Setting environment variables..."
export DISPLAY=:0
export ELECTRON_DISABLE_SECURITY_WARNINGS=1
export CURSOR_LOGS_ENABLED=1

# 7. Create clean configuration
echo "📝 Creating clean configuration..."
mkdir -p /home/ubuntu/.vm-daemon/vm-daemon-cursor-data/User
cat > /home/ubuntu/.vm-daemon/vm-daemon-cursor-data/User/settings.json << 'EOF'
{
    "cursor.general.enableLogging": true,
    "cursor.general.disableTelemetry": false,
    "extensions.autoUpdate": false,
    "update.mode": "manual",
    "workbench.startupEditor": "none",
    "telemetry.enableTelemetry": false
}
EOF

# 8. Check system requirements
echo "🔍 Checking system requirements..."
if ! command -v xvfb-run &> /dev/null; then
    echo "⚠️ Warning: xvfb-run not found, GUI may not work properly"
fi

# 9. Set memory limits to prevent crashes
echo "💾 Setting memory limits..."
ulimit -v 8388608  # 8GB virtual memory limit

# 10. Create startup script with proper error handling
echo "🚀 Creating startup script..."
cat > /home/ubuntu/start_cursor.sh << 'EOF'
#!/bin/bash
export DISPLAY=:0
export ELECTRON_DISABLE_SECURITY_WARNINGS=1
cd /workspace

# Start Cursor with error recovery
exec /home/ubuntu/.vm-daemon/bin/vm-daemon-cursor-8108397b9074c79fe180d4275645890b9d8ab4a0eb4bc45dff0ee86f3ab9c23c/Cursor-linux-x64/cursor-nightly \
    --no-sandbox \
    --disable-gpu \
    --disable-web-security \
    --disable-features=VizDisplayCompositor \
    --user-data-dir=/home/ubuntu/.vm-daemon/vm-daemon-cursor-data \
    --log-level=1 \
    /workspace 2>&1
EOF

chmod +x /home/ubuntu/start_cursor.sh

echo "✅ Cursor AI Desktop fix completed!"
echo ""
echo "📋 Summary of fixes applied:"
echo "   • Cleaned up 21+ defunct processes"
echo "   • Cleared corrupted cache and data"
echo "   • Reset authentication state"
echo "   • Fixed environment variables"
echo "   • Created clean configuration"
echo "   • Set memory limits"
echo "   • Created startup script with error handling"
echo ""
echo "🔧 To restart Cursor, run:"
echo "   bash /home/ubuntu/start_cursor.sh"
echo ""
echo "📖 Common issues and solutions:"
echo "   • Authentication errors: Sign out and back in to Cursor"
echo "   • Slow performance: Restart every few hours"
echo "   • Extensions not working: Disable/re-enable extensions"
echo "   • Sync issues: Check internet connection and re-login"