# CI/CD Security Validation Setup

## Overview

This document describes the comprehensive security validation system integrated into the AI-BOS CI/CD pipeline to prevent secrets, build artifacts, and other sensitive files from being committed to the repository.

## Components

### 1. Security Validation Job

The CI pipeline includes a dedicated `security-validation` job that runs before all other jobs to ensure:

- **No secrets are committed**: Checks for API keys, passwords, tokens, and other sensitive data
- **No build artifacts**: Ensures `node_modules`, `dist`, `build`, `.next`, `coverage` directories are not tracked
- **No environment files**: Prevents `.env`, `.local`, `.secret` files from being committed
- **No hardcoded credentials**: Scans code for potential hardcoded passwords and API keys

### 2. Validation Scripts

#### Bash Script (`scripts/validate-secrets.sh`)

- Cross-platform validation script
- Checks for common secret patterns
- Provides detailed error messages and remediation steps
- Used in CI/CD and local development

#### PowerShell Script (`scripts/validate-secrets.ps1`)

- Windows-specific validation script
- Same functionality as bash script
- Used as fallback in Windows CI environments

### 3. Pre-commit Hook

The `.husky/pre-commit` hook provides early validation:

- Runs before each commit
- Checks staged files for build artifacts and environment files
- Prevents problematic commits from being created
- Provides clear error messages and remediation steps

## CI/CD Integration

### Job Dependencies

All major CI jobs now depend on `security-validation`:

```yaml
security-scan:
  needs: security-validation

code-quality:
  needs: security-validation

test:
  needs: security-validation
```

### Validation Steps

1. **Security Validation Job** (runs first)
   - Executes validation scripts
   - Checks git for build artifacts
   - Scans for environment files
   - Fails fast if issues are found

2. **Enhanced Security Scan** (runs after validation)
   - Additional security checks
   - CodeQL analysis
   - Snyk vulnerability scanning
   - Hardcoded credential detection

## Usage

### Local Development

1. **Install Husky** (if not already installed):

   ```bash
   npm install --save-dev husky
   npx husky install
   ```

2. **Manual Validation**:

   ```bash
   # Run bash script
   chmod +x scripts/validate-secrets.sh
   ./scripts/validate-secrets.sh

   # Run PowerShell script (Windows)
   .\scripts\validate-secrets.ps1
   ```

3. **Pre-commit Validation**:
   - Automatically runs on every commit
   - Can be bypassed with `git commit --no-verify` (not recommended)

### CI/CD Pipeline

The validation runs automatically on:

- **Push to main/develop branches**
- **Pull requests to main/develop branches**
- **All deployment stages**

## Error Handling

### Common Issues and Solutions

#### Build Artifacts in Git

```bash
# Error: Found build artifacts in git!
git rm -r --cached node_modules dist build .next coverage
git commit -m "Remove build artifacts from git"
```

#### Environment Files in Git

```bash
# Error: Found environment files in git!
git rm --cached *.env *.local *.secret
git commit -m "Remove environment files from git"
```

#### Hardcoded Secrets

```bash
# Error: Potential hardcoded passwords/API keys found
# Solution: Move to environment variables
# Before: const apiKey = "sk-1234567890abcdef"
# After: const apiKey = process.env.API_KEY
```

## Configuration

### Customizing Validation Rules

Edit `scripts/validate-secrets.sh` to add custom patterns:

```bash
# Add custom secret patterns
SECRET_PATTERNS+=(
  "your-custom-pattern"
)
```

### Excluding Files

Add exclusions to the validation scripts:

```bash
# Exclude test files from hardcoded secret checks
grep -r -i "password.*=.*['\"][^'\"]*['\"]" --include="*.ts" --exclude="*.test.ts" .
```

## Monitoring and Alerts

### CI/CD Notifications

- **Slack notifications** on validation failures
- **GitHub status checks** for each validation step
- **Detailed error logs** in CI/CD output

### Dashboard Integration

- **Security metrics** in deployment reports
- **Validation history** tracking
- **Trend analysis** for security issues

## Best Practices

### For Developers

1. **Always use environment variables** for secrets
2. **Never commit build artifacts**
3. **Use `.env.example`** for environment file templates
4. **Run validation locally** before pushing
5. **Review CI/CD logs** for security issues

### For DevOps

1. **Monitor validation failures** in CI/CD
2. **Review security alerts** regularly
3. **Update validation patterns** as needed
4. **Train team** on security practices
5. **Document exceptions** when necessary

## Troubleshooting

### Common Problems

1. **Script not found**: Ensure scripts are in the correct location
2. **Permission denied**: Make scripts executable with `chmod +x`
3. **False positives**: Adjust patterns in validation scripts
4. **CI/CD failures**: Check validation logs for specific issues

### Getting Help

- Check CI/CD logs for detailed error messages
- Review this documentation for common solutions
- Contact the DevOps team for complex issues
- Submit issues to the repository for script improvements

## Security Benefits

This validation system provides:

- **Early detection** of security issues
- **Automated compliance** checking
- **Consistent security** across environments
- **Reduced risk** of secret exposure
- **Improved developer** security awareness
- **Audit trail** for security validation

## Future Enhancements

Planned improvements:

- **Machine learning** pattern detection
- **Integration** with secret management services
- **Real-time** validation in IDEs
- **Advanced** credential scanning
- **Custom** validation rules per project
- **Performance** optimization for large repositories
