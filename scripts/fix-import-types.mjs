#!/usr/bin/env node
/**
 * Fix Import Type Syntax Issues
 * Fixes "import type { cva, type VariantProps }" syntax errors
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function fixImportTypes(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Fix the problematic import pattern
    const oldPattern = /import type \{ cva, type VariantProps\s+\} from 'class-variance-authority';/g;
    const newPattern = `import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';`;

    if (oldPattern.test(content)) {
      content = content.replace(oldPattern, newPattern);
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walkDirectory(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fixImportTypes(fullPath);
    }
  }
}

// Fix all files in shared/ui-components
const uiComponentsPath = path.join(__dirname, '..', 'shared', 'ui-components', 'src');
console.log('🔧 Fixing import type syntax issues...');
walkDirectory(uiComponentsPath);

// Fix migration file duplicate export
const migrationFile = path.join(__dirname, '..', 'shared', 'types', 'metadata', 'metadata.migration.ts');
try {
  let content = fs.readFileSync(migrationFile, 'utf8');

  // Remove the duplicate export block
  content = content.replace(
    /export \{\s*MetadataMigrationDirection[^}]+\};\s*$/,
    '// All exports are already defined above as individual exports'
  );

  fs.writeFileSync(migrationFile, content);
  console.log('✅ Fixed metadata.migration.ts duplicate exports');
} catch (error) {
  console.error('❌ Error fixing migration file:', error.message);
}

console.log('🎉 Import type fixes completed!');
