#!/usr/bin/env node

/**
 * AI-BOS TypeScript Syntax Fixer
 * Comprehensive tool for fixing TypeScript/React syntax errors in UI components
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Configure logging for colorful output (without chalk dependency)
const colors = {
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`
};

const log = {
  info: (msg) => console.log(colors.blue(`ℹ ${msg}`)),
  success: (msg) => console.log(colors.green(`✓ ${msg}`)),
  warn: (msg) => console.log(colors.yellow(`⚠ ${msg}`)),
  error: (msg) => console.log(colors.red(`✗ ${msg}`)),
  debug: (msg) => process.env.DEBUG && console.log(colors.gray(`🐛 ${msg}`))
};

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SHARED_DIR = path.join(__dirname, '..', 'shared');
const UI_COMPONENTS_DIR = path.join(SHARED_DIR, 'ui-components', 'src');

// Configuration
const config = {
  dryRun: process.argv.includes('--dry-run'),
  backup: !process.argv.includes('--no-backup'),
  verbose: process.argv.includes('--verbose'),
  debug: process.argv.includes('--debug')
};

// Enhanced fix patterns based on actual errors found
const syntaxFixes = [
  // Critical syntax fixes
  {
    name: 'stray-semicolons',
    description: 'Fixes stray semicolons in JSX and blocks',
    severity: 'critical',
    pattern: /;\s*\n\s*([{}\]])/g,
    replacement: '\n$1'
  },
  {
    name: 'malformed-object-properties',
    description: 'Fixes malformed object property syntax',
    severity: 'critical',
    pattern: /(\w+)\s*:\s*('[^']*'|"[^"]*"|\w+)\s*,\s*(\w+)\s*:/g,
    replacement: '$1: $2,\n  $3:'
  },
  {
    name: 'malformed-jsx-closing',
    description: 'Fixes malformed JSX closing tags',
    severity: 'critical',
    pattern: /\)\s*;\s*\n\s*\)/g,
    replacement: ')\n  )'
  },
  {
    name: 'malformed-hooks-empty',
    description: 'Fixes empty React hooks with stray semicolons',
    severity: 'critical',
    pattern: /(useEffect|useCallback|useMemo|useState)\(\s*\(\s*\)\s*=>\s*{\s*\n\s*;\s*\n\s*}/g,
    replacement: '$1(() => {\n  // Empty $1\n}, [])'
  },
  {
    name: 'malformed-hooks-with-semicolon',
    description: 'Fixes hooks with stray semicolons',
    severity: 'critical',
    pattern: /(useEffect|useCallback|useMemo|useState)\(\s*\(\s*\)\s*=>\s*{\s*\n\s*;\s*\n\s*([^}]*)\s*}/g,
    replacement: '$1(() => {\n  $2\n}, [])'
  },
  {
    name: 'malformed-arrow-functions',
    description: 'Fixes malformed arrow functions',
    severity: 'critical',
    pattern: /=>\s*{\s*\n\s*;/g,
    replacement: '=> {\n'
  },
  {
    name: 'malformed-function-calls',
    description: 'Fixes malformed function calls with double commas',
    severity: 'critical',
    pattern: /,\s*\n\s*,/g,
    replacement: ','
  },
  {
    name: 'malformed-imports',
    description: 'Fixes malformed import statements',
    severity: 'warning',
    pattern: /import\s+{\s*\n\s*import/g,
    replacement: 'import {\n'
  },
  {
    name: 'malformed-exports',
    description: 'Fixes malformed export statements',
    severity: 'warning',
    pattern: /export\s+{\s*\n\s*export/g,
    replacement: 'export {\n'
  },
  {
    name: 'malformed-interfaces',
    description: 'Fixes malformed TypeScript interfaces',
    severity: 'warning',
    pattern: /interface\s+(\w+)\s*{\s*\n\s*;/g,
    replacement: 'interface $1 {\n'
  },
  {
    name: 'malformed-types',
    description: 'Fixes malformed TypeScript type aliases',
    severity: 'warning',
    pattern: /type\s+(\w+)\s*=\s*\n\s*;/g,
    replacement: 'type $1 =\n'
  },
  {
    name: 'malformed-jsx-expressions',
    description: 'Fixes malformed JSX expressions',
    severity: 'critical',
    pattern: /\)\s*;\s*\n\s*\)\s*}/g,
    replacement: ')\n  )}'
  },
  {
    name: 'malformed-object-literals',
    description: 'Fixes malformed object literals in arrays',
    severity: 'critical',
    pattern: /\[\s*;\s*\n\s*{/g,
    replacement: '[\n  {'
  },
  {
    name: 'malformed-css-variables',
    description: 'Fixes malformed CSS variable assignments',
    severity: 'critical',
    pattern: /(\w+)\s*:\s*('[^']*'|"[^"]*")\s*,\s*\n\s*(\w+)\s*:/g,
    replacement: '$1: $2,\n  $3:'
  },
  {
    name: 'malformed-array-elements',
    description: 'Fixes malformed array elements',
    severity: 'critical',
    pattern: /,\s*\n\s*{\s*\n\s*(\w+)\s*:/g,
    replacement: ',\n  {\n    $1:'
  }
];

// Utility functions
async function findTypeScriptFiles(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      entries.map(entry => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          return findTypeScriptFiles(fullPath);
        }
        return entry.name.match(/\.(ts|tsx)$/) ? [fullPath] : [];
      })
    );
    return files.flat();
  } catch (error) {
    log.error(`Error reading directory ${dir}: ${error}`);
    return [];
  }
}

async function createBackup(filePath) {
  if (!config.backup) return;

  const backupPath = `${filePath}.bak`;
  try {
    await fs.copyFile(filePath, backupPath);
    log.debug(`Created backup: ${backupPath}`);
  } catch (error) {
    log.warn(`Failed to create backup for ${filePath}: ${error}`);
  }
}

async function processFile(filePath, stats) {
  try {
    const originalContent = await fs.readFile(filePath, 'utf8');
    let modifiedContent = originalContent;
    const appliedFixes = [];

    for (const fix of syntaxFixes) {
      if (fix.pattern.test(modifiedContent)) {
        const newContent = modifiedContent.replace(fix.pattern, fix.replacement);
        if (newContent !== modifiedContent) {
          modifiedContent = newContent;
          appliedFixes.push(fix.name);
          stats.patternsUsed[fix.name] = (stats.patternsUsed[fix.name] || 0) + 1;
        }
      }
    }

    if (modifiedContent !== originalContent) {
      stats.filesModified++;
      stats.fixesApplied += appliedFixes.length;

      if (config.verbose) {
        log.info(`Fixes applied to ${path.relative(UI_COMPONENTS_DIR, filePath)}:`);
        appliedFixes.forEach(fixName => {
          const fix = syntaxFixes.find(f => f.name === fixName);
          console.log(`  - ${fixName}: ${fix?.description}`);
        });
      }

      if (!config.dryRun) {
        await createBackup(filePath);
        await fs.writeFile(filePath, modifiedContent);
        log.success(`Fixed ${appliedFixes.length} issues in ${path.relative(UI_COMPONENTS_DIR, filePath)}`);
      } else {
        log.warn(`[DRY RUN] Would fix ${appliedFixes.length} issues in ${path.relative(UI_COMPONENTS_DIR, filePath)}`);
      }
    }
  } catch (error) {
    log.error(`Error processing file ${filePath}: ${error}`);
  }
}

// Main function
async function main() {
  log.info('Starting AI-BOS TypeScript syntax fixer');
  log.info(`Scanning directory: ${UI_COMPONENTS_DIR}`);

  const stats = {
    totalFiles: 0,
    filesModified: 0,
    fixesApplied: 0,
    patternsUsed: {}
  };

  if (config.dryRun) {
    log.warn('Running in dry-run mode - no files will be modified');
  }
  if (!config.backup) {
    log.warn('Backups are disabled - original files will not be preserved');
  }

  try {
    const files = await findTypeScriptFiles(UI_COMPONENTS_DIR);
    stats.totalFiles = files.length;

    if (files.length === 0) {
      log.warn('No TypeScript files found to process');
      return;
    }

    log.info(`Found ${files.length} TypeScript files to process`);

    for (const file of files) {
      await processFile(file, stats);
    }

    // Print summary
    console.log('\n=== AI-BOS Fix Summary ===');
    console.log(`Total files scanned: ${stats.totalFiles}`);
    console.log(`Files modified: ${stats.filesModified}`);
    console.log(`Total fixes applied: ${stats.fixesApplied}`);

    if (Object.keys(stats.patternsUsed).length > 0) {
      console.log('\nFix patterns used:');
      for (const [pattern, count] of Object.entries(stats.patternsUsed)) {
        console.log(`  ${pattern}: ${count} times`);
      }
    }

    if (config.dryRun) {
      log.warn('\nDRY RUN COMPLETE - No files were actually modified');
    } else {
      log.success('\nFix process completed successfully');
      log.info('Ready to proceed with Phase 3 implementation');
    }
  } catch (error) {
    log.error(`Fatal error during processing: ${error}`);
    process.exit(1);
  }
}

// Run the program
main().catch(err => {
  log.error(`Unhandled error: ${err}`);
  process.exit(1);
});
