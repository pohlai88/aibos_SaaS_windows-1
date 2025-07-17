# AI-BOS Enterprise npm Configuration

## Overview

This document describes the enterprise-grade npm configuration used in the AI-BOS platform, designed for maximum security, performance, and consistency across development and production environments.

## Configuration File: `.npmrc`

### Security Hardening

```bash
# Fail on critical vulnerabilities
audit-level=critical

# Enforce Node/npm version compliance
engine-strict=true

# Prevent loose peer dependency resolution
strict-peer-dependencies=true

# Only generate package-lock (no node_modules)
package-lock-only=true

# Ignore optional dependencies (security)
omit=optional

# Enforce SSL/TLS
strict-ssl=true
```

### Dependency Control

```bash
# Pin exact versions (1.2.3 not ^1.2.3)
save-exact=true

# Disallows any version flexibility
save-prefix=""

# Use latest lockfile format
lockfile-version=3

# Modern peer dependency resolution
legacy-peer-deps=false
```

### Performance Optimization

```bash
# Isolated cache directory
cache=.aibos-npm-cache

# Use cache when available
prefer-offline=true

# Optimize dependency tree
prefer-dedupe=true

# Controlled download concurrency
maxsockets=3

# Balance between reliability/speed
fetch-retries=2

# 10s minimum retry timeout
fetch-retry-mintimeout=10000
```

### Enterprise Compliance

```bash
# Only show critical errors
loglevel=error

# Disable colors for log parsing
color=false

# Ensure ASCII-only output
unicode=false

# Secure temp directory location
tmp=/var/tmp

# Prevent PATH hijacking
scripts-prepend-node-path=true
```

### CI/CD Enhancements

```bash
# CI-specific optimizations
ci=true

# Disable postinstall scripts in CI
ignore-scripts=true

# Safer script execution
foreground-scripts=false

# Force fresh checks in CI
offline=false
```

## Usage Scripts

### Validation Scripts

```bash
# Validate npm configuration
npm run npm:validate

# Validate and auto-fix issues
npm run npm:validate:fix

# Run enterprise audit with thresholds
npm run audit:enterprise

# Run CI audit
npm run audit:ci
```

### Security Audits

```bash
# Standard npm audit
npm run audit

# Full audit report
npm run audit:full

# Enterprise audit with failure on violations
npm run audit:enterprise
```

## Enterprise Thresholds

The AI-BOS platform enforces strict security thresholds:

- **Critical Vulnerabilities**: 0 (zero tolerance)
- **High Severity**: Maximum 5
- **Moderate Severity**: Maximum 20
- **Low Severity**: Monitored but not blocking

## Configuration Validation

### Automated Validation

The `npm:validate` script checks:

1. **Security Settings**: All critical security flags are set
2. **Performance Settings**: Optimized for enterprise networks
3. **Compliance Settings**: Logging and output formatting
4. **CI/CD Settings**: Production-ready CI configuration

### Validation Output

```bash
🔧 AI-BOS npm Configuration Validator
==================================================
📋 Loaded 25 npm settings

🔍 Validating enterprise settings...

📂 SECURITY Settings:
  ✅ audit-level=critical
  ✅ engine-strict=true
  ✅ strict-peer-dependencies=true
  ✅ package-lock-only=true
  ✅ omit=optional
  ✅ strict-ssl=true

📂 DEPENDENCY Settings:
  ✅ save-exact=true
  ✅ save-prefix=
  ✅ lockfile-version=3
  ✅ legacy-peer-deps=false

📊 Configuration Score:
   Score: 24/24 (100%)
   🏆 EXCELLENT - Enterprise-grade configuration
```

## Best Practices

### Development Workflow

1. **Always use exact versions**: Prevents dependency drift
2. **Run validation before commits**: Ensures configuration compliance
3. **Use enterprise audit**: Catches security issues early
4. **Monitor cache usage**: Optimize for your environment

### CI/CD Integration

```yaml
# Example GitHub Actions workflow
- name: Validate npm configuration
  run: npm run npm:validate

- name: Run enterprise security audit
  run: npm run audit:enterprise

- name: Build with validated config
  run: npm run build
```

### Environment-Specific Configuration

#### Development
```bash
# Override for development
loglevel=warn
color=true
ignore-scripts=false
```

#### Production
```bash
# Production overrides
loglevel=error
color=false
ignore-scripts=true
ci=true
```

## Troubleshooting

### Common Issues

1. **Peer dependency conflicts**
   ```bash
   # Check peer dependencies
   npm ls
   
   # Resolve conflicts
   npm install --legacy-peer-deps=false
   ```

2. **Cache issues**
   ```bash
   # Clear cache
   npm cache clean --force
   
   # Verify cache location
   npm config get cache
   ```

3. **Network timeouts**
   ```bash
   # Increase timeout for slow networks
   npm config set fetch-timeout 600000
   ```

### Performance Optimization

1. **Cache optimization**
   ```bash
   # Use isolated cache
   npm config set cache .aibos-npm-cache
   
   # Prefer offline when possible
   npm config set prefer-offline true
   ```

2. **Network optimization**
   ```bash
   # Control concurrency
   npm config set maxsockets 3
   
   # Configure retries
   npm config set fetch-retries 2
   ```

## Monitoring and Metrics

### Configuration Metrics

Track these metrics for optimal performance:

- **Cache hit rate**: Should be >80% in development
- **Installation time**: Should be <30s for typical projects
- **Audit pass rate**: Should be 100% for critical vulnerabilities
- **Configuration compliance**: Should be >95%

### Automated Monitoring

```bash
# Generate metrics report
npm run npm:validate > npm-metrics.log

# Track over time
echo "$(date): $(npm run npm:validate | grep 'Score:')" >> npm-metrics-history.log
```

## Security Considerations

### Token Management

```bash
# Use environment variables for tokens
export NPM_TOKEN=your_token_here
export INTERNAL_TOKEN=your_internal_token_here

# Never commit tokens to version control
echo "*.token" >> .gitignore
```

### Registry Security

```bash
# Verify registry SSL
npm config set strict-ssl true

# Use secure registries only
npm config set registry https://registry.npmjs.org/
```

## Migration Guide

### From Default Configuration

1. **Backup current config**
   ```bash
   cp ~/.npmrc ~/.npmrc.backup
   ```

2. **Apply enterprise settings**
   ```bash
   # Copy the enterprise .npmrc
   cp .npmrc ~/.npmrc
   ```

3. **Validate configuration**
   ```bash
   npm run npm:validate
   ```

4. **Test with existing projects**
   ```bash
   npm install
   npm run audit:enterprise
   ```

### From Legacy Configuration

1. **Remove deprecated settings**
   ```bash
   # Remove old settings
   npm config delete legacy-peer-deps
   npm config delete package-lock
   ```

2. **Update to new format**
   ```bash
   # Use new lockfile version
   npm config set lockfile-version 3
   ```

3. **Verify compatibility**
   ```bash
   npm run test:ci
   ```

## References

- [npm Configuration Documentation](https://docs.npmjs.com/cli/v8/using-npm/config)
- [npm Security Best Practices](https://docs.npmjs.com/about-audit-reports)
- [Enterprise npm Guidelines](https://docs.npmjs.com/enterprise-guidelines)

## Support

For issues with the AI-BOS npm configuration:

1. Run `npm run npm:validate` to identify issues
2. Check the troubleshooting section above
3. Review the validation report in `npm-config-validation-report.json`
4. Contact the AI-BOS team for enterprise-specific issues 
