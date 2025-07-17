#!/usr/bin/env bash
set -e

# AI-BOS Onboarding Validation Script
# Ensures every new developer/AI tool is compliant before first commit

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

function check {
  echo -e "\n$1"
  eval "$2"
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}PASS${NC}"
  else
    echo -e "${RED}FAIL${NC}"
    exit 1
  fi
}

echo "🚀 AI-BOS Onboarding Validation"
echo "=================================="

check "1. EditorConfig compliance..." "npx editorconfig-checker --exclude '.git|node_modules|dist|coverage'"
check "2. Prettier formatting..." "npx prettier --check ."
check "3. ESLint linting..." "npm run lint"
check "4. TypeScript type check..." "npx tsc --noEmit"
check "5. Test suite..." "npm run test:ci"

echo -e "\n${GREEN}🎉 Onboarding validation PASSED!${NC}"
