#!/usr/bin/env node

/**
 * Legacy to Enterprise UI Components Migration Script
 * Automatically replaces legacy imports with enterprise equivalents
 *
 * @author AI-BOS Team
 * @version 1.0.0
 * @license MIT
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Migration mappings
const MIGRATION_MAP = {
  // Legacy imports to Enterprise imports
  "from 'shared/ui-components'": "from 'shared/ui-components-enterprise'",
  "from '@aibos/ui'": "from '@aibos/ui-enterprise'",
  "from './ui-components'": "from './ui-components-enterprise'",

  // Component-specific migrations
  "import { Button } from 'shared/ui-components'": "import { Button } from 'shared/ui-components-enterprise'",
  "import { Input } from 'shared/ui-components'": "import { Input } from 'shared/ui-components-enterprise'",
  "import { Badge } from 'shared/ui-components'": "import { Badge } from 'shared/ui-components-enterprise'",

  // HOC migrations
  "withCompliance": "withCompliance", // Same name, different package
  "withPerformance": "withPerformance", // Same name, different package

  // Provider migrations
  "ComplianceProvider": "ComplianceProvider", // Same name, different package
  "PerformanceProvider": "PerformanceProvider", // Same name, different package
};

// File patterns to process
const FILE_PATTERNS = [
  '**/*.tsx',
  '**/*.ts',
  '**/*.jsx',
  '**/*.js',
  '**/package.json'
];

// Directories to exclude
const EXCLUDE_DIRS = [
  'node_modules',
  'dist',
  'build',
  '.next',
  '.cache',
  'shared/ui-components-enterprise',
  '**/*.test.*',
  '**/*.spec.*',
  '**/__tests__/**'
];

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let newContent = content;

    // Apply migrations
    for (const [oldPattern, newPattern] of Object.entries(MIGRATION_MAP)) {
      if (content.includes(oldPattern)) {
        newContent = newContent.replace(new RegExp(oldPattern, 'g'), newPattern);
        modified = true;
        console.log(`  ✓ Replaced: ${oldPattern} → ${newPattern}`);
      }
    }

    // Special handling for package.json
    if (filePath.endsWith('package.json')) {
      const packageJson = JSON.parse(content);
      let pkgModified = false;

      // Update dependencies
      if (packageJson.dependencies && packageJson.dependencies['@aibos/ui']) {
        packageJson.dependencies['@aibos/ui-enterprise'] = packageJson.dependencies['@aibos/ui'];
        delete packageJson.dependencies['@aibos/ui'];
        pkgModified = true;
        console.log(`  ✓ Updated dependency: @aibos/ui → @aibos/ui-enterprise`);
      }

      if (packageJson.devDependencies && packageJson.devDependencies['@aibos/ui']) {
        packageJson.devDependencies['@aibos/ui-enterprise'] = packageJson.devDependencies['@aibos/ui'];
        delete packageJson.devDependencies['@aibos/ui'];
        pkgModified = true;
        console.log(`  ✓ Updated devDependency: @aibos/ui → @aibos/ui-enterprise`);
      }

      if (pkgModified) {
        newContent = JSON.stringify(packageJson, null, 2);
        modified = true;
      }
    }

    // Write back if modified
    if (modified) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      return true;
    }

    return false;
  } catch (error) {
    console.error(`  ✗ Error processing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Main migration function
 */
function migrate() {
  console.log('🚀 Starting Legacy to Enterprise UI Components Migration...\n');

  const cwd = process.cwd();
  let totalFiles = 0;
  let modifiedFiles = 0;

  // Find all files to process
  const files = glob.sync(FILE_PATTERNS, {
    cwd,
    ignore: EXCLUDE_DIRS,
    absolute: true
  });

  console.log(`📁 Found ${files.length} files to process\n`);

  // Process each file
  for (const file of files) {
    totalFiles++;
    const relativePath = path.relative(cwd, file);
    console.log(`Processing: ${relativePath}`);

    if (processFile(file)) {
      modifiedFiles++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Migration Summary:');
  console.log(`  Total files processed: ${totalFiles}`);
  console.log(`  Files modified: ${modifiedFiles}`);
  console.log(`  Files unchanged: ${totalFiles - modifiedFiles}`);
  console.log('='.repeat(60));

  if (modifiedFiles > 0) {
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('  1. Run "npm install" to install enterprise dependencies');
    console.log('  2. Run "npm run build" to verify everything compiles');
    console.log('  3. Run "npm test" to ensure tests pass');
    console.log('  4. Review the changes and commit');
  } else {
    console.log('\nℹ️  No files were modified. All imports are already up to date.');
  }
}

// Run migration if called directly
if (require.main === module) {
  migrate();
}

module.exports = { migrate, MIGRATION_MAP };
