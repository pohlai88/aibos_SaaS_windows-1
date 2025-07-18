#!/usr/bin/env node
/**
 * TypeScript Emergency Protocol
 * Temporarily relaxes strict TypeScript checks to enable builds during crisis situations
 */

import fs from 'fs';

console.log('🚨 EMERGENCY: Relaxing TypeScript strictness for emergency deployment...');

const tsconfigPath = 'tsconfig.json';
const backupPath = 'tsconfig.emergency-backup.json';

try {
  // Create backup
  const originalConfig = fs.readFileSync(tsconfigPath, 'utf8');
  fs.writeFileSync(backupPath, originalConfig);
  console.log('✅ Backed up original tsconfig.json');

  // Apply emergency relaxation using string replacement
  let emergencyConfig = originalConfig;

  const replacements = [
    // Strict type checking
    ['"strict": true', '"strict": false'],
    ['"noImplicitAny": true', '"noImplicitAny": false'],
    ['"strictNullChecks": true', '"strictNullChecks": false'],
    ['"noUnusedLocals": true', '"noUnusedLocals": false'],
    ['"noUnusedParameters": true', '"noUnusedParameters": false'],
    ['"exactOptionalPropertyTypes": true', '"exactOptionalPropertyTypes": false'],
    ['"noImplicitReturns": true', '"noImplicitReturns": false'],
    ['"noFallthroughCasesInSwitch": true', '"noFallthroughCasesInSwitch": false'],
    ['"verbatimModuleSyntax": true', '"verbatimModuleSyntax": false'],
    ['"noPropertyAccessFromIndexSignature": true', '"noPropertyAccessFromIndexSignature": false'],
    ['"noUncheckedIndexedAccess": true', '"noUncheckedIndexedAccess": false'],
    ['"strictFunctionTypes": true', '"strictFunctionTypes": false'],
    ['"strictBindCallApply": true', '"strictBindCallApply": false'],
    ['"strictPropertyInitialization": true', '"strictPropertyInitialization": false'],
    ['"noImplicitThis": true', '"noImplicitThis": false'],
    ['"noImplicitOverride": true', '"noImplicitOverride": false']
  ];

  // Apply all replacements
  for (const [search, replace] of replacements) {
    if (emergencyConfig.includes(search)) {
      emergencyConfig = emergencyConfig.replace(search, replace);
      console.log(`🩹 Relaxed: ${search} → ${replace}`);
    }
  }

  // Write emergency config
  fs.writeFileSync(tsconfigPath, emergencyConfig);

  console.log('\n✅ Emergency TypeScript configuration applied');
  console.log('\n⚠️  WARNING: This is a temporary fix for emergency deployment');
  console.log('   Run "node scripts/ts-restore.mjs" after deployment to restore strict checks');

} catch (error) {
  console.error('❌ Emergency protocol failed:', error.message);
  process.exit(1);
}
