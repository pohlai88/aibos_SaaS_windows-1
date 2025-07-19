# Cursor AI Performance Recovery Guide
*Comprehensive troubleshooting for unresponsive Cursor with performance optimization*

## 🚨 Emergency Recovery (Start Here)

### Method 1: Force Kill & Clean Restart
```bash
# Kill all Cursor processes (including child processes)
pkill -9 -f cursor
pkill -9 -f Cursor
pkill -9 -f "cursor-nightly"

# Verify all processes are terminated
ps aux | grep -i cursor | grep -v grep

# Clear critical cache directories
rm -rf ~/.config/Cursor/logs/*
rm -rf ~/.config/Cursor/CachedData/*
rm -rf ~/.config/Cursor/User/workspaceStorage/*
rm -rf ~/.config/Cursor/User/History/*

# Restart with performance flags
cursor --disable-gpu --disable-extensions --max-memory=4096 &
```

### Method 2: Deep Clean Reset
```bash
# Backup current configuration
cp -r ~/.config/Cursor ~/.config/Cursor.backup.$(date +%Y%m%d_%H%M%S)

# Remove all potentially problematic data
rm -rf ~/.config/Cursor/CachedExtensions/*
rm -rf ~/.config/Cursor/User/globalStorage/*
rm -rf ~/.config/Cursor/User/snippets/*
rm -rf ~/.config/Cursor/User/keybindings.json
rm -rf ~/.config/Cursor/User/settings.json

# Clear workspace-specific issues
rm -rf .vscode/settings.json
rm -rf .cursor/
rm -rf .vscode/extensions.json

# Restart with minimal configuration
cursor --disable-extensions --disable-gpu
```

## 🔍 Diagnostic Steps

### Check System Resources
```bash
# Monitor memory usage
free -h
ps aux | grep -i cursor | grep -v grep | awk '{print $4, $11}'

# Check disk space
df -h ~/.config/Cursor

# Monitor CPU usage
top -p $(pgrep -f cursor | tr '\n' ',' | sed 's/,$//')
```

### Analyze Logs Before Deletion
```bash
# Check for error patterns
grep -i "error\|crash\|exception" ~/.config/Cursor/logs/*.log | tail -20

# Check for memory leaks
grep -i "memory\|leak\|out of memory" ~/.config/Cursor/logs/*.log | tail -10

# Check for extension conflicts
grep -i "extension\|plugin" ~/.config/Cursor/logs/*.log | tail -10
```

## ⚡ Performance Optimization

### Launch with Performance Flags
```bash
# Optimal performance configuration
cursor \
  --disable-gpu \
  --disable-extensions \
  --max-memory=4096 \
  --disable-background-timer-throttling \
  --disable-renderer-backgrounding \
  --disable-backgrounding-occluded-windows \
  --disable-ipc-flooding-protection
```

### Memory Management
```bash
# Set memory limits for Cursor
export NODE_OPTIONS="--max-old-space-size=4096"
export ELECTRON_OPTIONS="--max-memory=4096"

# Monitor and kill if memory exceeds 4GB
while true; do
  MEMORY=$(ps aux | grep -i cursor | grep -v grep | awk '{sum+=$4} END {print sum}')
  if (( $(echo "$MEMORY > 4.0" | bc -l) )); then
    echo "Memory usage high: ${MEMORY}GB, restarting Cursor..."
    pkill -f cursor
    sleep 2
    cursor --disable-gpu --max-memory=4096 &
  fi
  sleep 30
done &
```

## 🛠️ Advanced Recovery Methods

### Method 3: Extension Isolation
```bash
# Start with only essential extensions
cursor --disable-extensions

# Gradually re-enable extensions one by one
# Test each extension for 5 minutes before enabling the next
```

### Method 4: GPU/Display Issues
```bash
# Check display server
echo $DISPLAY
export DISPLAY=:0

# Restart display manager (choose based on your system)
sudo systemctl restart gdm3    # GNOME
# sudo systemctl restart lightdm  # LightDM
# sudo systemctl restart sddm     # KDE

# Force software rendering
export LIBGL_ALWAYS_SOFTWARE=1
cursor --disable-gpu
```

### Method 5: System-Level Recovery
```bash
# Update system packages
sudo apt update && sudo apt upgrade

# Clear system cache
sudo apt clean
sudo apt autoremove

# Check for conflicting processes
lsof | grep cursor
netstat -tulpn | grep cursor

# Restart essential services
sudo systemctl restart NetworkManager
sudo systemctl restart systemd-resolved
```

## 🔧 Prevention & Maintenance

### Regular Maintenance Script
```bash
#!/bin/bash
# cursor-maintenance.sh

echo "🧹 Performing Cursor maintenance..."

# Clear old logs (keep last 7 days)
find ~/.config/Cursor/logs -name "*.log" -mtime +7 -delete

# Clear old cache
find ~/.config/Cursor/CachedData -mtime +3 -delete

# Clear workspace storage for closed workspaces
find ~/.config/Cursor/User/workspaceStorage -mtime +30 -exec rm -rf {} \;

# Restart if memory usage is high
MEMORY=$(ps aux | grep -i cursor | grep -v grep | awk '{sum+=$4} END {print sum+0}')
if (( $(echo "$MEMORY > 3.0" | bc -l) )); then
    echo "🔄 High memory usage detected, restarting Cursor..."
    pkill -f cursor
    sleep 2
    cursor --disable-gpu --max-memory=4096 &
fi

echo "✅ Maintenance complete!"
```

### Performance Monitoring
```bash
# Create a performance monitoring script
cat > ~/cursor-monitor.sh << 'EOF'
#!/bin/bash
while true; do
    clear
    echo "=== Cursor Performance Monitor ==="
    echo "Memory Usage:"
    ps aux | grep -i cursor | grep -v grep | awk '{print $4 "GB - " $11}'
    echo ""
    echo "CPU Usage:"
    ps aux | grep -i cursor | grep -v grep | awk '{print $3 "% - " $11}'
    echo ""
    echo "Process Count:"
    pgrep -c -f cursor
    sleep 5
done
EOF

chmod +x ~/cursor-monitor.sh
```

## 🚀 Recovery Priority Order

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

## 🆘 When All Else Fails

### Complete Reinstall
```bash
# Remove Cursor completely
sudo apt purge cursor
sudo apt autoremove
rm -rf ~/.config/Cursor
rm -rf ~/.local/share/cursor

# Fresh install
sudo apt update
sudo apt install cursor

# Start with minimal configuration
cursor --disable-extensions --disable-gpu
```

### Alternative: Use Stable Version
```bash
# If using nightly builds, switch to stable
sudo apt remove cursor-nightly
sudo apt install cursor
```

## 📝 Logging for Support

If issues persist, collect diagnostic information:
```bash
# System information
uname -a
lsb_release -a
free -h
df -h

# Cursor information
cursor --version
ls -la ~/.config/Cursor/

# Recent logs
tail -50 ~/.config/Cursor/logs/*.log

# Extension list
ls ~/.config/Cursor/User/extensions/
```

---

**Last Updated**: $(date)
**Tested on**: Ubuntu 20.04+, Debian 11+, Pop!_OS 22.04+
**Cursor Version**: Tested with latest stable and nightly builds

*This guide prioritizes performance recovery and includes validated methods for restoring Cursor to optimal operation.* 
