# Turbo Speed Enhancement Guide

## 🚀 Turbo Configuration Optimizations

### Enhanced Features Added:
- **Better Caching**: Added TypeScript build info caching
- **Environment Variables**: Optimized env var handling
- **Parallel Execution**: Enhanced parallel task execution
- **Fast Development**: Added `dev:fast` and `build:fast` tasks
- **Dependency Checking**: Improved dependency validation

## ⚡ Speed-Optimized Commands

### Development Commands:
```bash
# Fast development mode (recommended for daily coding)
pnpm dev:fast

# Regular development with all apps
pnpm dev

# Development for specific app types
pnpm dev:apps        # Only apps
pnpm dev:packages     # Only packages
```

### Build Commands:
```bash
# Fast build (optimized for speed)
pnpm build:fast

# Regular build
pnpm build

# Build specific parts
pnpm build:deps       # Only packages
pnpm build:apps       # Only apps
pnpm build:watch      # Watch mode
```

### Quality Assurance:
```bash
# Linting with auto-fix
pnpm lint:fix

# Type checking
pnpm type-check

# Testing
pnpm test:watch       # Watch mode
pnpm test:coverage    # Coverage report
```

### Maintenance:
```bash
# Clean everything
pnpm clean

# Clean cache only
pnpm clean:cache

# Check dependencies
pnpm check:deps
```

## 🎯 Performance Tips

### 1. Use Fast Commands for Daily Development:
- `pnpm dev:fast` - Optimized for speed
- `pnpm build:fast` - Faster builds
- `pnpm lint:fix` - Auto-fix linting issues

### 2. Leverage Parallel Execution:
- All commands run in parallel where possible
- Use `--parallel` flag for maximum speed
- Filter commands for specific workspaces

### 3. Smart Caching:
- TypeScript build info is cached
- Build outputs are properly tracked
- Cache invalidation is optimized

### 4. Environment Optimization:
- Global dependencies tracked
- Environment variables properly configured
- Build dependencies optimized

## 🔧 Advanced Usage

### Workspace Filtering:
```bash
# Run only on specific apps
turbo run build --filter=./apps/admin-app

# Run only on packages
turbo run build --filter=./packages/*

# Run with dependencies
turbo run build --filter=./apps/admin-app...
```

### Dry Runs:
```bash
# Check what would be built
turbo run build --dry-run

# Check dependencies
pnpm check-deps
```

### Cache Management:
```bash
# Clear all caches
pnpm clean:cache

# Clear specific cache
turbo run clean
```

## 📊 Monitoring Performance

### Check Build Performance:
```bash
# Analyze bundle size
pnpm analyze

# Check bundle composition
pnpm bundle
```

### Monitor Dependencies:
```bash
# Check dependency status
pnpm check:deps

# Validate ledger SDK
pnpm validate:ledger
```

## 🚨 Troubleshooting

### Common Issues:
1. **Cache Issues**: Run `pnpm clean:cache`
2. **Build Failures**: Check dependencies with `pnpm check:deps`
3. **Type Errors**: Run `pnpm type-check`
4. **Lint Errors**: Run `pnpm lint:fix`

### Performance Issues:
1. **Slow Builds**: Use `pnpm build:fast`
2. **Slow Dev**: Use `pnpm dev:fast`
3. **Memory Issues**: Clear cache with `pnpm clean:cache`

## 📈 Best Practices

1. **Use Fast Commands**: Prefer `dev:fast` and `build:fast` for daily work
2. **Parallel Execution**: Always use `--parallel` when possible
3. **Smart Filtering**: Use workspace filters to run only what you need
4. **Regular Maintenance**: Run `pnpm clean:cache` weekly
5. **Dependency Management**: Use `pnpm check:deps` before major changes

## 🎯 Quick Reference

| Task | Fast Command | Regular Command |
|------|-------------|-----------------|
| Development | `pnpm dev:fast` | `pnpm dev` |
| Build | `pnpm build:fast` | `pnpm build` |
| Lint | `pnpm lint:fix` | `pnpm lint` |
| Test | `pnpm test:watch` | `pnpm test` |
| Clean | `pnpm clean:cache` | `pnpm clean` |

This enhanced Turbo setup will significantly improve your coding speed and development workflow! 