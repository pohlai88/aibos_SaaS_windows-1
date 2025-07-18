#!/usr/bin/env node
/**
 * TypeScript Restore Protocol
 * Restores original strict TypeScript configuration after emergency deployment
 */

import fs from 'fs';

console.log('🔧 RESTORING: TypeScript strict configuration...');

const tsconfigPath = 'tsconfig.json';
const backupPath = 'tsconfig.emergency-backup.json';

try {
  if (!fs.existsSync(backupPath)) {
    console.log('❌ No emergency backup found. Nothing to restore.');
    process.exit(1);
  }

  // Restore from backup
  const originalConfig = fs.readFileSync(backupPath, 'utf8');
  fs.writeFileSync(tsconfigPath, originalConfig);

  // Clean up backup
  fs.unlinkSync(backupPath);

  console.log('✅ TypeScript strict configuration restored');
  console.log('🧹 Emergency backup cleaned up');
  console.log('\n⚠️  Run "npm run build" to verify all strict checks pass');

} catch (error) {
  console.error('❌ Restore failed:', error.message);
  process.exit(1);
}
