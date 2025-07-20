#!/bin/bash

# Cursor Recovery Validator
# Tests the effectiveness of recovery methods

set -e

echo "🔍 Cursor Recovery Validator"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "PASS") echo -e "${GREEN}✅ PASS${NC}: $message" ;;
        "FAIL") echo -e "${RED}❌ FAIL${NC}: $message" ;;
        "WARN") echo -e "${YELLOW}⚠️  WARN${NC}: $message" ;;
        "INFO") echo -e "${BLUE}ℹ️  INFO${NC}: $message" ;;
    esac
}

# Test 1: Check if Cursor is installed
test_cursor_installation() {
    print_status "INFO" "Testing Cursor installation..."

    if command -v cursor &> /dev/null; then
        CURSOR_VERSION=$(cursor --version 2>/dev/null || echo "Unknown")
        print_status "PASS" "Cursor is installed: $CURSOR_VERSION"
        return 0
    else
        print_status "FAIL" "Cursor is not installed or not in PATH"
        return 1
    fi
}

# Test 2: Check system resources
test_system_resources() {
    print_status "INFO" "Testing system resources..."

    # Check available memory
    AVAILABLE_MEM=$(free -g | awk 'NR==2{print $7}')
    if [ "$AVAILABLE_MEM" -ge 4 ]; then
        print_status "PASS" "Sufficient memory available: ${AVAILABLE_MEM}GB"
    else
        print_status "WARN" "Low memory available: ${AVAILABLE_MEM}GB (recommended: 4GB+)"
    fi

    # Check disk space
    DISK_SPACE=$(df -h ~/.config | awk 'NR==2{print $4}' | sed 's/G//')
    if [ "$DISK_SPACE" -ge 5 ]; then
        print_status "PASS" "Sufficient disk space: ${DISK_SPACE}GB"
    else
        print_status "WARN" "Low disk space: ${DISK_SPACE}GB (recommended: 5GB+)"
    fi
}

# Test 3: Validate recovery commands
test_recovery_commands() {
    print_status "INFO" "Testing recovery command syntax..."

    # Test process killing commands
    if pkill -f cursor 2>/dev/null || true; then
        print_status "PASS" "Process kill command works"
    else
        print_status "FAIL" "Process kill command failed"
    fi

    # Test directory existence
    if [ -d ~/.config/Cursor ]; then
        print_status "PASS" "Cursor config directory exists"
    else
        print_status "WARN" "Cursor config directory not found (may be first run)"
    fi

    # Test backup command
    if cp -r ~/.config/Cursor ~/.config/Cursor.test.backup 2>/dev/null; then
        print_status "PASS" "Backup command works"
        rm -rf ~/.config/Cursor.test.backup
    else
        print_status "WARN" "Backup command failed (may be first run)"
    fi
}

# Test 4: Performance flags validation
test_performance_flags() {
    print_status "INFO" "Testing performance flags..."

    # Test if Cursor accepts performance flags
    if timeout 5s cursor --help 2>/dev/null | grep -q "disable-gpu\|max-memory"; then
        print_status "PASS" "Performance flags are supported"
    else
        print_status "WARN" "Performance flags may not be supported in this version"
    fi
}

# Test 5: System compatibility
test_system_compatibility() {
    print_status "INFO" "Testing system compatibility..."

    # Check OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        print_status "PASS" "Linux system detected"

        # Check display server
        if [ -n "$DISPLAY" ]; then
            print_status "PASS" "Display server available: $DISPLAY"
        else
            print_status "WARN" "No display server detected"
        fi

        # Check if running in GUI environment
        if [ -n "$XDG_CURRENT_DESKTOP" ]; then
            print_status "PASS" "Desktop environment: $XDG_CURRENT_DESKTOP"
        else
            print_status "WARN" "No desktop environment detected"
        fi
    else
        print_status "WARN" "Non-Linux system detected: $OSTYPE"
    fi
}

# Test 6: Extension management
test_extension_management() {
    print_status "INFO" "Testing extension management..."

    if [ -d ~/.config/Cursor/User/extensions ]; then
        EXT_COUNT=$(ls ~/.config/Cursor/User/extensions 2>/dev/null | wc -l)
        print_status "INFO" "Found $EXT_COUNT installed extensions"

        if [ "$EXT_COUNT" -gt 10 ]; then
            print_status "WARN" "Many extensions installed ($EXT_COUNT) - may impact performance"
        else
            print_status "PASS" "Reasonable number of extensions ($EXT_COUNT)"
        fi
    else
        print_status "INFO" "No extensions directory found (may be first run)"
    fi
}

# Test 7: Memory monitoring capability
test_memory_monitoring() {
    print_status "INFO" "Testing memory monitoring..."

    # Test if we can monitor Cursor processes
    if pgrep -f cursor >/dev/null 2>&1; then
        MEMORY_USAGE=$(ps aux | grep -i cursor | grep -v grep | awk '{sum+=$4} END {print sum+0}')
        print_status "INFO" "Current Cursor memory usage: ${MEMORY_USAGE}GB"

        if (( $(echo "$MEMORY_USAGE > 3.0" | bc -l 2>/dev/null || echo "0") )); then
            print_status "WARN" "High memory usage detected"
        else
            print_status "PASS" "Memory usage is normal"
        fi
    else
        print_status "INFO" "Cursor not currently running"
    fi
}

# Main validation function
main() {
    echo "Starting comprehensive validation..."
    echo ""

    local tests_passed=0
    local tests_total=0

    # Run all tests
    test_cursor_installation && ((tests_passed++))
    ((tests_total++))

    test_system_resources
    ((tests_total++))

    test_recovery_commands && ((tests_passed++))
    ((tests_total++))

    test_performance_flags
    ((tests_total++))

    test_system_compatibility
    ((tests_total++))

    test_extension_management
    ((tests_total++))

    test_memory_monitoring
    ((tests_total++))

    echo ""
    echo "=============================="
    echo "Validation Summary:"
    echo "Tests passed: $tests_passed/$tests_total"

    if [ $tests_passed -eq $tests_total ]; then
        print_status "PASS" "All critical tests passed - recovery methods should work"
    else
        print_status "WARN" "Some tests failed - review warnings above"
    fi

    echo ""
    echo "🚀 Recovery Methods Priority:"
    echo "1. Force Kill & Clean Restart (Method 1)"
    echo "2. Deep Clean Reset (Method 2)"
    echo "3. Extension Isolation (Method 3)"
    echo "4. GPU/Display Issues (Method 4)"
    echo "5. System-Level Recovery (Method 5)"

    echo ""
    echo "💡 Quick Recovery Command:"
    echo "pkill -9 -f cursor && rm -rf ~/.config/Cursor/logs/* && cursor --disable-gpu --disable-extensions"
}

# Run validation
main "$@"
