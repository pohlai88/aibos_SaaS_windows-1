# Quick Deployment Guide

## 🚀 Beta Deployment Steps

### Prerequisites Check
```bash
# 1. Verify you're in the right directory
pwd
# Should show: .../shared/ui-components

# 2. Check current version
npm version
# Should show: 1.0.0-beta.2

# 3. Verify build works
npm run build
# Should complete without errors

# 4. Check lint thresholds
npm run lint:threshold
# Should show: All thresholds passed! ✅
```

### NPM Registry Deployment

#### Option 1: Public NPM Registry
```bash
# Make sure you're logged in to npm
npm whoami

# If not logged in:
npm login

# Deploy beta version
npm publish --tag beta --access public
```

#### Option 2: GitHub Packages
```bash
# Set registry to GitHub packages
npm config set registry https://npm.pkg.github.com

# Login to GitHub packages (use your GitHub token)
npm login --registry=https://npm.pkg.github.com

# Deploy
npm publish --tag beta
```

### Verification
```bash
# Check published package
npm view @aibos/ui-components versions --json

# Test installation in another project
npm install @aibos/ui-components@beta
```

## 🔧 Troubleshooting

### Build Fails
```bash
npm run clean
npm install
npm run build
```

### Lint Threshold Exceeded
```bash
npm run cleanup:track
npm run cleanup:phase1
npm run lint:threshold
```

### Authentication Issues
```bash
# For NPM
npm logout
npm login

# For GitHub Packages
npm config set registry https://npm.pkg.github.com
npm login --registry=https://npm.pkg.github.com
```

### Permission Issues
```bash
# Check package name availability
npm info @aibos/ui-components

# If name taken, update package.json name field
```

## 📦 Package Info

- **Name**: @aibos/ui-components
- **Version**: 1.0.0-beta.2
- **Tag**: beta
- **Access**: public
- **Registry**: npm (default) or GitHub packages

## ✅ Success Indicators

After successful deployment:
1. Package appears in npm registry
2. `npm view @aibos/ui-components@beta` returns package info
3. Can install with `npm install @aibos/ui-components@beta`
4. All 118+ components available for import

## 🔄 Next Steps After Deployment

1. **Test Integration**: Install in a test project
2. **Update Documentation**: Add usage examples
3. **Announce Beta**: Share with team/community  
4. **Gather Feedback**: Monitor issues and usage
5. **Plan v1.0.0**: Based on beta feedback

---

**Ready to deploy! 🚀** 
