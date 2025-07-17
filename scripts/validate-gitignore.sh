#!/bin/bash
# ====================== #
#  AI-BOS Enterprise     #
#  .gitignore Validator  #
# ====================== #

set -e

echo "🔍 Validating .gitignore compliance..."

# Check for committed secrets
echo "  Checking for secrets..."
if git grep -l -E '\.(key|pem|cert|env|secret|p12|pfx|vault|kubeconfig)$' -- ':!*.gitignore' ':!scripts/validate-gitignore.sh'; then
  echo "❌ ERROR: Secrets detected in committed files"
  echo "   Please remove any .key, .pem, .cert, .env, .secret files"
  exit 1
fi

# Verify no build artifacts
echo "  Checking for build artifacts..."
if git ls-files | grep -E '(dist|build|node_modules|.next|.output|.cache|.turbo|.vite)/'; then
  echo "❌ ERROR: Build artifacts detected"
  echo "   Please remove any dist/, build/, node_modules/, .next/, .output/, .cache/, .turbo/, .vite/ directories"
  exit 1
fi

# Check for large files that shouldn't be committed
echo "  Checking for large files..."
LARGE_FILES=$(git ls-files | xargs ls -la 2>/dev/null | awk '$5 > 10485760 {print $9}' | head -5)
if [ -n "$LARGE_FILES" ]; then
  echo "⚠️  WARNING: Large files detected (>10MB):"
  echo "$LARGE_FILES"
  echo "   Consider using Git LFS for large files"
fi

# Check for common sensitive patterns
echo "  Checking for sensitive patterns..."
if git grep -l -E '(password|secret|token|api_key|private_key)' -- ':!*.gitignore' ':!scripts/validate-gitignore.sh' ':!CONTRIBUTING.md' ':!README.md'; then
  echo "⚠️  WARNING: Potential sensitive patterns detected"
  echo "   Please review files for hardcoded secrets"
fi

echo "✅ .gitignore validation passed!"
echo "   Your repository is clean and secure." 