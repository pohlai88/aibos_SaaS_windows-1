@echo off
echo Starting AI-BOS TypeScript Auto-Fix...

cd /d "%~dp0..\shared"

echo [1/4] Fixing HOC type casting issues...
npx tsx scripts/fix-hoc-types.mjs

echo [2/4] Cleaning duplicate exports...
npx tsx scripts/fix-duplicate-exports.mjs

echo [3/4] Resolving export paths...
npx tsx scripts/fix-export-paths.mjs

echo [4/4] Removing unused imports...
npx tsx scripts/fix-unused-imports.mjs

echo TypeScript fixes complete!
npm run type-check