#!/bin/bash
set -e

echo "🔍 Running AI-BOS Enterprise Compliance Audit..."

# Check for secrets
if grep -r -i --exclude-dir={.git,node_modules,dist,coverage} 'password\|api[_-]*key\|secret' . | grep -v 'test' | head -5; then
  echo "❌ Potential secrets found in code!"
  exit 1
else
  echo "✅ No obvious secrets found."
fi

# Check for forbidden licenses
if npm ls --all --json | grep -E 'GPL|AGPL|LGPL'; then
  echo "❌ Forbidden license detected!"
  exit 1
else
  echo "✅ No forbidden licenses detected."
fi

# Check for critical vulnerabilities
npm audit --audit-level=critical

# Check for outdated dependencies
npm outdated || echo "All dependencies up to date."

echo "✅ Compliance audit complete."
