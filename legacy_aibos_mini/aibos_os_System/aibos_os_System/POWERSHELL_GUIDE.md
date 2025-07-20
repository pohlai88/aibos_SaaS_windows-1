# PowerShell Scripts Guide for AIBOS Restructure

## 🚀 **Quick Start Commands**

### **Validation Commands**
```bash
# Validate accounting-sdk (full validation)
npm run validate:accounting

# Validate accounting-sdk (skip build step)
npm run validate:accounting:skip-build

# Check restructure status
npm run restructure:status
```

### **PowerShell Helper Commands**
```bash
# Show PowerShell helper help
npm run ps:help

# Build a specific package
npm run ps:build accounting-sdk

# Test a specific package
npm run ps:test accounting-sdk

# Show package status
npm run ps:status accounting-sdk
```

## 📋 **Direct PowerShell Commands**

### **Validation Script**
```powershell
# Full validation
.\scripts\validate-accounting-sdk.ps1

# Skip build step
.\scripts\validate-accounting-sdk.ps1 -SkipBuild

# Verbose output
.\scripts\validate-accounting-sdk.ps1 -Verbose
```

### **PowerShell Helper**
```powershell
# Show help
.\scripts\powershell-helper.ps1 help

# Build package
.\scripts\powershell-helper.ps1 build accounting-sdk

# Test package
.\scripts\powershell-helper.ps1 test accounting-sdk

# Type check package
.\scripts\powershell-helper.ps1 typecheck accounting-sdk

# Show package status
.\scripts\powershell-helper.ps1 status accounting-sdk

# Install dependencies
.\scripts\powershell-helper.ps1 install

# Build all packages
.\scripts\powershell-helper.ps1 build:deps

# Build all apps
.\scripts\powershell-helper.ps1 build:apps

# Full build
.\scripts\powershell-helper.ps1 build:full
```

## 🔧 **Common Workflows**

### **1. Validate New Package**
```bash
# Step 1: Check status
npm run ps:status <package-name>

# Step 2: Type check
npm run ps:typecheck <package-name>

# Step 3: Build
npm run ps:build <package-name>

# Step 4: Test
npm run ps:test <package-name>
```

### **2. Full Validation Workflow**
```bash
# Step 1: Install dependencies
npm run ps:install

# Step 2: Build all packages
npm run ps:build:deps

# Step 3: Build all apps
npm run ps:build:apps

# Step 4: Full build
npm run ps:build:full
```

### **3. Package Migration Workflow**
```bash
# Step 1: Check current status
npm run restructure:status

# Step 2: Validate specific package
npm run validate:accounting

# Step 3: Update migration status
# (automatically done by validation script)

# Step 4: Continue with next package
```

## 🛠 **Troubleshooting**

### **Execution Policy Issues**
If you get execution policy errors:
```powershell
# Run as administrator and set execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### **Path Issues**
If scripts aren't found:
```powershell
# Make sure you're in the project root
cd C:\path\to\aibos_mini

# Check if scripts exist
ls scripts/
```

### **Package Not Found**
If a package isn't found:
```powershell
# Check if package exists
ls packages/

# Show package status
.\scripts\powershell-helper.ps1 status <package-name>
```

## 📊 **Script Features**

### **validate-accounting-sdk.ps1**
- ✅ Package structure validation
- ✅ Service files counting
- ✅ Utility files counting
- ✅ package.json validation
- ✅ TypeScript compilation check
- ✅ Build process test
- ✅ Import test
- ✅ Dependency check
- ✅ Automatic migration status update

### **powershell-helper.ps1**
- ✅ Safe command execution
- ✅ Color-coded output
- ✅ Package existence checking
- ✅ File structure analysis
- ✅ Build/test/typecheck commands
- ✅ Full monorepo operations

## 🎯 **Next Steps After Validation**

1. **If validation passes:**
   - Update admin-app imports
   - Start next package migration
   - Update RESTRUCTURE_CHECKLIST.md

2. **If validation fails:**
   - Fix the issues identified
   - Re-run validation
   - Check package structure

3. **Continue migration:**
   - Follow RESTRUCTURE_CHECKLIST.md
   - Use PowerShell scripts for each step
   - Update progress in MIGRATION.md

## 📝 **Notes**

- All scripts use PowerShell-compatible syntax
- No more `&&` operator issues
- Safe error handling and rollback
- Automatic progress tracking
- Color-coded output for better visibility 